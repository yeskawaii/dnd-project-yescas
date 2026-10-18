const paths = {
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
