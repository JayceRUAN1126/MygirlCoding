import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
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
import { categoryLabels } from "./types";
import { age, anniversary, daysBetween } from "./dates.mjs";
import { CatArt } from "./Art";

export type Page =
  "dashboard" | "album" | "diary" | "care" | "mini" | "settings";
export const defaultCover =
  import.meta.env.BASE_URL + "images/sea-at-dusk.webp";
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
        慢慢喜欢你<small>Our little days</small>
      </span>
    </div>
  );
}

export function SeaScene({
  src = defaultCover,
  alt = "",
  children,
  className = "",
}: {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  return (
    <div ref={ref} className={"sea-scene " + className}>
      <motion.div
        className="scene-image"
        style={reduce ? undefined : { y }}
        initial={reduce ? false : { scale: 1.065 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.7, ease: [0.2, 0.6, 0.2, 1] }}
      >
        <img
          src={src}
          alt={alt}
          fetchPriority="high"
          onError={(event) => {
            if (
              event.currentTarget.src !==
              new URL(defaultCover, location.href).href
            )
              event.currentTarget.src = defaultCover;
          }}
        />
      </motion.div>
      <div className="scene-shade" />
      {children}
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
}: {
  data: Snapshot;
  today: string;
  now: Date;
  navigate: (p: Page) => void;
  create: (c: Category) => void;
  open: (m: Memory) => void;
  chooseCover: () => void;
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
      <section className="story-hero" aria-label="我们的故事与纪念日">
        <SeaScene
          src={cover?.url}
          alt={cover ? "我们选定的相册封面" : "海面与晚霞"}
        >
          <div className="hero-topline">
            <span>
              <span className="light-dot" /> {settings.names} 的私密影集
            </span>
            <button onClick={chooseCover}>
              <ImagePlus size={15} />
              选择封面
            </button>
          </div>
          <div className="hero-heading">
            <motion.h1
              initial={
                reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              还要一起，
              <br />
              过很多个今天。
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            >
              今天的小事，也想记下来。
            </motion.p>
            <button className="hero-record" onClick={() => create("daily")}>
              <Plus size={17} />
              <span>记下今天</span>
            </button>
          </div>
          <div className="hero-bottom">
            <div className="hero-origin">
              <span className="origin-line" />
              <span>
                我们的第一天
                <strong>
                  {settings.startDate
                    ? prettyDate(settings.startDate)
                    : "等我们写下第一天"}
                </strong>
              </span>
            </div>
            <div className="together-clock">
              <div className="together-days">
                <strong>{days.toLocaleString()}</strong>
                <span>
                  天<small>在一起</small>
                </span>
              </div>
              <span className="together-time">
                {time}
                <span>明天也一起</span>
              </span>
            </div>
            <button
              className="anniversary-note"
              onClick={() => navigate("settings")}
            >
              <span>
                {next ? next.years + " 周年纪念日" : "我们的纪念日"}
                <ArrowUpRight size={14} />
              </span>
              <strong>
                {next
                  ? next.days === 0
                    ? "就是今天"
                    : "还有 " + next.days + " 天"
                  : "设置第一天"}
              </strong>
              <small>{next ? prettyDate(next.date) : "从相遇开始"}</small>
            </button>
          </div>
          <button
            className="scroll-cue"
            aria-label="浏览我们的回忆"
            onClick={() =>
              document.getElementById("collected-moments")?.scrollIntoView({
                behavior: reduce ? "instant" : "smooth",
                block: "start",
              })
            }
          >
            <ArrowDown size={16} />
          </button>
        </SeaScene>
      </section>

      <div className="story-body" id="collected-moments">
        <div className="collection-intro">
          <div>
            <p className="section-caption">Our collection</p>
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
            <p className="section-caption">Between us</p>
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
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.99 }}
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
