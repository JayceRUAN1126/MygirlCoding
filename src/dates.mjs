export function civilDay(timezone = "Asia/Dubai", date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function dayNumber(date) {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
}
export function daysBetween(a, b) {
  return dayNumber(b) - dayNumber(a);
}
export function addDays(date, days) {
  return new Date((dayNumber(date) + days) * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function anniversary(start, today) {
  const year = Number(today.slice(0, 4));
  let next = `${year}${start.slice(4)}`;
  if (next < today) next = `${year + 1}${start.slice(4)}`;
  return {
    date: next,
    days: daysBetween(today, next),
    years: Number(next.slice(0, 4)) - Number(start.slice(0, 4)),
  };
}
export function age(birthday, today) {
  if (!birthday || birthday > today) return null;
  let months =
    (Number(today.slice(0, 4)) - Number(birthday.slice(0, 4))) * 12 +
    Number(today.slice(5, 7)) -
    Number(birthday.slice(5, 7));
  if (Number(today.slice(8)) < Number(birthday.slice(8))) months--;
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: daysBetween(birthday, today),
  };
}
export function workRate(records) {
  const items = records.filter(
    (r) => r.kind === "work" && r.expected && r.actual,
  );
  if (!items.length) return null;
  return {
    total: items.length,
    onTime: items.filter((r) => !r.actual_next_day && r.actual <= r.expected)
      .length,
    percent: Math.round(
      (items.filter((r) => !r.actual_next_day && r.actual <= r.expected)
        .length /
        items.length) *
        100,
    ),
  };
}
export function periodStats(records, cycleDays, tolerance) {
  const dates = [
    ...new Set(records.filter((r) => r.kind === "period").map((r) => r.date)),
  ].sort();
  const intervals = dates.slice(1).map((d, i) => daysBetween(dates[i], d));
  const within = intervals.filter(
    (n) => Math.abs(n - cycleDays) <= tolerance,
  ).length;
  return {
    last: dates.at(-1),
    next: dates.length ? addDays(dates.at(-1), cycleDays) : null,
    intervals,
    percent: intervals.length
      ? Math.round((within / intervals.length) * 100)
      : null,
  };
}
