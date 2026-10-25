// Pointy-top hexagons, with odd rows shifted half a cell to the right.
const radius = 28;
const hexWidth = Math.sqrt(3) * radius;
export function cellCenter(map, x, y) {
  return map.gridType === "hex"
    ? { x: 6 + hexWidth * (x + 0.5 + (y % 2) / 2), y: 6 + radius + y * radius * 1.5 }
    : { x: 6 + x * 42 + 21, y: 6 + y * 42 + 21 };
}
export function mapBounds(map) {
  return map.gridType === "hex"
    ? { width: 12 + hexWidth * (map.width + (map.height > 1 ? 0.5 : 0)), height: 12 + radius * 2 + (map.height - 1) * radius * 1.5 }
    : { width: 12 + map.width * 42, height: 12 + map.height * 42 };
}
// Scroll the board itself rather than relying on SVG scrollIntoView support.
export function tokenViewport(map, token, viewport, zoom = 1) {
  const center = cellCenter(map, token.x, token.y);
  const bounds = mapBounds(map);
  return {
    left: Math.max(0, Math.min(center.x * zoom - viewport.width / 2, bounds.width * zoom - viewport.width)),
    top: Math.max(0, Math.min(center.y * zoom - viewport.height / 2, bounds.height * zoom - viewport.height)),
  };
}
export function cellPolygon(map, x, y) {
  const center = cellCenter(map, x, y);
  const offsets = map.gridType === "hex"
    ? Array.from({ length: 6 }, (_, i) => {
      const angle = (60 * i - 90) * Math.PI / 180;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    })
    : [[-21, -21], [21, -21], [21, 21], [-21, 21]];
  return offsets.map(([dx, dy]) => `${center.x + dx},${center.y + dy}`).join(" ");
}
export function cellDistance(map, from, to) {
  if (map.gridType === "hex") {
    const axial = ({ x, y }) => ({ q: x - (y - (y % 2)) / 2, r: y });
    const a = axial(from), b = axial(to);
    const q = a.q - b.q, r = a.r - b.r;
    return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
  }
  // Alternating diagonal costs: 1, 2, 1, 2… cells.
  const dx = Math.abs(from.x - to.x), dy = Math.abs(from.y - to.y);
  return Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2);
}
