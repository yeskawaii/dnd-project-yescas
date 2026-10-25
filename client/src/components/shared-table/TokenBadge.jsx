import TokenVisual from "./TokenVisual";

export default function TokenBadge({ entry }) {
  return <span className={`dm-token ${entry.kind}`} aria-hidden="true">
    <TokenVisual entry={entry} />
  </span>;
}
