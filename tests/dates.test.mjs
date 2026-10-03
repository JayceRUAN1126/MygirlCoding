import test from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween,
  anniversary,
  age,
  periodStats,
  workRate,
  civilDay,
} from "../src/dates.mjs";
test("anniversary uses completed calendar days and handles the day itself", () => {
  assert.equal(daysBetween("2024-08-05", "2026-08-03"), 728);
  assert.deepEqual(anniversary("2024-08-05", "2026-08-03"), {
    date: "2026-08-05",
    days: 2,
    years: 2,
  });
  assert.equal(anniversary("2024-08-05", "2026-08-05").days, 0);
  assert.equal(anniversary("2024-08-05", "2026-08-06").years, 3);
});
test("pet age counts completed months, not average month duration", () => {
  assert.deepEqual(age("2026-03-07", "2026-08-03"), {
    years: 0,
    months: 4,
    days: 149,
  });
  assert.equal(age("2026-03-07", "2026-08-07").months, 5);
  assert.equal(age("2027-03-07", "2026-08-03"), null);
});
test("civil date is consistent across browser timezone", () => {
  assert.equal(
    civilDay("Asia/Dubai", new Date("2026-08-04T20:01:00Z")),
    "2026-08-05",
  );
  assert.equal(
    civilDay("Asia/Shanghai", new Date("2026-08-04T17:01:00Z")),
    "2026-08-05",
  );
});
test("period rate requires complete intervals and deduplicates starts", () => {
  assert.equal(
    periodStats([{ kind: "period", date: "2026-09-01" }], 28, 3).percent,
    null,
  );
  const stats = periodStats(
    [
      { kind: "period", date: "2026-09-01" },
      { kind: "period", date: "2026-09-29" },
      { kind: "period", date: "2026-09-29" },
      { kind: "period", date: "2026-10-31" },
    ],
    28,
    3,
  );
  assert.deepEqual(stats.intervals, [28, 32]);
  assert.equal(stats.percent, 50);
  assert.equal(stats.next, "2026-11-28");
});
test("work rate includes only recorded dates with their own expected times", () => {
  assert.equal(workRate([]), null);
  assert.deepEqual(
    workRate([
      { kind: "work", expected: "18:00", actual: "18:00" },
      { kind: "work", expected: "17:30", actual: "17:40" },
      { kind: "period", date: "2026-09-01" },
    ]),
    { total: 2, onTime: 1, percent: 50 },
  );
});

test("working past midnight is not counted as on time", () => {
  assert.equal(
    workRate([
      {
        kind: "work",
        expected: "18:00",
        actual: "00:30",
        actual_next_day: true,
      },
    ]).percent,
    0,
  );
});
