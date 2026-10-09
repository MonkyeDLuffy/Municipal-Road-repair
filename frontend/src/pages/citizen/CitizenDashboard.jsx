import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { citizenApi } from '../../services/api';
import { formatDateDisplay } from '../../utils/dateUtils';
import { StatusBadge } from '../../components/Badges';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';

export function CitizenDashboard() {
  const { user, logout, isCitizen } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [dashboardRes, reportsRes] = await Promise.all([
        citizenApi.getDashboard(),
        citizenApi.getReports({ limit: 5 }),
      ]);

      setDashboardData(dashboardRes.stats);
      setRecentReports(reportsRes.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCitizen) {
      navigate('/worker/login', { replace: true });
      return;
    }
    fetchData();
  }, [isCitizen, navigate]);

  const handleRetry = () => {
    fetchData();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent" />
          <p className="text-surface-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-surface-900">Municipal Road Repair</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-500">Citizen</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline text-sm px-3 py-1.5"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-surface-500 text-sm mt-1">Track and manage your road problem reports</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="My Reports"
            value={dashboardData?.totalReports || 0}
            icon={<ReportIcon />}
            color="primary"
          />
          <StatCard
            title="Under Review"
            value={dashboardData?.underReview || 0}
            icon={<ClockIcon />}
            color="amber"
          />
          <StatCard
            title="In Progress"
            value={dashboardData?.inProgress || 0}
            icon={<WrenchIcon />}
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={dashboardData?.resolved || 0}
            icon={<CheckIcon />}
            color="green"
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900">Recent Reports</h2>
          <Link to="/citizen/reports/new" className="btn-primary text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report a Problem
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Start by reporting a road problem in your area"
            icon={<ReportIcon />}
            action={
              <Link to="/citizen/reports/new" className="btn-primary mt-4">
                Report a Problem
              </Link>
            }
          />
        ) : (
          <div className="card divide-y divide-surface-200">
            {recentReports.map((report) => (
              <Link
                key={report.id}
                to={`/citizen/reports/${report.id}`}
                className="p-4 hover:bg-surface-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-surface-900">{report.reportNumber}</span>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="text-sm font-medium text-surface-700 truncate">{report.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5 truncate">{report.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-500">Reported</p>
                  <p className="text-xs font-medium text-surface-700">{report.date}</p>
                </div>
              </Link>
            ))}
            <div className="p-4 text-center">
              <Link to="/citizen/reports" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all reports →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function ReportIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}