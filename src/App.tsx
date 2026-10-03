import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Heart,
  LayoutDashboard,
  Images,
  BookHeart,
  PawPrint,
  Activity,
  Settings as SettingsIcon,
  Plus,
  ArrowUpRight,
  ArrowRight,
  LockKeyhole,
  X,
  Check,
  ChevronRight,
  LogOut,
  Search,
  ImagePlus,
  Play,
  Pencil,
  Trash2,
  Camera,
  Flower2,
  Clock3,
  Download,
  Cloud,
  ShieldCheck,
  Coffee,
  MessageCircleHeart,
  LoaderCircle,
  CircleAlert,
  ChevronLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CatArt } from "./Art";
import { Brand, Dashboard, MemoryCard, SeaScene, defaultCover } from "./Story";
import type { Page } from "./Story";
import { SceneControls } from "./Atmosphere";
import type { Appearance } from "./Atmosphere";
import type { Category, Memory, Settings, Snapshot } from "./types";
import { categoryLabels, defaults } from "./types";
import { age, civilDay, periodStats, workRate } from "./dates.mjs";
import * as store from "./store";

const pages: { id: Page; label: string; en: string; icon: LucideIcon }[] = [
  {
    id: "dashboard",
    label: "我们的日常",
    en: "OUR LITTLE DAYS",
    icon: LayoutDashboard,
  },
  { id: "album", label: "回忆相册", en: "COLLECTED MOMENTS", icon: Images },
  {
    id: "diary",
    label: "两个人的日记",
    en: "WORDS BETWEEN US",
    icon: BookHeart,
  },
  {
    id: "care",
    label: "好好照顾彼此",
    en: "A LITTLE MORE CARE",
    icon: Activity,
  },
  { id: "mini", label: "mini 的小世界", en: "LIFE WITH MINI", icon: PawPrint },
];
const icons: Record<Category, LucideIcon> = {
  daily: Coffee,
  sweet: Heart,
  conflict: MessageCircleHeart,
  thought: BookHeart,
  mini: PawPrint,
};
const prettyDate = (value: string) => (value ? value.replaceAll("-", ".") : "");
const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String(error.message)
      : "暂时没有保存成功，请重试。";
