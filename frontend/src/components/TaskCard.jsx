import { PriorityBadge, StatusBadge } from './Badges';
import { formatDateDisplay, formatTimeDisplay } from '../utils/dateUtils';

export function TaskCard({ task }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-surface-900">{task.taskId}</span>
            <StatusBadge status={task.status} />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">{task.title}</h3>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Location</p>
          <p className="text-sm font-medium text-surface-700">{task.location}</p>
        </div>
        <div>
          <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Date</p>
          <p className="text-sm font-medium text-surface-700">{formatDateDisplay(task.date)}</p>
        </div>
        <div>
          <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Time</p>
          <p className="text-sm font-medium text-surface-700">
            {formatTimeDisplay(task.startTime)} – {formatTimeDisplay(task.endTime)}
          </p>
        </div>
        {task.team && (
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Team</p>
            <p className="text-sm font-medium text-surface-700">{task.team}</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-surface-200 flex items-center justify-end">
        <button className="btn-outline text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}