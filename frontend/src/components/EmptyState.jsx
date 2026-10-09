export function EmptyState({ title, description, icon }) {
  return (
    <div className="card p-12 text-center">
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-surface-900 mb-1">{title}</h3>
      <p className="text-surface-500 text-sm">{description}</p>
    </div>
  );
}