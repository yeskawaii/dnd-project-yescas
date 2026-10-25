import assert from "node:assert/strict";
import test from "node:test";
import { cellCenter, cellDistance, cellPolygon, mapBounds, tokenViewport } from "./mapGeometry.js";

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

test("centering reveals the full player token on phone, tablet and desktop at every zoom", () => {
  for (const gridType of ["square", "hex"]) {
    const map = { gridType, width: 30, height: 30 };
    for (const width of [244, 299, 692, 1004]) {
      const viewport = { width, height: 360 };
      for (const zoom of [0.65, 0.8, 1, 1.25, 1.5]) {
        for (const token of [{ x: 0, y: 0 }, { x: 29, y: 29 }, { x: 12, y: 10 }, { x: 12, y: 11 }]) {
          const scroll = tokenViewport(map, token, viewport, zoom);
          const center = cellCenter(map, token.x, token.y);
          const left = center.x * zoom - scroll.left;
          const top = center.y * zoom - scroll.top;
          const radius = 16 * zoom;
          assert.ok(left - radius >= 0 && left + radius <= viewport.width);
          assert.ok(top - radius >= 0 && top + radius <= viewport.height);
          assert.ok(scroll.left >= 0 && scroll.top >= 0);
        }
      }
    }
  }
});

test("centering clamps at the board edges and leaves small boards at the origin", () => {
  assert.deepEqual(tokenViewport({ width: 16, height: 14 }, { x: 12, y: 10 }, { width: 300, height: 360 }), {
    left: 381, top: 240,
  });
  assert.deepEqual(tokenViewport({ width: 2, height: 2 }, { x: 1, y: 1 }, { width: 300, height: 360 }), {
    left: 0, top: 0,
  });
});
