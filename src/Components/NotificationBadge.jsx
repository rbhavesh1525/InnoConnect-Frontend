import { formatBadgeCount } from "../utils/formatBadgeCount";

export default function NotificationBadge({
  count,
  variant = "overlay",
  className = "",
}) {
  const label = formatBadgeCount(count);
  if (!label) return null;

  const styles =
    variant === "inline"
      ? "inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold"
      : "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none";

  return (
    <span className={`${styles} ${className}`}>
      {label}
    </span>
  );
}
