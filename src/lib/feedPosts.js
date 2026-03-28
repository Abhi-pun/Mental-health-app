/** @param {string} iso */
export function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Map a Supabase post row (with nested replies) to UI shape.
 * @param {object} row
 */
export function mapRowToPost(row) {
  const raw = row.replies || [];
  const sorted = [...raw].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  );
  return {
    id: row.id,
    tag: row.tag,
    time: formatRelativeTime(row.created_at),
    relates: row.relates_count ?? 0,
    text: row.body,
    replies: sorted.map((r) => ({
      id: r.id,
      text: r.body,
      name: r.display_name || undefined,
    })),
  };
}