const localAllowed = import.meta.env.DEV;
function Button({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      className={`button ${secondary ? "secondary" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      aria-labelledby={titleId}
      className={`modal ${wide ? "wide" : ""}`}
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="modal-inner"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
      >
        <header>
          <div>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className="icon-button" aria-label="关闭" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </motion.div>
    </dialog>
  );
}
function Empty({
  icon: Icon = Camera,
  title = "第一张照片，就从今天开始。",
  text = "不用等一个特别的日子，今天就可以留一张。",
  action,
  onClick,
}: {
  icon?: LucideIcon;
  title?: string;
  text?: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={27} strokeWidth={1.3} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <Button secondary onClick={onClick}>
          <Plus size={15} />
          {action}
        </Button>
      )}
    </div>
  );
}
function Login({ notConfigured = false }: { notConfigured?: boolean }) {
  const [appearance, setAppearance] = useState<Appearance>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("our-little-days-login-appearance") || "null",
      );
      if (saved && ["coast", "dawn", "night"].includes(saved.atmosphere))
        return {
          atmosphere: saved.atmosphere,
          ambientMotion: saved.ambientMotion !== false,
        };
    } catch {
      /* The login page also works when browser storage is unavailable. */
    }
    return { atmosphere: "coast", ambientMotion: true };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const { error } = await store.supabase!.auth.signInWithPassword({
        email: String(f.get("email")),
        password: String(f.get("password")),
      });
      if (error) throw error;
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login depth-login" data-atmosphere={appearance.atmosphere}>
      <SeaScene className="login-scene" alt="海面与晚霞" {...appearance}>
        <Brand />
        <div className="login-heading">
          <p>For all the days to come.</p>
          <h1>
            关于我们，
            <br />
            还想写很久。
          </h1>
          <span>
            最近的照片，没说完的话。
            <br />
            都放在这里。
          </span>
        </div>
        <div className="login-note">
          <SceneControls
            {...appearance}
            onChange={(patch) => {
              const next = { ...appearance, ...patch };
              setAppearance(next);
              try {
                localStorage.setItem(
                  "our-little-days-login-appearance",
                  JSON.stringify(next),
                );
              } catch {
                /* Appearance is optional. */
              }
            }}
          />
        </div>
      </SeaScene>
      <div className="login-panel">
        <section className="login-form">
          <span className="lock-mark">
            <LockKeyhole size={22} strokeWidth={1.3} />
          </span>
          <p className="section-caption">A place for us</p>
          <h2>{notConfigured ? "小家正在准备中。" : "你来啦。"}</h2>
          <p>
            {notConfigured
              ? "等我们安顿好，一起回来。"
              : "登录，看看最近的我们。"}
          </p>
          {notConfigured ? (
            <div className="setup-note">
              <ShieldCheck size={21} />
              <span>
                私人空间尚未开放
                <br />
                <small>请由管理员完成账户配置后再登录。</small>
              </span>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label>
                邮箱
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="你的登录邮箱"
                  required
                />
              </label>
              <label>
                密码
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="输入密码"
                  minLength={6}
                  required
                />
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error === "Invalid login credentials"
                    ? "邮箱或密码不正确，请检查后重试。"
                    : error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Heart size={17} strokeWidth={1.5} />
                )}
                进入我们的空间
                <ArrowRight size={16} />
              </Button>
              <p className="micro">使用管理员为你创建的账户登录。</p>
            </form>
          )}
          <div className="login-footer">
            <span className="status-dot" />
            照片、日记与记录，仅你们可见
          </div>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const [authReady, setAuthReady] = useState(!store.cloud);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!store.supabase) return;
    let alive = true;
    store.supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setSignedIn(!!data.session);
        setAuthReady(true);
      }
    });
    const { data } = store.supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSignedIn(!!session);
        setAuthReady(true);
        if (!session) store.resetHousehold();
      },
    );
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  if (!authReady)
    return (
      <div className="loading-screen">
        <Heart className="pulse" />
        正在打开我们的小家…
      </div>
    );
  if (store.cloud && !signedIn) return <Login />;
  if (!store.cloud && !localAllowed) return <Login notConfigured />;
  return <Home key={signedIn ? "cloud" : "local"} />;
}
function Home() {
  const [page, setPage] = useState<Page>("dashboard");
  const [snapshot, setSnapshot] = useState<Snapshot>({
    memories: [],
    trackers: [],
    settings: defaults,
  });
  const stateRef = useRef(snapshot);
  const loadingVersion = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [coverPicker, setCoverPicker] = useState(false);
  const [appearanceDraft, setAppearanceDraft] = useState<Appearance | null>(
    null,
  );
  const [appearanceBusy, setAppearanceBusy] = useState(false);
  const [composer, setComposer] = useState<{
    category: Category;
    entry?: Memory;
  } | null>(null);
  const [detail, setDetail] = useState<Memory | null>(null);
  const [tracker, setTracker] = useState<"period" | "work" | null>(null);
  const [now, setNow] = useState(new Date());
  const reduce = useReducedMotion();
  const refresh = useCallback(async () => {
    const version = ++loadingVersion.current;
    try {
      const data = await store.load();
      if (version !== loadingVersion.current) {
        store.release(data);
        return;
      }
      store.release(stateRef.current);
      stateRef.current = data;
      setSnapshot(data);
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(errorText(e));
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    refresh();
    const unsubscribe = store.subscribe(refresh);
    return () => {
      unsubscribe();
      loadingVersion.current++;
      store.release(stateRef.current);
    };
  }, [refresh]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  const today = civilDay(snapshot.settings.timezone, now);
  const appearance: Appearance = appearanceDraft || {
    atmosphere: snapshot.settings.atmosphere || "coast",
    ambientMotion: snapshot.settings.ambientMotion !== false,
  };
  async function changeAppearance(patch: Partial<Appearance>) {
    if (appearanceBusy) return;
    const next = { ...appearance, ...patch };
    setAppearanceDraft(next);
    setAppearanceBusy(true);
    try {
      await store.saveSettings({ ...stateRef.current.settings, ...next });
      await refresh();
      setToast("背景偏好已保存");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setAppearanceDraft(null);
      setAppearanceBusy(false);
    }
  }
  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  async function saved() {
    await refresh();
    setComposer(null);
    setTracker(null);
    setToast(store.cloud ? "这段回忆，存好了" : "已保存在当前浏览器");
  }
  const newMemory = (category: Category = "daily") => setComposer({ category });
  return (
    <div
      className={"app-shell depth-app page-" + page}
      data-atmosphere={appearance.atmosphere}
      data-motion={appearance.ambientMotion && !reduce ? "on" : "off"}
    >
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <header className="site-header">
        <button
          className="brand-home"
          aria-label="返回我们的日常"
          onClick={() => navigate("dashboard")}
        >
          <Brand />
        </button>
        <nav className="primary-nav" aria-label="主导航">
          {pages.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              aria-current={page === id ? "page" : undefined}
              aria-label={label}
              onClick={() => navigate(id)}
            >
              {page === id && (
                <motion.span
                  className="nav-selection"
                  layoutId="navigation"
                  transition={{ type: "spring", stiffness: 400, damping: 36 }}
                />
              )}
              <Icon size={18} strokeWidth={1.6} />
              <span>
                {id === "dashboard"
                  ? "日常"
                  : id === "album"
                    ? "相册"
                    : id === "diary"
                      ? "日记"
                      : id === "care"
                        ? "关心"
                        : "mini"}
              </span>
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <span className="private-badge">
            <LockKeyhole size={12} />
            只有我们
          </span>
          <button
            className={"round-button " + (page === "settings" ? "active" : "")}
            aria-label="空间设置"
            onClick={() => navigate("settings")}
          >
            <SettingsIcon size={18} strokeWidth={1.6} />
          </button>
          {store.cloud && (
            <button
              className="round-button logout"
              aria-label="退出登录"
              onClick={() => store.supabase!.auth.signOut()}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </header>
      <div className="main-area">
        <main className="content" id="main-content">
          {page !== "dashboard" && (
            <div className="page-heading">
              <div>
                <h1>
                  {page === "album"
                    ? "镜头里的我们。"
                    : page === "diary"
                      ? "写给我们。"
                      : page === "care"
                        ? "把关心，放进日常。"
                        : page === "mini"
                          ? "mini 的小世界。"
                          : "让这里，更像我们。"}
                </h1>
                <p>
                  {page === "album"
                    ? "一起走过的路，还有每次镜头转向你。"
                    : page === "diary"
                      ? "开心的时候写，不开心的时候也写。"
                      : page === "care"
                        ? "慢慢了解彼此的节奏。"
                        : page === "mini"
                          ? "小小的爪印，大大的存在感。"
                          : "属于我们的名字、日子，和生活习惯。"}
                </p>
              </div>
              {page !== "settings" && page !== "care" && (
                <Button
                  onClick={() => newMemory(page === "mini" ? "mini" : "daily")}
                >
                  <Plus size={17} />
                  {page === "diary" ? "写一篇日记" : "记录这一刻"}
                </Button>
              )}
            </div>
          )}
          {error && (
            <div className="error-banner" role="alert">
              <CircleAlert size={18} />
              <span>{error}</span>
              <button onClick={refresh}>重试</button>
            </div>
          )}
          {!loaded ? (
            <div className="loading-screen">
              <LoaderCircle className="spin" />
              回忆正在路上…
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {page === "dashboard" && (
                  <Dashboard
                    data={snapshot}
                    today={today}
                    now={now}
                    navigate={navigate}
                    create={newMemory}
                    open={setDetail}
                    chooseCover={() => setCoverPicker(true)}
                    appearance={appearance}
                    changeAppearance={changeAppearance}
                    appearanceBusy={appearanceBusy}
                  />
                )}
                {(page === "album" || page === "diary" || page === "mini") && (
                  <MemoryPage
                    page={page}
                    data={snapshot}
                    today={today}
                    create={newMemory}
                    open={setDetail}
                    navigate={navigate}
                  />
                )}
                {page === "care" && (
                  <Care
                    data={snapshot}
                    today={today}
                    add={setTracker}
                    refresh={refresh}
                    notice={setToast}
                  />
                )}
                {page === "settings" && (
                  <SettingsPage
                    data={snapshot}
                    refresh={refresh}
                    notice={setToast}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
          {!store.cloud && (
            <div className="local-notice">
              <span>
                <span className="status-dot" />
                本机设计预览 · 内容仅保存在当前浏览器
              </span>
              <button onClick={() => navigate("settings")}>
                存储说明
                <ArrowUpRight size={13} />
              </button>
            </div>
          )}
          <footer className="site-footer">
            <span>
              Our little days. <span className="footer-dash" />{" "}
              今天、明天，和你。
            </span>
            <span>
              你、我，还有 mini <Heart size={11} />
            </span>
          </footer>
        </main>
      </div>
      {coverPicker && (
        <CoverPicker
          data={snapshot}
          onClose={() => setCoverPicker(false)}
          onCreate={() => {
            setCoverPicker(false);
            newMemory();
          }}
          onSave={async (coverMediaId) => {
            await store.saveSettings({
              ...stateRef.current.settings,
              coverMediaId,
              atmosphere: "coast",
            });
            await refresh();
            setCoverPicker(false);
            setToast("首页封面已更新");
          }}
        />
      )}
      {composer && (
        <Composer
          category={composer.category}
          entry={composer.entry}
          today={today}
          onClose={() => setComposer(null)}
          onSaved={saved}
        />
      )}
      {detail && (
        <MemoryDetail
          memory={snapshot.memories.find((m) => m.id === detail.id) || detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setComposer({
              category: detail.category,
              entry:
                snapshot.memories.find((m) => m.id === detail.id) || detail,
            });
            setDetail(null);
          }}
          onDelete={async () => {
            await store.deleteMemory(detail);
            setDetail(null);
            await refresh();
            setToast("这段记录已删除");
          }}
        />
      )}
      {tracker && (
        <TrackerForm
          kind={tracker}
          data={snapshot}
          today={today}
          onClose={() => setTracker(null)}
          onSaved={saved}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function CoverPicker({
  data,
  onClose,
  onCreate,
  onSave,
}: {
  data: Snapshot;
  onClose: () => void;
  onCreate: () => void;
  onSave: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photos = data.memories.flatMap((memory) =>
    memory.media
      .filter((m) => m.type.startsWith("image/"))
      .map((media) => ({ ...media, title: memory.title })),
  );
  const currentCover = photos.some(
    (photo) => photo.id === data.settings.coverMediaId,
  )
    ? data.settings.coverMediaId
    : "";
  async function select(id: string) {
    setBusy(true);
    setError("");
    try {
      await onSave(id);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="选一张，作为我们的封面。"
      onClose={() => {
        if (!busy) onClose();
      }}
      wide
    >
      <p className="cover-help">
        从相册中选择一张照片，它会出现在登录后的首页。
      </p>
      <div className="cover-options">
        <button
          disabled={busy}
          className={!currentCover ? "selected" : ""}
          aria-pressed={!currentCover}
          onClick={() => select("")}
        >
          <img src={defaultCover} alt="默认海边封面" />
          <span>海边的晚霞 {!currentCover && <Check size={15} />}</span>
        </button>
        {photos.map((photo) => (
          <button
            disabled={busy}
            key={photo.id}
            className={currentCover === photo.id ? "selected" : ""}
            aria-label={
              "使用「" + photo.title + "」中的 " + photo.name + " 作为封面"
            }
            aria-pressed={currentCover === photo.id}
            onClick={() => select(photo.id)}
          >
            <img src={photo.url} alt={photo.title} />
            <span>
              {photo.title}
              {currentCover === photo.id && <Check size={15} />}
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="button secondary cover-upload"
        onClick={onCreate}
      >
        <ImagePlus size={16} />
        上传一张新照片
      </button>
    </Modal>
  );
}

function MemoryPage({
  page,
  data,
  today,
  create,
  open,
  navigate,
}: {
  page: "album" | "diary" | "mini";
  data: Snapshot;
  today: string;
  create: (c: Category) => void;
  open: (m: Memory) => void;
  navigate: (p: Page) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const pet = age(data.settings.petBirthday, today);
  const memories = data.memories
    .filter(
      (m) =>
        (page === "mini"
          ? m.category === "mini"
          : page === "album"
            ? m.media.length > 0
            : !!m.text) &&
        (filter === "all" || m.category === filter) &&
        `${m.title} ${m.text}`.toLowerCase().includes(query.toLowerCase()) &&
        (mediaFilter === "all" ||
          m.media.some((f) => f.type.startsWith(mediaFilter))),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.created_at.localeCompare(a.created_at),
    );
  return (
    <>
      {page === "mini" && (
        <section className="pet-hero">
          <div>
            <span className="section-caption">Our smallest family member</span>
            <h2>
              陪 mini，
              <br />
              再长大<em>一点。</em>
            </h2>
            <p>
              暹罗猫 · 生日 {prettyDate(data.settings.petBirthday) || "待填写"}
            </p>
            <div className="pet-age">
              <strong>{pet?.days ?? "—"}</strong>
              <span>
                天的小生命
                <small>
                  {pet
                    ? `${pet.years} 岁 ${pet.months} 个月`
                    : "去设置里填写生日"}
                </small>
              </span>
            </div>
            <button className="text-link" onClick={() => navigate("settings")}>
              修改生日
              <ArrowUpRight size={13} />
            </button>
          </div>
          <CatArt className="pet-large" />
          <span className="pet-handwriting" aria-hidden="true">
            little paws,
            <br />
            big love.
          </span>
        </section>
      )}
      <div className="filter-bar">
        <div className="filter-tabs" aria-label="按内容分类">
          <button
            className={filter === "all" ? "active" : ""}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            全部{page === "mini" ? "成长" : ""}
          </button>
          {page !== "mini" &&
            (
              ["daily", "sweet", "thought", "conflict", "mini"] as Category[]
            ).map((c) => (
              <button
                className={filter === c ? "active" : ""}
                aria-pressed={filter === c}
                key={c}
                onClick={() => setFilter(c)}
              >
                {categoryLabels[c]}
              </button>
            ))}
        </div>
        <label className="search">
          <Search size={16} />
          <input
            aria-label="搜索回忆"
            placeholder="搜索一段回忆…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {page === "album" && (
        <div className="album-meta">
          <span>{memories.length} 段回忆</span>
          <select
            aria-label="媒体类型"
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
          >
            <option value="all">照片和视频</option>
            <option value="image/">只看照片</option>
            <option value="video/">只看视频</option>
          </select>
        </div>
      )}
      {memories.length ? (
        <div
          className={
            "memory-grid " +
            (page === "diary"
              ? "journal-grid"
              : memories.length === 1
                ? "single-memory"
                : "")
          }
        >
          {memories.map((m) => (
            <MemoryCard memory={m} key={m.id} onClick={() => open(m)} />
          ))}
        </div>
      ) : (
        <Empty
          icon={
            page === "mini" ? PawPrint : page === "diary" ? BookHeart : Camera
          }
          title={
            query || filter !== "all"
              ? "还没有找到这段回忆"
              : page === "mini"
                ? "收藏 mini 的第一个小脚印"
                : page === "diary"
                  ? "今天，有什么想对彼此说？"
                  : undefined
          }
          text={
            page === "mini"
              ? "睡觉、撒娇、拆家。每一天都值得记录。"
              : page === "diary"
                ? "写写今天发生的事，也写写还没说出口的话。"
                : undefined
          }
          action={page === "diary" ? "写第一篇日记" : "上传照片或视频"}
          onClick={() => create(page === "mini" ? "mini" : "daily")}
        />
      )}
    </>
  );
}

function Composer({
  category,
  entry,
  today,
  onClose,
  onSaved,
}: {
  category: Category;
  entry?: Memory;
  today: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [selected, setSelected] = useState(entry?.category || category);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);
  function addFiles(incoming: File[]) {
    setError("");
    for (const f of incoming) {
      if (!store.acceptedTypes.includes(f.type)) {
        setError(
          "支持 JPG、PNG、WebP、GIF、MP4、WebM、MOV。HEIC 请先转为 JPG。",
        );
        return;
      }
      if (f.size > store.MAX_FILE_BYTES) {
        setError(`${f.name} 超过 50 MB，请先压缩。`);
        return;
      }
    }
    if (files.length + incoming.length + (entry?.media.length || 0) > 12) {
      setError("每段回忆最多 12 个文件，可以分成多段保存。");
      return;
    }
    setFiles([...files, ...incoming]);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      !String(f.get("text")).trim() &&
      !files.length &&
      !entry?.media.length
    ) {
      setError("写一点文字，或添加一张照片 / 一段视频吧。");
      return;
    }
    if (!String(f.get("title")).trim()) {
      setError("给这段回忆起一个名字吧。");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const memory: Memory = {
        id: entry?.id || crypto.randomUUID(),
        title: String(f.get("title")).trim(),
        text: String(f.get("text")).trim(),
        date: String(f.get("date")),
        category: selected,
        media: entry?.media || [],
        resolved: f.get("resolved") === "on",
        created_at: entry?.created_at || new Date().toISOString(),
      };
      await store.saveMemory(memory, files, setProgress);
      await onSaved();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={entry ? "编辑这段回忆" : "把这一刻，留在这里。"}
      onClose={() => {
        if (!busy) onClose();
      }}
      wide
    >
      <form onSubmit={submit} className="editor-form">
        <div className="category-picker">
          {(Object.keys(categoryLabels) as Category[]).map((c) => {
            const Icon = icons[c];
            return (
              <button
                className={selected === c ? "selected" : ""}
                aria-pressed={selected === c}
                key={c}
                type="button"
                onClick={() => setSelected(c)}
              >
                <Icon size={15} />
                {categoryLabels[c]}
              </button>
            );
          })}
        </div>
        <div className="form-row">
          <label className="grow">
            给回忆起个名字
            <input
              name="title"
              defaultValue={entry?.title}
              placeholder={
                selected === "mini"
                  ? "例如：mini 第一次晒太阳"
                  : "例如：今天也一起看了日落"
              }
              maxLength={100}
              required
              data-initial-focus
            />
          </label>
          <label>
            发生在
            <input
              name="date"
              type="date"
              defaultValue={entry?.date || today}
              max={today}
              required
            />
          </label>
        </div>
        <label>
          {selected === "conflict"
            ? "发生了什么？希望怎样被理解？"
            : "想写下的话"}
          <textarea
            name="text"
            defaultValue={entry?.text}
            rows={5}
            maxLength={20000}
            placeholder={
              selected === "conflict"
                ? "记录事情、自己的感受，以及想一起改进的地方。"
                : "今天发生的小事、当时的心情，或一句想对你说的话…"
            }
          />
        </label>
        {selected === "conflict" && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="resolved"
              defaultChecked={entry?.resolved}
            />
            <span>我们已经聊开，和好啦</span>
            <Heart size={15} />
          </label>
        )}
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept={store.acceptedTypes.join(",")}
          multiple
          aria-label="选择照片或视频"
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className={`upload-zone ${drag ? "drag" : ""}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <span className="upload-icon">
            <ImagePlus size={23} />
          </span>
          <strong>添加照片 / 视频</strong>
          <span>点击选择，也可以拖到这里</span>
          <small>每个文件 ≤ 50 MB · 照片自动优化 · 最多 12 个</small>
        </button>
        {(files.length > 0 || !!entry?.media.length) && (
          <div className="file-previews">
            {entry?.media.map((f) => (
              <div key={f.id}>
                {f.type.startsWith("image/") ? (
                  <img src={f.url} alt={f.name} />
                ) : (
                  <Play />
                )}
                <small>已收藏</small>
              </div>
            ))}
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`}>
                {f.type.startsWith("image/") ? (
                  <img src={previews[i]} alt={f.name} />
                ) : (
                  <Play />
                )}
                <button
                  type="button"
                  aria-label={`移除 ${f.name}`}
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                >
                  <X size={12} />
                </button>
                <small>{(f.size / 1024 / 1024).toFixed(1)} MB</small>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {busy && <progress max={100} value={progress} aria-label="上传进度" />}
        <div className="form-bottom">
          <span>
            <LockKeyhole size={12} />
            {store.cloud ? "仅你们两人可见" : "保存在当前浏览器"}
          </span>
          <Button type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Heart size={16} />
            )}{" "}
            {busy ? `正在保存 ${progress}%` : "保存这段回忆"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function MemoryDetail({
  memory,
  onClose,
  onEdit,
  onDelete,
}: {
  memory: Memory;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const touch = useRef({ x: 0, y: 0 });
  const media = memory.media[index];
  const reduce = useReducedMotion();
  const step = useCallback(
    (direction: number) => {
      setZoom(false);
      setIndex(
        (i) => (i + direction + memory.media.length) % memory.media.length,
      );
    },
    [memory.media.length],
  );
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (memory.media.length < 2) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [step, memory.media.length]);
  async function remove() {
    setBusy(true);
    try {
      await onDelete();
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  }
  return (
    <Modal title={memory.title} onClose={onClose} wide>
      <div className="detail-meta">
        <span className={`tag ${memory.category}`}>
          {categoryLabels[memory.category]}
        </span>
        <span>{prettyDate(memory.date)}</span>
        {memory.resolved && (
          <span>
            <Check size={12} />
            已经和好
          </span>
        )}
      </div>
      {media && (
        <div
          className="detail-media"
          onTouchStart={(e) => {
            touch.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touch.current.x;
            const dy = e.changedTouches[0].clientY - touch.current.y;
            if (
              !zoom &&
              Math.abs(dx) > 55 &&
              Math.abs(dx) > Math.abs(dy) * 1.5 &&
              memory.media.length > 1
            )
              step(dx < 0 ? 1 : -1);
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="media-frame"
              key={media.id}
              initial={reduce ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              {media.type.startsWith("video/") ? (
                <video
                  src={media.url}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <motion.img
                  animate={{ scale: zoom ? 1.7 : 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 30 }}
                  src={media.url}
                  alt={media.name}
                  onDoubleClick={() => setZoom(!zoom)}
                />
              )}
            </motion.div>
          </AnimatePresence>
          {media.type.startsWith("image/") && (
            <button
              className="zoom-button"
              aria-label={zoom ? "还原照片" : "放大照片"}
              onClick={() => setZoom(!zoom)}
            >
              {zoom ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          )}
        </div>
      )}
      {memory.media.length > 1 && (
        <>
          <div className="gallery-controls">
            <button
              className="icon-button"
              aria-label="上一张"
              onClick={() => step(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span aria-live="polite">
              {index + 1} / {memory.media.length}
            </span>
            <button
              className="icon-button"
              aria-label="下一张"
              onClick={() => step(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="gallery-thumbnails">
            {memory.media.map((f, i) => (
              <button
                aria-label={`查看第 ${i + 1} 个文件`}
                aria-pressed={i === index}
                key={f.id}
                onClick={() => {
                  setIndex(i);
                  setZoom(false);
                }}
              >
                {f.type.startsWith("image/") ? (
                  <img src={f.url} alt="" />
                ) : (
                  <Play size={19} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="detail-text">{memory.text}</p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="detail-actions">
        <Button secondary onClick={onEdit}>
          <Pencil size={14} />
          编辑回忆
        </Button>
        {confirm ? (
          <>
            <span>删除后无法恢复，确定删除？</span>
            <button className="danger-button" disabled={busy} onClick={remove}>
              {busy ? "删除中…" : "确定删除"}
            </button>
            <button className="text-link" onClick={() => setConfirm(false)}>
              取消
            </button>
          </>
        ) : (
          <button
            className="icon-button danger"
            onClick={() => setConfirm(true)}
            aria-label="删除回忆"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
    </Modal>
  );
}

function Care({
  data,
  today,
  add,
  refresh,
  notice,
}: {
  data: Snapshot;
  today: string;
  add: (kind: "period" | "work") => void;
  refresh: () => Promise<void>;
  notice: (s: string) => void;
}) {
  const p = periodStats(
    data.trackers,
    data.settings.cycleDays,
    data.settings.toleranceDays,
  );
  const w = workRate(data.trackers);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function remove(id: string) {
    try {
      await store.deleteTracker(id);
      setDeleting(null);
      await refresh();
      notice("记录已删除");
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <>
      <div className="care-cards">
        <section className="care-card period-card">
          <div className="care-title">
            <span>
              <Flower2 size={21} />
              她的小日历
            </span>
            <button className="text-link" onClick={() => add("period")}>
              <Plus size={15} />
              记录经期
            </button>
          </div>
          <p>多一份了解，多一点照顾。</p>
          <div className="care-number">
            <strong>{p.percent === null ? "—" : `${p.percent}%`}</strong>
            <span>落在设定周期窗口内</span>
          </div>
          <div className="care-details">
            <span>
              设定周期
              <b>
                {data.settings.cycleDays} 天 ± {data.settings.toleranceDays} 天
              </b>
            </span>
            <span>
              下次参考日期
              <b>{p.next ? prettyDate(p.next) : "等待第一条记录"}</b>
            </span>
            <span>
              已记录完整间隔<b>{p.intervals.length} 次</b>
            </span>
          </div>
          <small>仅用于个人记录；日期为简单推算，不用于诊断或避孕。</small>
        </section>
        <section className="care-card work-card">
          <div className="care-title">
            <span>
              <Clock3 size={21} />
              他的下班时刻
            </span>
            <button className="text-link" onClick={() => add("work")}>
              <Plus size={15} />
              记录下班
            </button>
          </div>
          <p>早点见面，晚餐一起吃。</p>
          <div className="care-number">
            <strong>{w ? `${w.percent}%` : "—"}</strong>
            <span>按约定时间准时下班</span>
          </div>
          <div className="care-details">
            <span>
              默认约定时间<b>{data.settings.workTime}</b>
            </span>
            <span>
              准时 / 已记录
              <b>{w ? `${w.onTime} / ${w.total} 天` : "还没有记录"}</b>
            </span>
            <span>
              统计范围<b>所有已记录日期</b>
            </span>
          </div>
          <small>未记录的日子不计入；以每次填写的约定时间为准。</small>
        </section>
      </div>
      <div className="section-heading">
        <h2>关心的痕迹</h2>
        <span className="micro">{data.trackers.length} 条记录</span>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {data.trackers.length ? (
        <div className="tracker-list">
          {[...data.trackers]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((t) => (
              <div className="tracker-row" key={t.id}>
                <span className={`tracker-icon ${t.kind}`}>
                  {t.kind === "period" ? (
                    <Flower2 size={18} />
                  ) : (
                    <Clock3 size={18} />
                  )}
                </span>
                <div>
                  <b>
                    {t.kind === "period"
                      ? "经期开始"
                      : `下班时间 ${t.actual_next_day ? "次日 " : ""}${t.actual}`}
                  </b>
                  <small>
                    {prettyDate(t.date)}
                    {t.kind === "work" ? ` · 约定 ${t.expected}` : ""}
                  </small>
                  {t.note && <p>{t.note}</p>}
                </div>
                {t.kind === "work" && (
                  <span
                    className={`tag ${!t.actual_next_day && t.actual <= t.expected ? "sweet" : "thought"}`}
                  >
                    {!t.actual_next_day && t.actual <= t.expected
                      ? "准时见面"
                      : "辛苦啦"}
                  </span>
                )}
                {deleting === t.id ? (
                  <div className="confirm-inline">
                    <button
                      className="danger-button"
                      onClick={() => remove(t.id)}
                    >
                      确认删除
                    </button>
                    <button
                      className="text-link"
                      onClick={() => setDeleting(null)}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    className="icon-button"
                    aria-label={`删除 ${t.date} 的${t.kind === "period" ? "经期" : "下班"}记录`}
                    onClick={() => setDeleting(t.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
        </div>
      ) : (
        <Empty
          icon={Heart}
          title="关心，也可以是一件很小的事"
          text={`今天是 ${prettyDate(today)}。从第一条记录开始，慢慢了解彼此的节奏。`}
        />
      )}
    </>
  );
}
function TrackerForm({
  kind,
  data,
  today,
  onClose,
  onSaved,
}: {
  kind: "period" | "work";
  data: Snapshot;
  today: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const date = String(f.get("date"));
    if (data.trackers.some((t) => t.kind === kind && t.date === date)) {
      setError("这个日期已经记过啦，如需更正请先删除原记录。");
      return;
    }
    setBusy(true);
    try {
      await store.saveTracker({
        id: crypto.randomUUID(),
        kind,
        date,
        expected: String(f.get("expected") || ""),
        actual: String(f.get("actual") || ""),
        actual_next_day: f.get("actual_next_day") === "on",
        note: String(f.get("note") || ""),
        created_at: new Date().toISOString(),
      });
      await onSaved();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={
        kind === "period" ? "记下这次经期开始的日子" : "今天，几点结束忙碌？"
      }
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form className="editor-form" onSubmit={submit}>
        <label>
          日期
          <input
            name="date"
            type="date"
            max={today}
            defaultValue={today}
            required
          />
        </label>
        {kind === "work" && (
          <div className="form-row">
            <label>
              约定下班时间
              <input
                name="expected"
                type="time"
                defaultValue={data.settings.workTime}
                required
              />
            </label>
            <label>
              实际下班时间
              <input
                name="actual"
                type="time"
                defaultValue={data.settings.workTime}
                required
              />
            </label>
          </div>
        )}
        {kind === "work" && (
          <label className="checkbox-label">
            <input name="actual_next_day" type="checkbox" />
            <span>跨过午夜，实际是次日下班</span>
          </label>
        )}
        <label>
          想补充的话
          <textarea
            name="note"
            rows={3}
            placeholder={
              kind === "period"
                ? "今天的感受，需要怎样的照顾…"
                : "今天辛苦啦，想吃点什么？"
            }
            maxLength={2000}
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          保存记录
        </Button>
      </form>
    </Modal>
  );
}
function SettingsPage({
  data,
  refresh,
  notice,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  notice: (s: string) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const settings: Settings = {
      ...data.settings,
      startDate: String(f.get("startDate")),
      names: String(f.get("names")).trim(),
      petBirthday: String(f.get("petBirthday")),
      cycleDays: Number(f.get("cycleDays")),
      toleranceDays: Number(f.get("toleranceDays")),
      workTime: String(f.get("workTime")),
      timezone: String(f.get("timezone")),
    };
    if (!settings.names) {
      setError("请填写两个人的称呼");
      setBusy(false);
      return;
    }
    try {
      await store.saveSettings(settings);
      await refresh();
      notice("小家的设置已更新");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function exportData() {
    try {
      const memories = await Promise.all(
        data.memories.map(async (m) => ({
          ...m,
          media: await Promise.all(
            m.media.map(async ({ url, blob, ...f }) => {
              const file =
                blob ||
                (url
                  ? await fetch(url).then((r) => {
                      if (!r.ok) throw new Error("下载媒体失败");
                      return r.blob();
                    })
                  : null);
              const base64 = file
                ? await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  })
                : null;
              return { ...f, data: base64 };
            }),
          ),
        })),
      );
      const blob = new Blob(
        [
          JSON.stringify(
            {
              version: 1,
              exportedAt: new Date().toISOString(),
              settings: data.settings,
              memories,
              trackers: data.trackers,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `our-little-days-${civilDay(data.settings.timezone)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notice("备份已导出，包含原始媒体内容");
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <div className="settings-layout">
      <form className="settings-card editor-form" onSubmit={submit}>
        <h2>属于我们的信息</h2>
        <label>
          两个人的称呼
          <input
            name="names"
            defaultValue={data.settings.names}
            maxLength={40}
            required
          />
        </label>
        <div className="form-row">
          <label>
            在一起的日子
            <input
              type="date"
              name="startDate"
              defaultValue={data.settings.startDate}
              max={civilDay(data.settings.timezone)}
              required
            />
          </label>
          <label>
            mini 的生日
            <input
              type="date"
              name="petBirthday"
              defaultValue={data.settings.petBirthday}
              max={civilDay(data.settings.timezone)}
            />
          </label>
        </div>
        <label>
          日期和计时使用的时区
          <select name="timezone" defaultValue={data.settings.timezone}>
            <option value="Asia/Dubai">迪拜 · UTC+4</option>
            <option value="Asia/Shanghai">中国 · UTC+8</option>
            <option value="Europe/London">伦敦</option>
            <option value="America/New_York">纽约</option>
            <option value="Asia/Tokyo">东京</option>
          </select>
        </label>
        <hr />
        <h2>日常记录偏好</h2>
        <div className="form-row">
          <label>
            参考周期（天）
            <input
              name="cycleDays"
              type="number"
              min={15}
              max={90}
              defaultValue={data.settings.cycleDays}
              required
            />
          </label>
          <label>
            周期窗口（±天）
            <input
              name="toleranceDays"
              type="number"
              min={0}
              max={14}
              defaultValue={data.settings.toleranceDays}
              required
            />
          </label>
        </div>
        <label>
          默认约定下班时间
          <input
            type="time"
            name="workTime"
            defaultValue={data.settings.workTime}
            required
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          保存设置
        </Button>
      </form>
      <aside className="settings-aside">
        <div className="settings-card storage-card">
          <Cloud size={25} />
          <h2>{store.cloud ? "你们的云端空间" : "当前使用本机预览"}</h2>
          <p>
            {store.cloud
              ? "照片、视频和记录会保存在你们的云端项目中。两人登录同一空间后，内容自动同步。"
              : "数据保存在当前浏览器的 IndexedDB 中。关闭页面后仍可保留，但清除浏览器数据会删除记录，也不会自动同步到手机。"}
          </p>
          <span className="storage-badge">
            <span className="status-dot" />
            {store.cloud ? "云端已连接" : "本机存储"}
          </span>
          <hr />
          <h3>存储小贴士</h3>
          <p>
            照片上传前会自动优化至最长边 2048px；视频保留原文件，单个文件最多 50
            MB。
          </p>
          <p>
            免费云端起步含 1 GB
            文件存储。每天上传视频时，建议定期导出备份，并按需扩容。
          </p>
        </div>
        <div className="settings-card">
          <Download size={24} />
          <h2>把回忆，好好留一份</h2>
          <p>
            导出包含照片、视频和文字的 JSON
            备份。媒体较多时需要一些时间和浏览器内存。
          </p>
          <Button secondary onClick={exportData}>
            <Download size={15} />
            导出完整备份
          </Button>
        </div>
      </aside>
    </div>
  );
}
