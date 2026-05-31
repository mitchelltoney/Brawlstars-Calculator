import { test } from "node:test";
import assert from "node:assert/strict";

import {
  calculate,
  brawlersAlphabetical,
  rarityOrder,
  resolveName,
  resolveUniquePrefix,
  prefixMatches,
  addPick,
  togglePick,
  MAX_PICKS,
} from "../docs/calculate.js";
import { counters } from "../docs/counters.js";

test("calculate returns the documented object shape", () => {
  const out = calculate(["Shelly", "", ""]);
  assert.ok(out && typeof out === "object");
  assert.ok(Array.isArray(out.results));
  assert.ok(Array.isArray(out.doubleOverlaps));
  assert.ok(Array.isArray(out.tripleOverlaps));
  for (const group of out.results) {
    assert.equal(typeof group.brawler, "string");
    assert.ok(Array.isArray(group.counters));
    assert.ok(Array.isArray(group.classes));
  }
});

test("rosters expose the expected 101 brawlers", () => {
  assert.equal(brawlersAlphabetical.length, 101);
  assert.equal(rarityOrder.length, 101);
  assert.equal(new Set(brawlersAlphabetical).size, 101);
  assert.deepEqual(
    new Set(brawlersAlphabetical),
    new Set(rarityOrder),
  );
});

test("single-brawler matchup returns that brawler's direct counters in order", () => {
  const out = calculate(["Shelly", "", ""]);
  assert.equal(out.results.length, 1);
  assert.equal(out.results[0].brawler, "Shelly");
  assert.deepEqual(out.results[0].counters, ["Stu", "Nita", "Spike", "Penny"]);
  assert.deepEqual(out.results[0].classes, []);
  assert.deepEqual(out.doubleOverlaps, []);
  assert.deepEqual(out.tripleOverlaps, []);
});

test("alias resolution: primo → El Primo, miko → Mico, mike → Dynamike, barry → Berry", () => {
  for (const [alias, canonical] of [
    ["primo", "El Primo"],
    ["PRIMO", "El Primo"],
    ["el primo", "El Primo"],
    ["miko", "Mico"],
    ["mike", "Dynamike"],
    ["barry", "Berry"],
  ]) {
    const out = calculate([alias, "", ""]);
    assert.equal(out.results.length, 1, `${alias} should resolve`);
    assert.equal(out.results[0].brawler, canonical, `${alias} → ${canonical}`);
  }
});

test("case-insensitivity: 'penny', 'PENNY', 'Penny' behave identically", () => {
  const a = calculate(["penny", "", ""]);
  const b = calculate(["PENNY", "", ""]);
  const c = calculate(["Penny", "", ""]);
  assert.deepEqual(a, b);
  assert.deepEqual(a, c);
  assert.equal(a.results[0].brawler, "Penny");
});

test("empty and blank inputs are ignored; fewer than 3 real picks works", () => {
  const out = calculate(["", "  ", "Shelly"]);
  assert.equal(out.results.length, 1);
  assert.equal(out.results[0].brawler, "Shelly");

  const none = calculate(["", "", ""]);
  assert.equal(none.results.length, 0);
  assert.deepEqual(none.doubleOverlaps, []);
  assert.deepEqual(none.tripleOverlaps, []);
});

test("doubleOverlaps: two picks sharing a direct counter list it once", () => {
  // Penny and Jessie both have Squeak as a direct counter.
  assert.ok(counters["Penny"].direct.includes("Squeak"));
  assert.ok(counters["Jessie"].direct.includes("Squeak"));
  const out = calculate(["Penny", "Jessie", ""]);
  assert.ok(out.doubleOverlaps.includes("Squeak"));
  assert.equal(out.doubleOverlaps.filter(x => x === "Squeak").length, 1);
  assert.deepEqual(out.tripleOverlaps, []);
});

test("tripleOverlaps: three picks sharing a direct counter list it in triples", () => {
  // Cordelius, Doug, Draco all have Frank as a direct counter.
  for (const b of ["Cordelius", "Doug", "Draco"]) {
    assert.ok(counters[b].direct.includes("Frank"), `${b} should counter via Frank`);
  }
  const out = calculate(["Cordelius", "Doug", "Draco"]);
  assert.ok(out.tripleOverlaps.includes("Frank"));
  assert.ok(!out.doubleOverlaps.includes("Frank"));
});

test("REGRESSION: picks sharing only a class do not leak class tokens into overlaps", () => {
  // Penny, Jessie, and Mandy all have the Thrower class but their only shared
  // direct counter is Squeak (Penny+Jessie). Under the original Python
  // implementation, "T>Thrower" itself appeared as a triple overlap and
  // rendered as a broken image card.
  const out = calculate(["Penny", "Jessie", "Mandy"]);

  const forbidden = ["Thrower", "T>Thrower", "Throwers", "T>Throwers"];
  for (const arr of [out.doubleOverlaps, out.tripleOverlaps]) {
    for (const f of forbidden) {
      assert.ok(!arr.includes(f), `${f} must not appear in overlaps`);
    }
    // Stronger: nothing in overlaps should start with "T>".
    assert.equal(arr.filter(x => x.startsWith("T>")).length, 0);
  }
  // The legitimate direct overlap (Squeak from Penny+Jessie) should still surface.
  assert.ok(out.doubleOverlaps.includes("Squeak"));
});

test("results.counters contains only real brawler names (no class tokens)", () => {
  const out = calculate(["Stu", "Bea", "Ash"]);
  for (const group of out.results) {
    for (const c of group.counters) {
      assert.ok(!c.startsWith("T>"), `counter ${c} must not have T> prefix`);
      assert.ok(c in counters, `counter ${c} must be a real brawler`);
    }
  }
});

