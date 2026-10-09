export function StatCard({ title, value, icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  const bgClass = colorClasses[color] || colorClasses.primary;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-surface-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}