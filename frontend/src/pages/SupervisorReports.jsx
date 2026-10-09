import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supervisorApi } from '../services/api';
import { formatDateDisplay } from '../utils/dateUtils';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

const navigation = [
  { name: 'Dashboard', href: '/supervisor/dashboard', icon: DashboardIcon },
  { name: 'Reports', href: '/supervisor/reports', icon: ReportIcon },
  { name: 'Profile', href: '/supervisor/profile', icon: UserIcon },
];

export function SupervisorReports() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchReports = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await supervisorApi.getReports({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
      });

      setReports(res.reports);
      setPagination(prev => ({
        ...prev,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pagination.page, filters.status]);

  const handleRetry = () => {
    fetchReports();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleFilterChange = (status) => {
    setFilters({ status });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent" />
          <p className="text-surface-600">Loading reports...</p>
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

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'resolved', label: 'Resolved' },
  ];

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
            
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    item.href === '/supervisor/reports'
                      ? 'text-primary-600'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
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
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200 py-4">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    item.href === '/supervisor/reports'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                  }`}
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900">All Reports</h1>
          <p className="text-surface-500 text-sm mt-1">Review and manage citizen road repair reports</p>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filters.status === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && reports.length === 0 ? (
          <div className="min-h-[400px] bg-surface-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent" />
              <p className="text-surface-600">Loading reports...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports found"
            description={filters.status ? `No reports with status "${filters.status}"` : 'No citizen reports submitted yet'}
            icon={<ReportIcon />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-surface-500 border-b border-surface-200">
                    <th className="pb-3 font-medium">Report #</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Citizen</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Submitted</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-surface-50 transition-colors">
                      <td className="py-4 font-mono text-sm text-surface-900">{report.reportNumber}</td>
                      <td className="py-4">
                        <Link to={`/supervisor/reports/${report.id}`} className="font-medium text-surface-900 hover:text-primary-600 truncate block max-w-xs">
                          {report.title}
                        </Link>
                      </td>
                      <td className="py-4 text-sm text-surface-600 truncate max-w-md">{report.location}</td>
                      <td className="py-4 text-sm text-surface-600">
                        {report.citizen ? (
                          <div>
                            <p className="font-medium text-surface-900">{report.citizen.name}</p>
                            <p className="text-xs text-surface-500">{report.citizen.email}</p>
                          </div>
                        ) : (
                          <span className="text-surface-500">Unknown</span>
                        )}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-4 text-sm text-surface-500">{formatDateDisplay(report.createdAt)}</td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/supervisor/reports/${report.id}`}
                          className="btn-outline text-xs py-1.5 px-3"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-outline text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-surface-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-outline text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
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