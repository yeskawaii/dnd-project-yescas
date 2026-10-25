import Icon from "../ui/Icon";
import { tokenIcon } from "../../../../shared/mapTokens.mjs";

export default function TokenBadge({ entry }) {
  const icon = tokenIcon(entry);
  return <span className={`dm-token ${entry.kind}`} aria-hidden="true">
    <Icon name={icon} size={18} data-token-icon={icon} />
  </span>;
}
