import { useState } from "react";
import type { ReactNode, PointerEvent } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarHeart,
  MoveUpRight,
  ArrowUpRight,
  Plus,
  Camera,
  Images,
  Play,
  Heart,
  BookHeart,
  PawPrint,
  Coffee,
  MessageCircleHeart,
  ImagePlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category, Memory, Snapshot } from "./types";
import { SeaScene, SceneControls, defaultCover } from "./Atmosphere";
import type { Appearance } from "./Atmosphere";
export { SeaScene, defaultCover } from "./Atmosphere";
import { categoryLabels } from "./types";
import { age, anniversary, daysBetween } from "./dates.mjs";
import { CatArt } from "./Art";

export type Page =
  "dashboard" | "album" | "diary" | "care" | "mini" | "settings";
const prettyDate = (value: string) => value.replaceAll("-", ".");
const categoryIcons: Record<Category, LucideIcon> = {
  daily: Coffee,
  sweet: Heart,
  thought: BookHeart,
  conflict: MessageCircleHeart,
  mini: PawPrint,
};

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>
        照耀在大地上<small>Light upon the earth</small>
      </span>
    </div>
  );
}

function DepthObject({
  children,
  className,
  enabled,
}: {
  children: ReactNode;
  className: string;
  enabled: boolean;
}) {
  const reduce = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 100, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 22 });
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || reduce || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateX.set((0.5 - (event.clientY - rect.top) / rect.height) * 7);
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
  }
  return (
    <motion.div
      className={className}
      style={
        enabled && !reduce
          ? { rotateX, rotateY, transformPerspective: 1200 }
          : { rotateX: 0, rotateY: 0 }
      }
      onPointerMove={move}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function MomentStack({
  memories,
  cover,
  open,
  chooseCover,
  create,
  ambientMotion,
}: {
  memories: Memory[];
  cover?: string;
  open: (m: Memory) => void;
  chooseCover: () => void;
  create: (c: Category) => void;
  ambientMotion: boolean;
}) {
  const photos = memories.filter((m) =>
    m.media.some((f) => f.type.startsWith("image/")),
  );
  const [index, setIndex] = useState(0);
  const currentIndex = photos.length ? Math.min(index, photos.length - 1) : 0;
  const memory = photos[currentIndex];
  const image = memory?.media.find((f) => f.type.startsWith("image/"));
  return (
    <div className="moment-stage">
      <span className="moment-orbit" aria-hidden="true" />
      <span className="moment-orbit orbit-two" aria-hidden="true" />
      <DepthObject className="moment-stack" enabled={ambientMotion}>
        <div className="moment-paper paper-back" aria-hidden="true" />
        <div className="moment-paper paper-middle" aria-hidden="true" />
        <button
          className="moment-paper paper-front"
          onClick={() => (memory ? open(memory) : chooseCover())}
          aria-label={memory ? "打开回忆：" + memory.title : "换成我们的照片"}
        >
          <div className="moment-photo">
            <img
              key={image?.id || "cover"}
              src={image?.url || cover || defaultCover}
              alt={memory ? memory.title : "海边晚霞，封面示意"}
            />
            <span className="moment-photo-open">
              <ArrowUpRight size={21} />
            </span>
          </div>
          <div className="moment-caption">
            <span>
              <small>
                {memory ? prettyDate(memory.date) : "OUR NEXT CHAPTER"}
              </small>
              <strong>{memory ? memory.title : "换成我们的照片"}</strong>
            </span>
            <Heart size={21} strokeWidth={1} />
          </div>
        </button>
      </DepthObject>
      <button className="floating-note" onClick={() => create("thought")}>
        <span className="note-pin" aria-hidden="true" />
        <BookHeart size={17} strokeWidth={1.3} />
        <span>
          今天的小事，
          <br />
          也想听你说。
        </span>
        <MoveUpRight size={15} />
      </button>
      <div className="moment-pagination">
        {photos.length > 1 ? (
          <>
            <button
              aria-label="上一张回忆照片"
              onClick={() =>
                setIndex((currentIndex - 1 + photos.length) % photos.length)
              }
            >
              <ArrowLeft size={16} />
            </button>
            <span aria-live="polite">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
            <button
              aria-label="下一张回忆照片"
              onClick={() => setIndex((currentIndex + 1) % photos.length)}
            >
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <span>
            {photos.length
              ? "最近的一张 · 点击打开"
              : "封面示意 · 等你们的第一张照片"}
          </span>
        )}
      </div>
    </div>
  );
}

export function Dashboard({
  data,
  today,
  now,
  navigate,
  create,
  open,
  chooseCover,
  appearance,
  changeAppearance,
  appearanceBusy,
}: {
  data: Snapshot;
  today: string;
  now: Date;
  navigate: (p: Page) => void;
  create: (c: Category) => void;
  open: (m: Memory) => void;
  chooseCover: () => void;
  appearance: Appearance;
  changeAppearance: (value: Partial<Appearance>) => void;
  appearanceBusy: boolean;
}) {
  const { settings, memories } = data;
  const days = settings.startDate
    ? Math.max(0, daysBetween(settings.startDate, today))
    : 0;
  const next = settings.startDate
    ? anniversary(settings.startDate, today)
    : null;
  const petAge = age(settings.petBirthday, today);
  const latest = memories
    .slice()
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.created_at.localeCompare(a.created_at),
    );
  const media = latest.flatMap((m) => m.media);
  const cover = media.find(
    (m) => m.id === settings.coverMediaId && m.type.startsWith("image/"),
  );
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: settings.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  const reduce = useReducedMotion();
  return (
    <>
      <section className="depth-hero" aria-label="我们的故事与纪念日">
        <SeaScene
          src={cover?.url}
          alt={cover ? "我们选定的相册封面" : "海面与晚霞"}
          {...appearance}
        >
          <div className="depth-hero-inner">
            <div className="depth-topline">
              <span>
                <span className="light-dot" /> {settings.names} 的私密影集
              </span>
              <span className="depth-volume">
                LIGHT UPON THE EARTH <i /> EST.{" "}
                {settings.startDate ? settings.startDate.slice(0, 4) : "NOW"}
              </span>
            </div>
            <div className="depth-composition">
              <div className="depth-heading">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="depth-eyebrow">
                    A little space. A life together.
                  </p>
                  <h1>
                    还要一起，
                    <br />
                    过很多个今天<span>。</span>
                  </h1>
                  <p className="depth-description">
                    照片留住瞬间，我们慢慢过日子。
                    <br />
                    今天的小事，也想记下来。
                  </p>
                  <div className="depth-actions">
                    <button
                      className="depth-primary"
                      onClick={() => create("daily")}
                    >
                      <Plus size={18} />
                      记下今天
                      <ArrowUpRight size={17} />
                    </button>
                    <button
                      className="depth-secondary"
                      onClick={() => navigate("album")}
                    >
                      打开相册
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
                <SceneControls
                  {...appearance}
                  onChange={changeAppearance}
                  chooseCover={chooseCover}
                  busy={appearanceBusy}
                  customCover={!!cover}
                />
              </div>
              <MomentStack
                memories={latest}
                cover={cover?.url}
                open={open}
                chooseCover={chooseCover}
                create={create}
                ambientMotion={appearance.ambientMotion}
              />
            </div>
            <div className="depth-bottomline">
              <span>
                {appearance.ambientMotion && !reduce
                  ? "轻触背景，让光停在这里"
                  : "安静地，看一会儿"}
              </span>
              <button
                onClick={() =>
                  document.getElementById("collected-moments")?.scrollIntoView({
                    behavior: reduce ? "instant" : "smooth",
                    block: "start",
                  })
                }
              >
                往下，都是我们
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </SeaScene>
      </section>
      <section className="depth-ledger" aria-label="在一起的日子">
        <div className="ledger-together">
          <div className="ledger-label">
            <span className="ledger-dot" />
            我们的第
          </div>
          <div className="ledger-number">
            <strong>{days.toLocaleString()}</strong>
            <span>
              天<small>明天也一起</small>
            </span>
          </div>
          <div className="ledger-baseline">
            <span>
              {settings.startDate
                ? "从 " + prettyDate(settings.startDate) + " 开始"
                : "在设置中写下我们的第一天"}
            </span>
            <time>{time}</time>
          </div>
        </div>
        <button
          className="ledger-anniversary"
          onClick={() => navigate("settings")}
        >
          <span className="ledger-label">
            <CalendarHeart size={17} />
            {next ? next.years + " 周年纪念日" : "我们的纪念日"}
            <ArrowUpRight size={16} />
          </span>
          <strong>
            {next ? (
              next.days === 0 ? (
                "就是今天"
              ) : (
                <>
                  还有 <em>{next.days}</em> 天
                </>
              )
            ) : (
              "写下第一天"
            )}
          </strong>
          <span className="ledger-baseline">
            {next ? prettyDate(next.date) : "每一年，都记得"}
            <span className="anniversary-rings" aria-hidden="true">
              ◎
            </span>
          </span>
        </button>
        <button className="ledger-mini" onClick={() => navigate("mini")}>
          <span className="ledger-label">
            <PawPrint size={17} />
            mini 也在长大
            <ArrowUpRight size={16} />
          </span>
          <strong>
            {petAge ? (
              <>
                <em>
                  {petAge.years ? petAge.years + " 岁 " : ""}
                  {petAge.months}
                </em>{" "}
                个月
              </>
            ) : (
              "认识 mini"
            )}
          </strong>
          <span className="ledger-baseline">
            {petAge
              ? "来到世界的第 " + petAge.days + " 天"
              : "我们的第三位家人"}
            <PawPrint className="ledger-paw" size={42} strokeWidth={0.6} />
          </span>
        </button>
      </section>

      <div className="story-body depth-story" id="collected-moments">
        <div className="collection-intro">
          <div>
            <p className="section-caption">
              <span className="chapter-number">01</span> Our collection
            </p>
            <h2>
              当时没觉得，
              <br />
              后来常想起。
            </h2>
          </div>
          <div className="collection-summary">
            <p>
              照片、视频，
              <br />
              还有当时想说的话。
            </p>
            <div className="collection-counts">
              {[
                {
                  value: media.filter((m) => m.type.startsWith("image/"))
                    .length,
                  label: "张照片",
                  to: "album",
                },
                {
                  value: media.filter((m) => m.type.startsWith("video/"))
                    .length,
                  label: "段视频",
                  to: "album",
                },
                {
                  value: memories.filter((m) => m.text).length,
                  label: "篇日记",
                  to: "diary",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.to as Page)}
                >
                  <strong>{item.value.toString().padStart(2, "0")}</strong>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <section className="home-collection" aria-label="最近的回忆">
          <div className="section-heading">
            <h3>最近的我们</h3>
            <button className="text-link" onClick={() => navigate("album")}>
              打开相册
              <ArrowUpRight size={16} />
            </button>
          </div>
          {latest.length ? (
            <div className="memory-grid home-grid">
              {latest.slice(0, 3).map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onClick={() => open(memory)}
                />
              ))}
            </div>
          ) : (
            <div className="collection-empty">
              <button
                className="empty-frames"
                aria-label="上传第一张照片"
                onClick={() => create("daily")}
              >
                <span className="blank-frame frame-back" />
                <span className="blank-frame frame-front">
                  <Camera size={34} strokeWidth={1} />
                  <span>A moment, forever.</span>
                </span>
                <span className="frame-add">
                  <Plus size={22} />
                </span>
              </button>
              <div>
                <span className="section-caption">The first page</span>
                <h3>
                  第一张照片，
                  <br />
                  从今天开始。
                </h3>
                <p>
                  不用等旅行或纪念日，
                  <br />
                  今天就可以留一张。
                </p>
                <button className="button" onClick={() => create("daily")}>
                  <ImagePlus size={16} />
                  上传第一张照片
                </button>
              </div>
              <span className="empty-margin" aria-hidden="true">
                To be continued.
              </span>
            </div>
          )}
        </section>
        <section className="daily-sections">
          <div className="daily-invitation">
            <p className="section-caption">
              <span className="chapter-number">02</span> Between us
            </p>
            <h2>有句话，想跟你说。</h2>
            <p>开心的、不开心的，都可以写。</p>
            <div className="feeling-list">
              {(["sweet", "thought", "conflict"] as Category[]).map((c) => {
                const Icon = categoryIcons[c];
                return (
                  <button key={c} onClick={() => create(c)}>
                    <span className={"feeling-icon " + c}>
                      <Icon size={20} strokeWidth={1.3} />
                    </span>
                    <span>
                      <strong>{categoryLabels[c]}</strong>
                      <small>
                        {c === "sweet"
                          ? "刚刚又想起你了"
                          : c === "thought"
                            ? "有件小事，先告诉你"
                            : "别急，我们慢慢说"}
                      </small>
                    </span>
                    <ArrowUpRight size={17} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pet-story">
            <div className="pet-story-heading">
              <span className="section-caption">And a little Mini</span>
              <button
                className="round-button"
                aria-label="查看 mini 的小世界"
                onClick={() => navigate("mini")}
              >
                <ArrowUpRight size={19} />
              </button>
            </div>
            <h2>
              这个家，
              <br />
              也有它一份。
            </h2>
            <CatArt />
            <div className="pet-story-bottom">
              <div>
                <strong>mini</strong>
                <span>
                  {petAge
                    ? "来到世界的第 " + petAge.days + " 天"
                    : "我们的第三位家人"}
                </span>
              </div>
              <button className="text-link" onClick={() => create("mini")}>
                记录成长
                <Plus size={15} />
              </button>
            </div>
          </div>
        </section>
        <div className="closing-note">
          <span>More days with you.</span>
          <p>明天也见。</p>
          <button
            className="round-button"
            aria-label="写下今天的回忆"
            onClick={() => create("daily")}
          >
            <Plus size={22} />
          </button>
        </div>
      </div>
    </>
  );
}

export function MemoryCard({
  memory,
  onClick,
}: {
  memory: Memory;
  onClick: () => void;
}) {
  const media = memory.media[0];
  const Icon = categoryIcons[memory.category];
  const reduce = useReducedMotion();
  return (
    <motion.button
      layout={!reduce}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      className={"memory-card category-" + memory.category}
      onClick={onClick}
    >
      <div className="memory-cover">
        {media ? (
          media.type.startsWith("video/") ? (
            <>
              <video src={media.url} muted preload="metadata" playsInline />
              <span className="play-overlay">
                <Play size={22} fill="currentColor" />
              </span>
            </>
          ) : (
            <img src={media.url} alt={memory.title} loading="lazy" />
          )
        ) : (
          <div className="text-cover">
            <Icon size={25} strokeWidth={1.2} />
            <p>{memory.text.slice(0, 110) || memory.title}</p>
          </div>
        )}
        <span className="memory-open">
          <ArrowUpRight size={20} />
        </span>
        {memory.media.length > 1 && (
          <span className="media-count">
            <Images size={12} />
            {memory.media.length}
          </span>
        )}
      </div>
      <div className="memory-caption">
        <div className="memory-kicker">
          <span className={"tag " + memory.category}>
            {categoryLabels[memory.category]}
            {memory.category === "conflict" && memory.resolved
              ? " · 已和好"
              : ""}
          </span>
          <span className="memory-date">{prettyDate(memory.date)}</span>
        </div>
        <h3>{memory.title}</h3>
        <p className="memory-excerpt">{memory.text.slice(0, 160)}</p>
      </div>
    </motion.button>
  );
}
