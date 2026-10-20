import assert from "node:assert/strict";
import test from "node:test";
import { cellCenter, cellDistance, cellPolygon, mapBounds } from "./mapGeometry.js";

test("all six neighbors are one hex away on both even and odd rows", () => {
  const map = { gridType: "hex" };
  for (const y of [2, 3]) {
    const x = 3;
    const side = y % 2 ? 1 : -1;
    for (const point of [{ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 }, { x: x + side, y: y - 1 }, { x: x + side, y: y + 1 }]) {
      assert.equal(cellDistance(map, { x, y }, point), 1, JSON.stringify(point));
      assert.equal(cellDistance(map, point, { x, y }), 1);
      const a = cellCenter(map, x, y), b = cellCenter(map, point.x, point.y);
      assert.ok(Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - Math.sqrt(3) * 28) < 0.0001);
    }
  }
  assert.equal(cellDistance(map, { x: 0, y: 0 }, { x: 4, y: 4 }), 6);
  assert.equal(cellDistance(map, { x: 2, y: 3 }, { x: 2, y: 3 }), 0);
});

test("legacy squares measure alternating diagonals, and long straight routes retain their length", () => {
  const map = {};
  assert.equal(cellDistance(map, { x: 0, y: 0 }, { x: 1, y: 1 }), 1);
  assert.equal(cellDistance(map, { x: 0, y: 0 }, { x: 2, y: 2 }), 3);
  assert.equal(cellDistance(map, { x: 2, y: 3 }, { x: 7, y: 6 }), 6);
  assert.equal(cellDistance(map, { x: 0, y: 0 }, { x: 29, y: 0 }), 29);
});

test("every hex and square vertex fits inside the board, including shifted boundary rows", () => {
  for (const gridType of [undefined, "hex", "square"]) {
    const map = { gridType, width: 30, height: 30 };
    const bounds = mapBounds(map);
    for (const x of [0, 29]) for (const y of [0, 1, 28, 29]) {
      const points = cellPolygon(map, x, y).split(" ").map((point) => point.split(",").map(Number));
      assert.equal(points.length, gridType === "hex" ? 6 : 4);
      for (const [px, py] of points) {
        assert.ok(px >= 0 && px <= bounds.width);
        assert.ok(py >= 0 && py <= bounds.height);
      }
    }
  }
});
