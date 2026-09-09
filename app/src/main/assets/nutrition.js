(function (root) {
  "use strict";
  const limits = { calories: 20000, protein: 20000, water: 50, steps: 200000 };
  const fields = Object.keys(limits);
  const round = (v) => Math.round(v * 100) / 100;
  function validValue(key, value) {
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= limits[key] &&
      (key === "water" || key === "protein" || Number.isInteger(value))
    );
  }
  function totals(day) {
    for (const key of fields)
      day[key] = round(
        day.manual[key] +
          day.entries.reduce((sum, e) => sum + (Number(e[key]) || 0), 0),
      );
    return day;
  }
  function ensureDay(all, date) {
    const day =
      all[date] ||
      (all[date] = { calories: 0, protein: 0, water: 0, steps: 0 });
    if (!day.manual) {
      day.manual = Object.fromEntries(
        fields.map((k) => [k, validValue(k, day[k]) ? day[k] : 0]),
      );
      day.entries = [];
    }
    if (!Array.isArray(day.entries)) day.entries = [];
    return totals(day);
  }
  function setTotal(all, date, key, value) {
    if (!fields.includes(key) || !validValue(key, value))
      throw Error("Enter a valid, non-negative total.");
    const day = ensureDay(all, date),
      logged = round(
        day.entries.reduce((sum, e) => sum + (Number(e[key]) || 0), 0),
      );
    if (value < logged)
      throw Error(
        `Your entries already contain ${logged} ${key === "water" ? "L" : key === "calories" ? "kcal" : key === "protein" ? "g" : "steps"}. Edit or remove an entry first.`,
      );
    day.manual[key] = round(value - logged);
    return totals(day);
  }
  function addEntry(all, date, entry) {
    if (!entry || !["meal", "water"].includes(entry.kind))
      throw Error("Choose a meal or water entry.");
    const clean = {
      id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      kind: entry.kind,
      at: entry.at || new Date().toISOString(),
    };
    if (entry.kind === "meal") {
      if (!String(entry.name || "").trim())
        throw Error("Give this meal a name.");
      if (
        !validValue("calories", entry.calories) ||
        !validValue("protein", entry.protein)
      )
        throw Error(
          "Enter valid calories and protein; calories must be a whole number.",
        );
      if (!["Breakfast", "Lunch", "Dinner", "Snack"].includes(entry.mealType))
        throw Error("Choose a meal time.");
      Object.assign(clean, {
        name: String(entry.name).trim().slice(0, 100),
        mealType: entry.mealType,
        calories: entry.calories,
        protein: round(entry.protein),
      });
    } else {
      if (!validValue("water", entry.water) || entry.water === 0)
        throw Error("Enter an amount of water above zero.");
      clean.water = entry.water;
      clean.name = "Water";
    }
    const day = ensureDay(all, date);
    const index = day.entries.findIndex((e) => e.id === clean.id),
      old = index < 0 ? null : day.entries[index];
    for (const key of fields) {
      if (
        round(
          day[key] - (Number(old?.[key]) || 0) + (Number(clean[key]) || 0),
        ) > limits[key]
      )
        throw Error(
          "That would exceed the supported daily total. Check the amount.",
        );
    }
    if (index < 0) day.entries.push(clean);
    else day.entries[index] = clean;
    totals(day);
    return clean;
  }
  function removeEntry(all, date, id) {
    const day = ensureDay(all, date),
      i = day.entries.findIndex((e) => e.id === id);
    if (i < 0) return false;
    day.entries.splice(i, 1);
    totals(day);
    return true;
  }
  const api = { ensureDay, setTotal, addEntry, removeEntry, validValue };
  if (typeof module !== "undefined") module.exports = api;
  root.NutritionCore = api;
})(typeof window !== "undefined" ? window : globalThis);
