const { test } = require("node:test");
const assert = require("node:assert/strict");
const N = require("../app/src/main/assets/nutrition.js");
const today = "2026-09-07";
const meal = (id = "one", calories = 350, protein = 18.5) => ({
  kind: "meal",
  id,
  name: "Besan chilla",
  mealType: "Breakfast",
  calories,
  protein,
});
test("migrates old manual logs without changing or duplicating totals", () => {
  const days = {
    [today]: { calories: 700, protein: 42, water: 1.5, steps: 6300 },
  };
  N.ensureDay(days, today);
  N.ensureDay(days, today);
  assert.deepEqual(days[today].manual, {
    calories: 700,
    protein: 42,
    water: 1.5,
    steps: 6300,
  });
  N.addEntry(days, today, meal());
  assert.equal(days[today].calories, 1050);
  assert.equal(days[today].protein, 60.5);
  const reload = JSON.parse(JSON.stringify(days));
  N.ensureDay(reload, today);
  assert.equal(reload[today].calories, 1050);
});
test("editing replaces previous meal contribution; removing preserves baseline", () => {
  const days = {
    [today]: { calories: 500, protein: 25, water: 1, steps: 1000 },
  };
  N.addEntry(days, today, meal());
  N.addEntry(days, today, meal("one", 420, 22.3));
  assert.equal(days[today].entries.length, 1);
  assert.equal(days[today].calories, 920);
  assert.equal(days[today].protein, 47.3);
  N.removeEntry(days, today, "one");
  assert.equal(days[today].calories, 500);
  assert.equal(days[today].protein, 25);
  assert.equal(N.removeEntry(days, today, "one"), false);
});
test("editing a total accounts for logged meals; rejects totals below entries", () => {
  const days = {};
  N.addEntry(days, today, meal());
  N.setTotal(days, today, "calories", 600);
  assert.equal(days[today].manual.calories, 250);
  assert.throws(
    () => N.setTotal(days, today, "calories", 200),
    /Edit or remove/,
  );
  assert.equal(days[today].calories, 600);
  N.removeEntry(days, today, "one");
  assert.equal(days[today].calories, 250);
});
test("water quick add and undo retain earlier manual water; no floating point drift", () => {
  const days = { [today]: { water: 1.1 } };
  N.addEntry(days, today, { kind: "water", id: "a", water: 0.25 });
  N.addEntry(days, today, { kind: "water", id: "b", water: 0.5 });
  assert.equal(days[today].water, 1.85);
  N.removeEntry(days, today, "b");
  assert.equal(days[today].water, 1.35);
  N.removeEntry(days, today, "a");
  assert.equal(days[today].water, 1.1);
});
test("historical edits and a form saved after midnight keep their intended date", () => {
  const days = {};
  N.addEntry(days, today, meal());
  N.addEntry(days, "2026-09-08", meal("two", 600, 30));
  N.addEntry(days, today, meal("one", 450, 20));
  assert.equal(days[today].calories, 450);
  assert.equal(days["2026-09-08"].calories, 600);
});
test("invalid entries do not corrupt totals; fractional protein is supported", () => {
  const days = {};
  N.addEntry(days, today, meal());
  for (const bad of [
    meal("a", -5),
    meal("a", Infinity),
    meal("a", 0.5),
    meal("a", 20001),
    { ...meal(), name: "  " },
    { ...meal(), mealType: "Whatever" },
  ])
    assert.throws(() => N.addEntry(days, today, bad));
  assert.equal(days[today].calories, 350);
  assert.equal(days[today].entries.length, 1);
  assert.throws(() => N.setTotal(days, today, "steps", 1.1));
  N.setTotal(days, today, "protein", 20.25);
  assert.equal(days[today].protein, 20.25);
});
