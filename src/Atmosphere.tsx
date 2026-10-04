import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Check, Pause, Play, ImagePlus } from "lucide-react";
import type { Atmosphere } from "./types";

export const defaultCover =
  import.meta.env.BASE_URL + "images/sea-at-dusk.webp";
export const atmospheres: { id: Atmosphere; label: string }[] = [
  { id: "coast", label: "海盐" },
  { id: "dawn", label: "朝霞" },
  { id: "night", label: "星梦" },
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
    <div
      className="scene-controls premium-scene-controls"
      data-atmosphere={atmosphere}
      aria-label="背景与氛围"
      aria-busy={busy}
    >
      <span className="scene-controls-label">换一种心情</span>
      <div className="scene-options" role="group" aria-label="选择背景氛围">
        {atmospheres.map(({ id, label }) => {
          const selected = atmosphere === id;
          const name = id === "coast" && customCover ? "照片" : label;
          return (
            <button
              type="button"
              key={id}
              aria-disabled={busy}
              aria-label={"切换到" + name + "背景"}
              aria-pressed={selected}
              onClick={() => {
                if (!busy) onChange({ atmosphere: id });
              }}
            >
              <span className={"scene-swatch swatch-" + id} aria-hidden="true">
                {selected && <Check size={11} strokeWidth={2.6} />}
              </span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
      <div className="scene-tools">
        {chooseCover && (
          <button
            type="button"
            onClick={() => {
              if (!busy) chooseCover();
            }}
            aria-disabled={busy}
            aria-label="选择自己的照片作为背景"
            title="用我们的照片"
          >
            <ImagePlus size={17} strokeWidth={1.7} />
          </button>
        )}
        <button
          type="button"
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
                ? "让光静下来"
                : "让光流动起来"
          }
        >
          {ambientMotion && !reduce ? (
            <Pause size={15} strokeWidth={1.8} />
          ) : (
            <Play size={15} strokeWidth={1.8} />
          )}
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
  const inView = useInView(ref, { amount: 0.01, initial: true });
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );
  const enabled = ambientMotion && !reduce;
  const active = enabled && inView && pageVisible;
  const pointerX = useSpring(0, { stiffness: 42, damping: 27 });
  const pointerY = useSpring(0, { stiffness: 42, damping: 27 });
  const x = useTransform(pointerX, [-1, 1], [10, -10]);
  const y = useTransform(pointerY, [-1, 1], [8, -8]);
  const glowX = useTransform(pointerX, [-1, 1], [-110, 110]);
  const glowY = useTransform(pointerY, [-1, 1], [-65, 65]);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);
  const rippleId = useRef(0);

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);

  useEffect(() => {
    if (!active) {
      pointerX.jump(0);
      pointerY.jump(0);
      pointerStart.current = null;
    }
  }, [active, pointerX, pointerY]);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!active || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  function beginTouch(event: PointerEvent<HTMLDivElement>) {
    if (
      !active ||
      (event.target as HTMLElement).closest(
        "button,a,input,select,textarea,label,[role='button']",
      )
    ) {
      pointerStart.current = null;
      return;
    }
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function finishTouch(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (
      !active ||
      !start ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
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
    <div
      ref={ref}
      className={"sea-scene ambient-scene premium-scene " + className}
      data-atmosphere={atmosphere}
      data-motion={active ? "on" : "off"}
      data-custom-cover={src !== defaultCover ? "true" : "false"}
      onPointerMove={move}
      onPointerDown={beginTouch}
      onPointerUp={finishTouch}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onPointerLeave={() => {
        pointerStart.current = null;
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
          transition={{ duration: enabled ? 0.65 : 0, ease: "easeInOut" }}
        >
          <motion.div
            className="ambient-parallax"
            style={active ? { x, y } : { x: 0, y: 0 }}
          >
            {atmosphere === "coast" && (
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
            )}
            <div className="ambient-mesh" />
            <div className="ambient-silk silk-one" />
            <div className="ambient-silk silk-two" />
            <div className="ambient-aureole" />
            <div className="ambient-dust" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="ambient-shade" aria-hidden="true" />
      <motion.div
        className="ambient-light premium-light"
        style={active ? { x: glowX, y: glowY } : { x: 0, y: 0 }}
        aria-hidden="true"
      />
      <div className="ambient-grain" aria-hidden="true" />
      {active && ripple && (
        <motion.span
          className="ambient-ripple"
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0.12, opacity: 0.55 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          onAnimationComplete={() =>
            setRipple((current) => (current?.id === ripple.id ? null : current))
          }
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
