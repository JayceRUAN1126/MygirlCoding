import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookHeart,
  Coffee,
  CornerDownLeft,
  Heart,
  HeartHandshake,
  Images,
  LayoutDashboard,
  MessageCircleHeart,
  PawPrint,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Page } from "./Story";
import type { Category } from "./types";
import "./quick-actions.css";

type QuickActionsProps = {
  open: boolean;
  onClose: () => void;
  navigate: (page: Page) => void;
  create: (category: Category) => void;
};

type Command = {
  id: string;
  label: string;
  detail: string;
  keywords: string;
  icon: LucideIcon;
} & (
  { group: "留下一刻"; category: Category } | { group: "去看看"; page: Page }
);

const commands: Command[] = [
  {
    id: "new-daily",
    group: "留下一刻",
    category: "daily",
    label: "记一段日常",
    detail: "平凡的小事，也值得收藏",
    keywords: "日常碎片 新建 记录 daily",
    icon: Coffee,
  },
  {
    id: "new-sweet",
    group: "留下一刻",
    category: "sweet",
    label: "收藏甜蜜时刻",
    detail: "把心动留在这里",
    keywords: "甜蜜 心动 新建 记录 sweet",
    icon: Heart,
  },
  {
    id: "new-thought",
    group: "留下一刻",
    category: "thought",
    label: "写一句心里话",
    detail: "说给最想听见的人",
    keywords: "日记 心里话 新建 记录 thought",
    icon: BookHeart,
  },
  {
    id: "new-conflict",
    group: "留下一刻",
    category: "conflict",
    label: "记录一次和好",
    detail: "慢慢说，也慢慢靠近",
    keywords: "慢慢和好 吵架 冲突 新建 记录 conflict",
    icon: MessageCircleHeart,
  },
  {
    id: "new-mini",
    group: "留下一刻",
    category: "mini",
    label: "记下 mini 的日常",
    detail: "属于小家伙的可爱瞬间",
    keywords: "猫 宠物 mini 新建 记录",
    icon: PawPrint,
  },
  {
    id: "dashboard",
    group: "去看看",
    page: "dashboard",
    label: "我们的日常",
    detail: "回到首页",
    keywords: "首页 仪表盘 home dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "album",
    group: "去看看",
    page: "album",
    label: "回忆相册",
    detail: "看看一起收藏的画面",
    keywords: "照片 图片 视频 album photo",
    icon: Images,
  },
  {
    id: "diary",
    group: "去看看",
    page: "diary",
    label: "两个人的日记",
    detail: "重读写给彼此的话",
    keywords: "文字 日记 心里话 diary",
    icon: BookHeart,
  },
  {
    id: "care",
    group: "去看看",
    page: "care",
    label: "好好照顾彼此",
    detail: "关心彼此的生活节奏",
    keywords: "关怀 照顾 生理期 下班 care",
    icon: HeartHandshake,
  },
  {
    id: "mini",
    group: "去看看",
    page: "mini",
    label: "mini 的小世界",
    detail: "去小家伙的专属角落",
    keywords: "猫 宠物 mini",
    icon: PawPrint,
  },
  {
    id: "settings",
    group: "去看看",
    page: "settings",
    label: "我们的小设定",
    detail: "名字、纪念日与偏好",
    keywords: "设置 设定 日期 名字 settings",
    icon: Settings2,
  },
];

