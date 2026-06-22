export function formatBadgeCount(count) {
  if (!count || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}
