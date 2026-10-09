import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supervisorApi } from '../services/api';
import { formatDateDisplay } from '../utils/dateUtils';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

const navigation = [
  { name: 'Dashboard', href: '/supervisor/dashboard', icon: DashboardIcon },
  { name: 'Reports', href: '/supervisor/reports', icon: ReportIcon },
  { name: 'Profile', href: '/supervisor/profile', icon: UserIcon },
];

export function SupervisorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);

const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const dashboardRes = await supervisorApi.getDashboard();
      const reportsRes = await supervisorApi.getReports({ status: 'submitted' });
      const underReviewRes = await supervisorApi.getReports({ status: 'under_review' });
      
      setDashboardData(dashboardRes.stats);
      setReportCards([
        ...reportsRes.reports,
        ...underReviewRes.reports
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Set up polling to refresh dashboard data every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    
    setPollInterval(interval);
    
    return () => clearInterval(interval);
  }, []);

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
              <Link to="/supervisor/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-surface-900">Municipal Road Repair</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors flex items-center gap-1"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="btn-outline text-sm px-3 py-1.5"
              >
                Sign Out
              </button>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-surface-600 hover:text-surface-900"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200 py-4">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="btn-outline text-sm px-3 py-1.5 text-left"
              >
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-surface-500">
            <span className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              Supervisor ID: <span className="font-medium text-surface-700">{user?.employeeId}</span>
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Role: <span className="font-medium text-surface-700 capitalize">{user?.role}</span>
            </span>
            <StatusBadge status={user?.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Reports"
            value={dashboardData?.totalReports || 0}
            icon={<ReportIcon />}
            color="primary"
          />
          <StatCard
            title="Submitted"
            value={dashboardData?.submitted || 0}
            icon={<ClockIcon />}
            color="amber"
          />
          <StatCard
            title="Under Review"
            value={dashboardData?.underReview || 0}
            icon={<SearchIcon />}
            color="blue"
          />
          <StatCard
            title="Approved"
            value={dashboardData?.approved || 0}
            icon={<CheckIcon />}
            color="green"
          />
          <StatCard
            title="Rejected"
            value={dashboardData?.rejected || 0}
            icon={<XIcon />}
            color="red"
          />
          <StatCard
            title="In Progress"
            value={dashboardData?.inProgress || 0}
            icon={<TaskIcon />}
            color="purple"
          />
        </div>

        {/* Section: Reports Awaiting Review */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Reports Awaiting Review</h2>
            <Link to="/supervisor/reports" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          {dashboardData && dashboardData.submitted + dashboardData.underReview === 0 ? (
            <EmptyState
              title="No reports awaiting review"
              description="All caught up! 🎉"
              icon={<CheckCircleIcon />}
            />
          ) : (
            <div className="space-y-4">
              {dashboardData && dashboardData.submitted + dashboardData.underReview > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {dashboardData.submitted > 0 && (
                    <div className="col-span-1">
                      <h3 className="text-sm font-semibold text-amber-700 mb-2">Submitted ({dashboardData.submitted})</h3>
                      <div className="space-y-3">
                        {reportCards.filter(r => r.status === 'submitted').slice(0, 2).map((report) => (
                          <ReportCard key={report.id} report={report} />
                        ))}
                      </div>
                    </div>
                  )}
                  {dashboardData.underReview > 0 && (
                    <div className="col-span-1">
                      <h3 className="text-sm font-semibold text-blue-700 mb-2">Under Review ({dashboardData.underReview})</h3>
                      <div className="space-y-3">
                        {reportCards.filter(r => r.status === 'under_review').slice(0, 2).map((report) => (
                          <ReportCard key={report.id} report={report} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Mock report cards for dashboard preview - in real implementation, we'd fetch these
const reportCards = [
  { id: '1', reportNumber: 'RPT-2026-0001', title: 'Large pothole near school', location: 'XYZ Road, Jaipur', status: 'submitted' },
  { id: '2', reportNumber: 'RPT-2026-0002', title: 'Road crack on Highway 12', location: 'Highway 12, Ward 8', status: 'under_review' },
  { id: '3', reportNumber: 'RPT-2026-0003', title: 'Manhole cover missing', location: 'Main Road, Ward 3', status: 'in_progress' },
];

function ReportCard({ report }) {
  return (
    <Link to={`/supervisor/reports/${report.id}`} className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-surface-900">{report.reportNumber}</span>
            <StatusBadge status={report.status} />
          </div>
          <p className="text-sm font-medium text-surface-700 truncate">{report.title}</p>
          <p className="text-xs text-surface-500 mt-0.5">{report.location}</p>
        </div>
      </div>
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}