test("results.classes contains normalized singular class names", () => {
  const stu = calculate(["Stu", "", ""]).results[0];
  // Stu's original markers were T>Healer and T>Sniper.
  assert.deepEqual(stu.classes, ["Healer", "Sniper"]);
});

test("unknown brawler name is handled gracefully (no throw, no entry)", () => {
  let out;
  assert.doesNotThrow(() => { out = calculate(["NotABrawler", "asdf", "qwerty"]); });
  assert.equal(out.results.length, 0);
  assert.deepEqual(out.doubleOverlaps, []);
  assert.deepEqual(out.tripleOverlaps, []);
});

test("duplicate picks are ignored after the first", () => {
  const out = calculate(["Shelly", "Shelly", "Shelly"]);
  assert.equal(out.results.length, 1);
  assert.equal(out.results[0].brawler, "Shelly");
  // No overlaps because count-of-1 doesn't qualify as double or triple.
  assert.deepEqual(out.doubleOverlaps, []);
  assert.deepEqual(out.tripleOverlaps, []);
});

test("result order follows successful-pick order", () => {
  const out = calculate(["Frank", "Shelly", "Penny"]);
  assert.deepEqual(out.results.map(r => r.brawler), ["Frank", "Shelly", "Penny"]);
});

// ── Pick-queue helpers (shared by icon-click and type-a-name paths) ────────

test("MAX_PICKS is 3", () => {
  assert.equal(MAX_PICKS, 3);
});

test("addPick appends to an empty queue", () => {
  assert.deepEqual(addPick([], "Shelly"), ["Shelly"]);
});

test("addPick appends to a partial queue, preserving order", () => {
  assert.deepEqual(addPick(["Shelly"], "Penny"), ["Shelly", "Penny"]);
  assert.deepEqual(addPick(["Shelly", "Penny"], "Frank"), ["Shelly", "Penny", "Frank"]);
});

test("addPick is a no-op when the name is already present", () => {
  const before = ["Shelly", "Penny"];
  const after = addPick(before, "Shelly");
  assert.deepEqual(after, before);
  // Returns a fresh array (caller may safely mutate without affecting input).
  assert.notEqual(after, before);
});

test("addPick FIFO-evicts the oldest when a 4th distinct name is added", () => {
  const out = addPick(["Shelly", "Penny", "Frank"], "Bo");
  assert.deepEqual(out, ["Penny", "Frank", "Bo"]);
  assert.equal(out.length, MAX_PICKS);
});

test("addPick does not mutate its input", () => {
  const before = ["Shelly", "Penny", "Frank"];
  const snapshot = before.slice();
  addPick(before, "Bo");
  assert.deepEqual(before, snapshot);
});

test("togglePick removes when present", () => {
  assert.deepEqual(togglePick(["Shelly", "Penny"], "Shelly"), ["Penny"]);
});

test("togglePick behaves like addPick when absent (incl. FIFO at MAX)", () => {
  assert.deepEqual(togglePick(["Shelly"], "Penny"), ["Shelly", "Penny"]);
  assert.deepEqual(
    togglePick(["Shelly", "Penny", "Frank"], "Bo"),
    ["Penny", "Frank", "Bo"],
  );
});

test("prefixMatches: case-insensitive prefix, roster order, empty on blank", () => {
  assert.deepEqual(prefixMatches(""), []);
  assert.deepEqual(prefixMatches("   "), []);
  // 'Br' uniquely matches Brock (Bo, Bonnie don't start with 'Br').
  assert.deepEqual(prefixMatches("Br"), ["Brock"]);
  assert.deepEqual(prefixMatches("br"), ["Brock"]);
  // 'Bo' matches Bo and Bonnie, in roster (case-preserving alphabetical) order.
  assert.deepEqual(prefixMatches("Bo"), ["Bo", "Bonnie"]);
  // 'Z' uniquely matches Ziggy.
  assert.deepEqual(prefixMatches("Z"), ["Ziggy"]);
  // No matches.
  assert.deepEqual(prefixMatches("xyz"), []);
});

test("resolveUniquePrefix: returns the only match, or null", () => {
  assert.equal(resolveUniquePrefix("Br"), "Brock");      // unique
  assert.equal(resolveUniquePrefix("br"), "Brock");      // case-insensitive
  assert.equal(resolveUniquePrefix("Z"),  "Ziggy");      // unique
  assert.equal(resolveUniquePrefix("Pen"), "Penny");     // unique
  assert.equal(resolveUniquePrefix("Bo"),  null);        // Bo + Bonnie → ambiguous
  assert.equal(resolveUniquePrefix("B"),   null);        // many matches
  assert.equal(resolveUniquePrefix(""),    null);        // empty
  assert.equal(resolveUniquePrefix("xyz"), null);        // no matches
  assert.equal(resolveUniquePrefix("el p"), "El Primo"); // spaces inside prefix
});

test("resolveName: canonical names, aliases, and unknowns", () => {
  // Exported helper that the new text input uses to resolve user input.
  assert.equal(resolveName("Shelly"), "Shelly");
  assert.equal(resolveName("shelly"), "Shelly");
  assert.equal(resolveName("  SHELLY  "), "Shelly");
  assert.equal(resolveName("primo"), "El Primo");
  assert.equal(resolveName("miko"),  "Mico");
  assert.equal(resolveName("mike"),  "Dynamike");
  assert.equal(resolveName("barry"), "Berry");
  assert.equal(resolveName(""), null);
  assert.equal(resolveName("asdf"), null);
});
