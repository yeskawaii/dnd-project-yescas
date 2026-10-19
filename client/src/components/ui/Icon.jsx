const paths = {
  palette:
    "M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8h2a4 4 0 0 0 4-4C21 6 17 3 12 3ZM7 10h.01M10 6.5h.01M15 7h.01M6.5 14h.01",
  camera: "M3 7h4l2-3h6l2 3h4v14H3V7ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  bow: "M4 3c12 0 17 5 17 17L4 3ZM4 3v17h17M3 21 18 6M14 6h4v4",
  axe: "m5 21 12-16M12 3c0 5 3 8 8 8l2-7-7-3-3 2ZM5 16l3 3",
  dagger: "m16 3 5 0-2 8-7 6-5-5 9-9ZM5 12l7 7M3 21l5-5",
  helmet:
    "M5 20V10a7 7 0 0 1 14 0v10l-5 2v-7h-4v7l-5-2ZM5 11l5 2M19 11l-5 2M12 3v7",
  flame:
    "M13 2c2 6-3 7-1 11 2-1 3-3 3-5 5 4 7 13-3 14C1 21 3 12 7 8c-1 4 1 5 2 5-2-5 4-7 4-11Z",
  snow: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M3 11l4-1-1-4M21 13l-4 1 1 4M6 18l1-4-4-1M18 6l-1 4 4 1",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
  sun: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5",
  leaf: "M20 3C8 2 1 8 5 16c7 8 17-2 15-13ZM4 21l11-12M8 17v-5M8 17h6",
  paw: "M8 13c1-4 7-4 8 0l3 4c1 5-5 4-7 3-2 1-8 2-7-3l3-4ZM6 7a2 3 0 1 1-4 0 2 3 0 0 1 4 0ZM12 4a2 3 0 1 1-4 0 2 3 0 0 1 4 0ZM18 4a2 3 0 1 1-4 0 2 3 0 0 1 4 0ZM23 8a2 3 0 1 1-4 0 2 3 0 0 1 4 0Z",
  skull:
    "M7 18H5v-4a8 8 0 1 1 14 0v4h-2v4H7v-4ZM8 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM16 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM12 14l-1 3h2l-1-3ZM10 19v3M14 19v3",
  wing: "M3 21C1 10 10 3 22 3c-2 5-3 7-8 8l5 1c-2 5-5 5-9 5l3 2c-3 3-7 3-10 2ZM3 21 17 7",
  potion:
    "M9 3h6M10 3v6l-6 9a3 3 0 0 0 2.5 4h11a3 3 0 0 0 2.5-4l-6-9V3M7 14h10M9 17h.01M14 19h.01",
  gem: "M7 3h10l5 6-10 13L2 9l5-6ZM2 9h20M7 3l5 19 5-19",
  scroll:
    "M6 3h13a3 3 0 0 1 3 3v2h-5V6a3 3 0 0 1 2-3M6 3a3 3 0 0 0-3 3v11h11v2a3 3 0 0 1-6 0M14 19h3V8M7 8h6M7 12h6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  lock: "M5 10h14v11H5V10ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3",
  scene: "M3 4h18v16H3V4ZM3 16l5-5 4 4 3-3 6 6M15 8h.01",
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15",
  copy: "M8 8h13v13H8V8ZM16 8V3H3v13h5",
  sword: "m14 3 7 0 0 7-10 10-7-7L14 3ZM4 14l6 6M3 21l4-4M17 7l-6 6",
  book: "M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-4-2-7-1-10 1Z",
  bag: "M5 7h14l2 14H3L5 7ZM8 7V5a4 4 0 0 1 8 0v2M9 12h6",
  note: "M5 3h14v18H5V3Zm4 5h6M9 12h6M9 16h3",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Z",
  bolt: "m13 2-9 12h7l-1 8 10-13h-7l0-7Z",
  magic:
    "m4 20 12-12 4 4L8 24M14 10l4 4M5 3v6M2 6h6M20 1v4M18 3h4M20 18v4M18 20h4",
  skill: "m12 3 9 5v8l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v8",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  back: "m14 5-7 7 7 7M7 12h14",
  chevron: "m9 5 7 7-7 7",
  up: "m6 14 6-6 6 6",
  down: "m6 10 6 6 6-6",
  grip: "M8 4h1M15 4h1M8 12h1M15 12h1M8 20h1M15 20h1",
  check: "m5 12 4 4L19 6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  edit: "m15 4 5 5-11 11-6 1 1-6L15 4ZM13 6l5 5",
  logout: "M9 3H3v18h6M14 7l5 5-5 5M8 12h13",
  dice: "m12 2 10 6-2 11-8 3-8-3L2 8l10-6ZM2 8l10 4 10-4M12 2v10M4 19l8-7 8 7M12 12v10",
  undo: "M3 10h11a6 6 0 1 1 0 12M3 10l6-6M3 10l6 6",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  link: "m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0",
};

export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.dice} />
    </svg>
  );
}
