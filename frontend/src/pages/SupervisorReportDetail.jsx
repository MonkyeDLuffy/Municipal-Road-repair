import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supervisorApi } from '../services/api';
import { formatDateDisplay } from '../utils/dateUtils';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { ErrorState } from '../components/ErrorState';

const navigation = [
  { name: 'Dashboard', href: '/supervisor/dashboard', icon: DashboardIcon },
  { name: 'Reports', href: '/supervisor/reports', icon: ReportIcon },
  { name: 'Profile', href: '/supervisor/profile', icon: UserIcon },
];

export function SupervisorReportDetail() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchReport = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await supervisorApi.getReport(id);
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleRetry = () => {
    fetchReport();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleApprove = async () => {
    if (!report) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      await supervisorApi.approveReport(report.id);
      await fetchReport();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!report || !rejectionReason.trim()) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      await supervisorApi.rejectReport(report.id, rejectionReason.trim());
      setShowRejectModal(false);
      setRejectionReason('');
      await fetchReport();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOpen = () => {
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectClose = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent" />
          <p className="text-surface-600">Loading report...</p>
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

  if (!report) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="card p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Report Not Found</h2>
          <p className="text-surface-500 text-sm mb-6">The report you're looking for doesn't exist.</p>
          <Link to="/supervisor/reports" className="btn-primary">Back to Reports</Link>
        </div>
      </div>
    );
  }

  const canApprove = report.status === 'submitted' || report.status === 'under_review';
  const canReject = report.status === 'submitted' || report.status === 'under_review';

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/supervisor/reports" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Reports
              </Link>
              <h1 className="text-2xl font-bold text-surface-900">{report.reportNumber}</h1>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={report.status} />
            </div>
          </div>
        </div>

        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm" role="alert">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{actionError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">{report.title}</h2>
              <div className="prose text-surface-600 max-w-none">
                <p className="whitespace-pre-wrap">{report.description}</p>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Location</h2>
              <p className="text-surface-600 mb-2">{report.location}</p>
              {report.googleMapsUrl && (
                <a
                  href={report.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View Location on Google Maps
                </a>
              )}
            </div>

            {report.citizen && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-surface-900 mb-4">Submitted By</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{report.citizen.name}</p>
                    <p className="text-sm text-surface-500">{report.citizen.email}</p>
                  </div>
                </div>
              </div>
            )}

            {report.rejectionReason && (
              <div className="card p-6 border-red-200 bg-red-50">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h2>
                <p className="text-red-700">{report.rejectionReason}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Report Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-surface-500">Report Number</dt>
                  <dd className="font-mono text-surface-900">{report.reportNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-surface-500">Status</dt>
                  <dd className="flex items-center gap-2">
                    <StatusBadge status={report.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-surface-500">Submitted</dt>
                  <dd className="text-surface-900">{formatDateDisplay(report.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-surface-500">Last Updated</dt>
                  <dd className="text-surface-900">{formatDateDisplay(report.updatedAt)}</dd>
                </div>
                {report.rejectionReason && (
                  <div>
                    <dt className="text-sm text-surface-500">Rejection Reason</dt>
                    <dd className="text-red-700">{report.rejectionReason}</dd>
                  </div>
                )}
              </dl>
            </div>

            {report.imagePath && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-surface-900 mb-4">Report Image</h2>
                <div className="text-center">
                  <img
                    src={`/api/images/${report.id}`}
                    alt={report.title}
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            <div className="card p-6 border-t-4 border-primary-600 bg-primary-50">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">Actions</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="btn-primary flex-1"
                  >
                    {actionLoading ? 'Approving...' : 'Approve Report'}
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={handleRejectOpen}
                    disabled={actionLoading}
                    className="btn-outline flex-1"
                  >
                    Reject Report
                  </button>
                )}
                {!canApprove && !canReject && (
                  <span className="text-surface-500 text-sm py-2">
                    No actions available for this report status
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={handleRejectClose}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Reject Report</h2>
            <p className="text-surface-600 text-sm mb-4">
              Please provide a reason for rejecting this report. The citizen will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full p-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              required
            />
            {actionError && (
              <p className="text-red-600 text-sm mt-2">{actionError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRejectClose}
                disabled={actionLoading}
                className="btn-outline flex-1 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectionReason.trim()}
                className="btn-primary flex-1 py-2"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Report'}
              </button>
            </div>
          </div>
        </div>
      )}
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