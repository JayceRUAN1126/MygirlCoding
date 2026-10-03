import { openDB } from "idb";
import { createClient } from "@supabase/supabase-js";
import { defaults } from "./types";
import type { Memory, Media, Settings, Snapshot, Tracker } from "./types";
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const cloud = Boolean(url && key);
export const supabase = cloud ? createClient(url!, key!) : null;
const db = openDB("our-little-days-v1", 1, {
  upgrade(db) {
    db.createObjectStore("data");
  },
});
const fresh = (): Snapshot => ({
  memories: [],
  trackers: [],
  settings: { ...defaults },
});
async function localLoad(): Promise<Snapshot> {
  return (await (await db).get("data", "snapshot")) || fresh();
}
async function localSave(s: Snapshot) {
  await (await db).put("data", s, "snapshot");
  window.dispatchEvent(new Event("memories-update"));
}
let householdId: string | null = null;
export async function getHousehold() {
  if (householdId) return householdId;
  const { data, error } = await supabase!
    .from("household_members")
    .select("household_id")
    .single();
  if (error || !data)
    throw new Error("账户尚未加入双人空间，请先由项目管理员添加成员。");
  householdId = data.household_id;
  return householdId!;
}
export function resetHousehold() {
  householdId = null;
}
const signedCache = new Map<string, { url: string; expires: number }>();
async function hydrate(m: Media): Promise<Media> {
  if (m.blob) return { ...m, url: URL.createObjectURL(m.blob) };
  if (m.path && supabase) {
    const cached = signedCache.get(m.path);
    if (cached && cached.expires > Date.now()) return { ...m, url: cached.url };
    const { data, error } = await supabase.storage
      .from("memories")
      .createSignedUrl(m.path, 3600);
    if (error) throw error;
    signedCache.set(m.path, {
      url: data.signedUrl,
      expires: Date.now() + 3300000,
    });
    return { ...m, url: data.signedUrl };
  }
  return m;
}
export async function load(): Promise<Snapshot> {
  let snapshot: Snapshot;
  if (supabase) {
    const household = await getHousehold();
    const [a, b, c] = await Promise.all([
      supabase
        .from("memories")
        .select("*")
        .eq("household_id", household)
        .order("date", { ascending: false }),
      supabase.from("trackers").select("*").eq("household_id", household),
      supabase
        .from("households")
        .select("settings")
        .eq("id", household)
        .single(),
    ]);
    for (const r of [a, b, c]) if (r.error) throw r.error;
    snapshot = {
      memories: a.data as Memory[],
      trackers: b.data as Tracker[],
      settings: { ...defaults, ...c.data!.settings },
    };
  } else snapshot = await localLoad();
  return {
    ...snapshot,
    memories: await Promise.all(
      snapshot.memories.map(async (m) => ({
        ...m,
        media: await Promise.all(m.media.map(hydrate)),
      })),
    ),
  };
}
export function release(s: Snapshot) {
  for (const m of s.memories)
    for (const f of m.media)
      if (f.url?.startsWith("blob:")) URL.revokeObjectURL(f.url);
}
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
async function compress(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return file;
  const image = await createImageBitmap(file);
  const ratio = Math.min(1, 2048 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("照片压缩失败"))),
      "image/webp",
      0.86,
    ),
  );
  return blob;
}
export async function saveMemory(
  memory: Memory,
  files: File[],
  onProgress: (p: number) => void,
) {
  for (const file of files) {
    if (!acceptedTypes.includes(file.type))
      throw new Error(
        "请上传 JPG、PNG、WebP、GIF，或 MP4、WebM、MOV。HEIC 请先转成 JPG。",
      );
    if (file.size > MAX_FILE_BYTES)
      throw new Error(`${file.name} 超过 50 MB，请先压缩视频或照片。`);
  }
  const household = supabase ? await getHousehold() : null;
  const added: Media[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blob = await compress(file);
      const id = crypto.randomUUID();
      const media: Media = {
        id,
        name: file.name,
        type: blob.type,
        size: blob.size,
      };
      if (supabase) {
        const ext = blob.type.split("/")[1].replace("quicktime", "mov");
        const path = `${household}/${memory.id}/${id}.${ext}`;
        const { error } = await supabase.storage
          .from("memories")
          .upload(path, blob, { contentType: blob.type, upsert: false });
        if (error) throw error;
        media.path = path;
      } else media.blob = blob;
      added.push(media);
      onProgress(Math.round(((i + 1) / files.length) * 90));
    }
    const allMedia = [
      ...memory.media.map(({ url, ...rest }) => rest),
      ...added,
    ];
    const updated = { ...memory, media: allMedia };
    if (supabase) {
      const { error } = await supabase
        .from("memories")
        .upsert({ ...updated, household_id: household });
      if (error) throw error;
    } else {
      const s = await localLoad();
      s.memories = [updated, ...s.memories.filter((m) => m.id !== memory.id)];
      await localSave(s);
    }
    onProgress(100);
  } catch (error) {
    if (supabase && added.length)
      await supabase.storage.from("memories").remove(added.map((m) => m.path!));
    throw error;
  }
}
export async function deleteMemory(memory: Memory) {
  if (supabase) {
    // Delete media first so a failed storage deletion leaves a visible record for retry.
    const paths = memory.media.filter((m) => m.path).map((m) => m.path!);
    if (paths.length) {
      const { error } = await supabase.storage.from("memories").remove(paths);
      if (error) throw error;
    }
    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", memory.id);
    if (error) throw error;
  } else {
    const s = await localLoad();
    s.memories = s.memories.filter((m) => m.id !== memory.id);
    await localSave(s);
  }
}
export async function saveTracker(t: Tracker) {
  if (supabase) {
    const { error } = await supabase
      .from("trackers")
      .upsert({ ...t, household_id: await getHousehold() });
    if (error) throw error;
  } else {
    const s = await localLoad();
    s.trackers = [t, ...s.trackers.filter((r) => r.id !== t.id)];
    await localSave(s);
  }
}
export async function deleteTracker(id: string) {
  if (supabase) {
    const { error } = await supabase.from("trackers").delete().eq("id", id);
    if (error) throw error;
  } else {
    const s = await localLoad();
    s.trackers = s.trackers.filter((r) => r.id !== id);
    await localSave(s);
  }
}
export async function saveSettings(settings: Settings) {
  if (supabase) {
    const { error } = await supabase
      .from("households")
      .update({ settings })
      .eq("id", await getHousehold());
    if (error) throw error;
  } else {
    const s = await localLoad();
    s.settings = settings;
    await localSave(s);
  }
}
export function subscribe(callback: () => void) {
  const onFocus = () => callback();
  window.addEventListener("focus", onFocus);
  window.addEventListener("memories-update", callback);
  const channel = supabase
    ?.channel("our-space")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "memories" },
      callback,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "trackers" },
      callback,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "households" },
      callback,
    )
    .subscribe();
  const interval = supabase
    ? window.setInterval(callback, 30 * 60 * 1000)
    : null;
  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("memories-update", callback);
    if (channel) supabase?.removeChannel(channel);
    if (interval) clearInterval(interval);
  };
}
