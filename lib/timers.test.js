import assert from "node:assert/strict";
import { test } from "node:test";
import { formatClock, formatMinutes, minutesInStep } from "./timers.js";

test("times are found in steps", () => {
  assert.equal(minutesInStep("Bake 30 to 35 minutes until golden."), 30);
  assert.equal(minutesInStep("Rise 1 to 2 hours until puffy."), 60);
  assert.equal(minutesInStep("Rest about 1 hour."), 60);
  assert.equal(minutesInStep("Chill for 1½ hours."), 90);
  assert.equal(minutesInStep("Bake 20-25 mins."), 20);
  assert.equal(minutesInStep("Mix until smooth."), null);
  assert.equal(minutesInStep("Heat the oven to 200°C."), null);
  assert.equal(minutesInStep("Ferment 48 hours in the fridge."), null);
});

test("timer lengths are written in hours and minutes", () => {
  assert.equal(formatMinutes(30), "30 min");
  assert.equal(formatMinutes(60), "1 h");
  assert.equal(formatMinutes(90), "1 h 30 min");
});

test("clocks are written m:ss or h:mm:ss", () => {
  assert.equal(formatClock(247), "4:07");
  assert.equal(formatClock(3723), "1:02:03");
  assert.equal(formatClock(-5), "0:00");
});
