import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { citizenApi } from '../../services/api';
import { formatDateDisplay } from '../../utils/dateUtils';
import { StatusBadge } from '../../components/Badges';
import { ErrorState } from '../../components/ErrorState';

export function ReportDetails() {
  const { isCitizen } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isCitizen) {
      navigate('/worker/login', { replace: true });
      return;
    }

    const fetchReport = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await citizenApi.getReport(id);
        setReport(data.report);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, isCitizen, navigate]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
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
      <ErrorState
        message="Report not found"
        onRetry={() => navigate('/citizen/reports')}
      />
    );
  }

  const statusColors = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/citizen/reports" className="flex items-center gap-3">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xl font-bold text-surface-900">Report Details</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-surface-900">{report.reportNumber}</span>
            <span className={`badge ${statusColors[report.status] || 'bg-surface-100 text-surface-700 border-surface-200'}`}>
              {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">{report.title}</h1>
        </div>

        <div className="card p-6 space-y-6">
          {report.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-auto max-h-64 object-cover"
              />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-1">Description</p>
            <p className="text-surface-700 whitespace-pre-wrap">{report.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-1">Location</p>
              <p className="text-surface-700">{report.location}</p>
            </div>
            {report.googleMapsUrl && (
              <div>
                <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-1">Google Maps</p>
                <a
                  href={report.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-surface-200">
            <div>
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-1">Reported</p>
              <p className="text-surface-700">{report.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-surface-700">{report.updatedAt}</p>
            </div>
            {report.imageSize && (
              <div>
                <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-1">Image Size</p>
                <p className="text-surface-700">{(report.imageSize / 1024).toFixed(1)} KB</p>
              </div>
            )}
          </div>

          {report.rejectionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
              <p className="text-red-600">{report.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Link to="/citizen/reports" className="btn-outline flex-1">
            Back to Reports
          </Link>
          <Link to="/citizen/reports/new" className="btn-primary flex-1">
            Report Another Problem
          </Link>
        </div>
      </main>
    </div>
  );
}