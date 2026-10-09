import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supervisorApi } from '../services/api';
import { formatDateDisplay } from '../utils/dateUtils';
import { StatusBadge } from '../components/Badges';

const navigation = [
  { name: 'Dashboard', href: '/supervisor/dashboard', icon: DashboardIcon },
  { name: 'Reports', href: '/supervisor/reports', icon: ReportIcon },
  { name: 'Profile', href: '/supervisor/profile', icon: UserIcon },
];

export function SupervisorProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await supervisorApi.getMe();
        setProfile(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent" />
          <p className="text-surface-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Unable to load profile</h2>
          <p className="text-surface-500 text-sm mb-6">{error}</p>
          <button onClick={handleLogout} className="btn-primary">Sign Out</button>
        </div>
      </div>
    );
  }

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
                    item.href === '/supervisor/profile'
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
                    item.href === '/supervisor/profile'
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
          <p className="text-surface-500 text-sm mt-1">Manage your supervisor account information</p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-surface-900">{profile?.name}</h2>
              <p className="text-surface-500 mt-1">{profile?.employeeId}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={profile?.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label text-surface-500">Full Name</label>
              <p className="text-surface-900 font-medium">{profile?.name}</p>
            </div>
            <div>
              <label className="label text-surface-500">Supervisor ID</label>
              <p className="text-surface-900 font-medium">{profile?.employeeId}</p>
            </div>
            <div>
              <label className="label text-surface-500">Email</label>
              <p className="text-surface-900 font-medium">{profile?.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="label text-surface-500">Role</label>
              <p className="text-surface-900 font-medium capitalize">{profile?.role}</p>
            </div>
            <div>
              <label className="label text-surface-500">Status</label>
              <p className="text-surface-900 font-medium">
                <StatusBadge status={profile?.status} />
              </p>
            </div>
            <div>
              <label className="label text-surface-500">Account Created</label>
              <p className="text-surface-900 font-medium">{profile?.createdAt ? formatDateDisplay(profile.createdAt) : 'Unknown'}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-surface-200">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Account Security</h3>
            <p className="text-surface-600 mb-4">
              Your password is securely hashed and never stored in plain text. 
              For security reasons, password changes are not available in this version.
              Contact your administrator if you need to reset your password.
            </p>
            <div className="p-4 bg-surface-50 rounded-lg">
              <p className="text-sm text-surface-700">
                <strong>Security Tip:</strong> Never share your Supervisor ID or password with anyone. 
                Municipal IT will never ask for your password via email or phone.
              </p>
            </div>
          </div>
        </div>
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