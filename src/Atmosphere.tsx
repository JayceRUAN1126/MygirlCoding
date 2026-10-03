import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionStyle } from "motion/react";
import { Check, Pause, Play, ImagePlus } from "lucide-react";
import type { Atmosphere } from "./types";

export const defaultCover =
  import.meta.env.BASE_URL + "images/sea-at-dusk.webp";
export const atmospheres: { id: Atmosphere; label: string }[] = [
  { id: "coast", label: "海边" },
  { id: "dawn", label: "晨雾" },
  { id: "night", label: "夜色" },
];
export type Appearance = { atmosphere: Atmosphere; ambientMotion: boolean };

export function SceneControls({
  atmosphere,
  ambientMotion,
  onChange,
  chooseCover,
  busy = false,
  customCover = false,
}: Appearance & {
  onChange: (value: Partial<Appearance>) => void;
  chooseCover?: () => void;
  busy?: boolean;
  customCover?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="scene-controls" aria-label="背景与氛围" aria-busy={busy}>
      <span className="scene-controls-label">此刻的背景</span>
      <div className="scene-options" role="group" aria-label="选择背景">
        {atmospheres.map(({ id, label }) => (
          <button
            key={id}
            aria-disabled={busy}
            aria-label={
              "切换到" +
              (id === "coast" && customCover ? "照片" : label) +
              "背景"
            }
            aria-pressed={atmosphere === id}
            onClick={() => {
              if (!busy) onChange({ atmosphere: id });
            }}
          >
            <span className={"scene-swatch swatch-" + id} aria-hidden="true">
              {atmosphere === id && <Check size={12} />}
            </span>
            <span>{id === "coast" && customCover ? "照片" : label}</span>
          </button>
        ))}
      </div>
      <div className="scene-tools">
        {chooseCover && (
          <button
            onClick={() => {
              if (!busy) chooseCover();
            }}
            aria-disabled={busy}
            aria-label="选择自己的照片作为背景"
            title="自己的照片"
          >
            <ImagePlus size={17} />
          </button>
        )}
        <button
          aria-disabled={busy || !!reduce}
          aria-label={
            reduce
              ? "系统已开启减少动态效果"
              : ambientMotion
                ? "暂停背景动态"
                : "开启背景动态"
          }
          aria-pressed={ambientMotion && !reduce}
          onClick={() => {
            if (!busy && !reduce) onChange({ ambientMotion: !ambientMotion });
          }}
          title={
            reduce
              ? "跟随系统减少动态效果"
              : ambientMotion
                ? "暂停动态"
                : "开启动态"
          }
        >
          {ambientMotion && !reduce ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
}

export function SeaScene({
  src = defaultCover,
  alt = "",
  children,
  className = "",
  atmosphere = "coast",
  ambientMotion = true,
}: {
  src?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
  atmosphere?: Atmosphere;
  ambientMotion?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = ambientMotion && !reduce;
  const pointerX = useSpring(0, { stiffness: 55, damping: 24 });
  const pointerY = useSpring(0, { stiffness: 55, damping: 24 });
  const lightX = useTransform(pointerX, [-1, 1], ["8%", "92%"]);
  const lightY = useTransform(pointerY, [-1, 1], ["10%", "90%"]);
  const x = useTransform(pointerX, [-1, 1], [12, -12]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const y = useTransform(
    [pointerY, scrollY],
    ([py, sy]) => Number(sy) - Number(py) * 10,
  );
  const light = useMotionTemplate`radial-gradient(ellipse 530px 400px at ${lightX} ${lightY}, rgba(255,240,212,.17), transparent 75%)`;
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const rippleId = useRef(0);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!active || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  }
  function touch(event: PointerEvent<HTMLDivElement>) {
    if (
      !active ||
      (event.target as HTMLElement).closest(
        "button,a,input,select,textarea,label",
      )
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      id: ++rippleId.current,
    });
  }
  return (
    <motion.div
      ref={ref}
      className={"sea-scene ambient-scene " + className}
      data-atmosphere={atmosphere}
      data-motion={active ? "on" : "off"}
      onPointerMove={move}
      onPointerDown={touch}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={atmosphere}
          className={"ambient-visual atmosphere-" + atmosphere}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: active ? 0.8 : 0 }}
        >
          <motion.div
            className="ambient-parallax"
            style={active ? { x, y } : { x: 0, y: 0 }}
          >
            {atmosphere === "coast" ? (
              <img
                className="ambient-photo"
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
            ) : (
              <>
                <i className="ambient-orb" />
                <i className="ambient-ribbon ribbon-one" />
                <i className="ambient-ribbon ribbon-two" />
                <i className="ambient-horizon" />
                <i className="ambient-specks" />
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="ambient-shade" aria-hidden="true" />
      {active && (
        <motion.div
          className="ambient-light"
          style={{ background: light } as MotionStyle}
          aria-hidden="true"
        />
      )}
      {active && ripple && (
        <motion.span
          className="ambient-ripple"
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0.1, opacity: 0.65 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
          onAnimationComplete={() =>
            setRipple((current) => (current?.id === ripple.id ? null : current))
          }
          aria-hidden="true"
        />
      )}
      {children}
    </motion.div>
  );
}
