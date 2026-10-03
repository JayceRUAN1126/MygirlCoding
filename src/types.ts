export type Category = "daily" | "sweet" | "conflict" | "thought" | "mini";
export type Media = {
  id: string;
  name: string;
  type: string;
  size: number;
  path?: string;
  url?: string;
  blob?: Blob;
};
export type Memory = {
  id: string;
  title: string;
  text: string;
  date: string;
  category: Category;
  media: Media[];
  resolved: boolean;
  created_at: string;
};
export type Tracker = {
  id: string;
  kind: "period" | "work";
  date: string;
  expected: string;
  actual: string;
  actual_next_day?: boolean;
  note: string;
  created_at: string;
};
export type Settings = {
  coverMediaId?: string;
  startDate: string;
  names: string;
  petBirthday: string;
  cycleDays: number;
  toleranceDays: number;
  workTime: string;
  timezone: string;
};
export type Snapshot = {
  memories: Memory[];
  trackers: Tracker[];
  settings: Settings;
};
export const defaults: Settings = {
  startDate: import.meta.env.VITE_PREVIEW_START_DATE || "",
  names: "你 & 我",
  petBirthday: import.meta.env.VITE_PREVIEW_PET_BIRTHDAY || "",
  cycleDays: 28,
  toleranceDays: 3,
  workTime: "18:00",
  timezone: "Asia/Dubai",
};
export const categoryLabels: Record<Category, string> = {
  daily: "日常碎片",
  sweet: "甜蜜时刻",
  conflict: "慢慢和好",
  thought: "心里话",
  mini: "mini 的日常",
};
