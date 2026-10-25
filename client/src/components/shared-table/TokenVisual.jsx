import { useId, useState } from "react";
import Icon from "../ui/Icon";
import { tokenIcon, tokenPortrait } from "../../../../shared/mapTokens.mjs";

export default function TokenVisual({ entry, size = 18, x = 0, y = 0, svg = false }) {
  const clipId = useId();
  const [failed, setFailed] = useState("");
  const portrait = tokenPortrait(entry);
  const icon = tokenIcon(entry);
  if (!portrait || failed === portrait) return <Icon name={icon} size={size}
    {...(svg ? { x, y, className: "tactical-token-icon" } : {})} data-token-icon={icon} />;
  const onError = () => setFailed(portrait);
  if (!svg) return <img src={portrait} alt="" className="token-portrait" onError={onError} />;
  return <>
    <defs><clipPath id={clipId}><circle cx={x + size / 2} cy={y + size / 2} r={size / 2} /></clipPath></defs>
    <image href={portrait} x={x} y={y} width={size} height={size} preserveAspectRatio="xMidYMid slice"
      clipPath={`url(#${clipId})`} className="tactical-token-portrait" onError={onError} />
  </>;
}
