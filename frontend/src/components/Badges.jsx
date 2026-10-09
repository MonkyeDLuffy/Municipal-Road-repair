export function PriorityBadge({ priority }) {
  if (!priority) return null;
  
  const p = priority.toLowerCase();
  const className = `badge-${p}`;
  const label = priority.toUpperCase();

  return <span className={`badge ${className}`}>{label}</span>;
}

export function StatusBadge({ status }) {
  if (!status) return null;
  
  const className = `badge-${status.toLowerCase()}`;
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return <span className={`badge ${className}`}>{label}</span>;
}