// Tests for lib/csv.js. Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { bakesToCsv, mapHeadings, parseCsv, readBakeCsv, toCsv } from "./csv.js";

test("quoted cells, doubled quotes and Windows line endings", () => {
  const text = 'a,b,c\r\n1,"two, three","say ""hi"""\r\n';
  assert.deepEqual(parseCsv(text), [
    ["a", "b", "c"],
    ["1", "two, three", 'say "hi"'],
  ]);
});

test("semicolons and tabs are detected", () => {
  assert.deepEqual(parseCsv("a;b\n1;2"), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv("a\tb\n1\t2"), [["a", "b"], ["1", "2"]]);
});

test("empty lines are dropped", () => {
  assert.deepEqual(parseCsv("a\n\n1\n"), [["a"], ["1"]]);
});

test("writing CSV quotes only when needed, and reads back the same", () => {
  const rows = [["name", "note"], ["Loaf", 'dense, "gummy"']];
  const text = toCsv(rows);
  assert.equal(text, 'name,note\nLoaf,"dense, ""gummy"""');
  assert.deepEqual(parseCsv(text), rows);
});

test("the headings from Kareem's bake log are recognised", () => {
  const headings = [
    "date", "recipe", "flour_g", "water_g", "sugar_g", "fat_g", "leavener",
    "hydration_%", "oven_temp", "bake_time", "rise/spread", "texture",
    "rating 1-5", "what went wrong", "mood",
  ];
  assert.deepEqual(mapHeadings(headings), [
    "bakedOn", "title", "flourG", "waterG", "sugarG", "fatG", "leavener",
    "hydrationPct", "ovenTempC", "bakeTimeMin", "rise", "texture",
    "rating", "whatWentWrong", null,
  ]);
});

test("a spreadsheet is read into bakes, with errors per line", () => {
  const text = [
    "date,recipe,hydration_%,rating 1-5,mood",
    "2026-01-03,Sourdough,75%,4,happy",
    "2026-01-10,,70,3,meh", // no recipe name
    "2026-13-01,Focaccia,80,5,", // no month 13
  ].join("\n");
  const { rows, ignored, missing } = readBakeCsv(text);
  assert.deepEqual(ignored, ["mood"]);
  assert.equal(missing, false);
  assert.equal(rows[0].bake.hydrationPct, 75);
  assert.equal(rows[0].bake.title, "Sourdough");
  assert.equal(rows[1].line, 3);
  assert.ok(rows[1].error);
  assert.ok(rows[2].error);
});

test("a spreadsheet with no recipe column is flagged", () => {
  assert.equal(readBakeCsv("date,rating\n2026-01-01,4").missing, true);
});

test("the export has database column names", () => {
  const text = bakesToCsv([{ id: 1, recipeId: null, title: "Loaf", bakedOn: "2026-01-01" }]);
  const [header, row] = parseCsv(text);
  assert.equal(header[0], "id");
  assert.ok(header.includes("hydration_pct"));
  assert.equal(row[header.indexOf("title")], "Loaf");
});