export function QuickActions({
  open,
  onClose,
  navigate,
  create,
}: QuickActionsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const backdropPointerRef = useRef(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const id = useId();
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = commands.filter((command) => {
    const searchable =
      `${command.label} ${command.detail} ${command.keywords}`.toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
  const selectedIndex = Math.min(activeIndex, Math.max(0, matches.length - 1));
  const selectedCommand = matches[selectedIndex];
  const optionId = (command: Command) => `${id}-${command.id}`;

  function restoreFocus() {
    const previous = previousFocusRef.current;
    previousFocusRef.current = null;
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    setQuery("");
    setActiveIndex(0);
    backdropPointerRef.current = false;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      restoreFocus();
    };
  }, [open]);

  useEffect(() => {
    if (open && selectedCommand) {
      document
        .getElementById(optionId(selectedCommand))
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [open, selectedCommand?.id]);

  function close() {
    dialogRef.current?.close();
    restoreFocus();
    onClose();
  }

  function execute(command: Command) {
    close();
    if ("category" in command) create(command.category);
    else navigate(command.page);
  }

  function handleKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (
      event.nativeEvent.isComposing ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!matches.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (selectedIndex + direction + matches.length) % matches.length,
      );
    } else if (event.key === "Enter" && selectedCommand) {
      event.preventDefault();
      execute(selectedCommand);
    }
  }

  function isOutside(
    event: PointerEvent<HTMLDialogElement> | MouseEvent<HTMLDialogElement>,
  ) {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }

  return (
    <dialog
      className="quick-actions"
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onPointerDown={(event) => {
        backdropPointerRef.current = isOutside(event);
      }}
      onClick={(event) => {
        if (backdropPointerRef.current && isOutside(event)) close();
        backdropPointerRef.current = false;
      }}
      onPointerCancel={() => {
        backdropPointerRef.current = false;
      }}
    >
      <div className="quick-actions__head">
        <span className="quick-actions__spark" aria-hidden="true">
          <Sparkles size={20} strokeWidth={1.6} />
        </span>
        <div>
          <p className="quick-actions__eyebrow">OUR LITTLE SHORTCUTS</p>
          <h2 id={`${id}-title`}>此刻，想做点什么？</h2>
        </div>
        <button
          type="button"
          className="quick-actions__close"
          aria-label="关闭快捷入口"
          onClick={close}
        >
          <X size={19} />
        </button>
      </div>
      <div className="quick-actions__search">
        <Search size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="搜索页面或记录类型"
          aria-expanded={open}
          aria-controls={`${id}-results`}
          aria-autocomplete="list"
          aria-activedescendant={
            selectedCommand ? optionId(selectedCommand) : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder="搜索页面或记录类型…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeys}
        />
        {query && (
          <button
            type="button"
            className="quick-actions__clear"
            aria-label="清除搜索"
            onClick={() => {
              setQuery("");
              setActiveIndex(0);
              inputRef.current?.focus();
            }}
          >
            <X size={15} />
          </button>
        )}
        <kbd className="quick-actions__escape">esc</kbd>
      </div>
      <div
        className="quick-actions__results"
        id={`${id}-results`}
        role="listbox"
        aria-label="快捷操作"
      >
        {(["留下一刻", "去看看"] as const).map((group) => {
          const groupMatches = matches.filter(
            (command) => command.group === group,
          );
          if (!groupMatches.length) return null;
          return (
            <div
              className="quick-actions__group"
              role="group"
              aria-label={group}
              key={group}
            >
              <div className="quick-actions__group-title" aria-hidden="true">
                {group}
                <span>{groupMatches.length.toString().padStart(2, "0")}</span>
              </div>
              {groupMatches.map((command) => {
                const Icon = command.icon;
                const selected = command.id === selectedCommand?.id;
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    id={optionId(command)}
                    key={command.id}
                    tabIndex={-1}
                    className={`quick-actions__option${selected ? " is-active" : ""}`}
                    onPointerMove={(event) => {
                      if (event.pointerType === "mouse")
                        setActiveIndex(matches.indexOf(command));
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => execute(command)}
                  >
                    <span
                      className="quick-actions__option-icon"
                      aria-hidden="true"
                    >
                      <Icon size={19} strokeWidth={1.6} />
                    </span>
                    <span className="quick-actions__option-copy">
                      <strong>{command.label}</strong>
                      <small>{command.detail}</small>
                    </span>
                    <ArrowRight
                      className="quick-actions__option-arrow"
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      {!matches.length && (
        <div className="quick-actions__empty" role="status">
          <span aria-hidden="true">
            <Search size={25} strokeWidth={1.4} />
          </span>
          <strong>还没有找到这个入口</strong>
          <p>试试“相册”“日记”或“甜蜜”。</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(0);
              inputRef.current?.focus();
            }}
          >
            查看全部入口 <ArrowRight size={14} />
          </button>
        </div>
      )}
      <footer className="quick-actions__footer">
        <span>每一个小瞬间，都有归处。</span>
        <div className="quick-actions__keys" aria-hidden="true">
          <kbd>
            <ArrowUp size={11} />
            <ArrowDown size={11} />
          </kbd>
          选择{" "}
          <kbd>
            <CornerDownLeft size={12} />
          </kbd>
          打开
        </div>
      </footer>
    </dialog>
  );
}
