import { bee } from "@lucide/lab";
import { Icon } from "lucide-react";

function BeeIcon({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <Icon iconNode={bee} size={size} className={className} />;
}

export { BeeIcon };
