import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-surface-900">Municipal Road Repair</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/citizen/login" className="text-sm font-medium text-surface-600 hover:text-surface-900">Citizen Login</Link>
              <Link to="/citizen/register" className="btn-primary text-sm">Register</Link>
              <Link to="/worker/login" className="btn-outline text-sm">Worker Login</Link>
              <Link to="/supervisor/login" className="btn-outline text-sm">Supervisor Login</Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-surface-900 mb-6">
              Report Road Problems <span className="text-primary-600">in Your City</span>
            </h1>
            <p className="text-lg text-surface-600 mb-10 max-w-2xl mx-auto">
              Help improve your city's roads by reporting potholes, cracks, and other issues. 
              Your reports help municipal workers prioritize and fix problems faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/citizen/register" className="btn-primary text-lg px-8 py-3">
                Report a Problem
              </Link>
              <Link to="/citizen/login" className="btn-outline text-lg px-8 py-3">
                View My Reports
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white border-t border-surface-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">1. Report</h3>
                <p className="text-surface-600">Submit a report with location, description, and photo of the road issue.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">2. Review</h3>
                <p className="text-surface-600">Municipal supervisors review and prioritize reports based on severity.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">3. Repair</h3>
                <p className="text-surface-600">Work crews are assigned and repairs are tracked to completion.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">For Municipal Staff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Link to="/worker/login" className="card p-6 hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900">Worker Portal</h3>
                    <p className="text-surface-600 text-sm">View assigned tasks, update progress, and manage daily work</p>
                  </div>
                </div>
              </Link>
              <Link to="/supervisor/login" className="card p-6 hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900">Supervisor Portal</h3>
                    <p className="text-surface-600 text-sm">Review reports, approve work orders, manage crews</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <footer className="bg-white border-t border-surface-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-surface-500">
            Municipal Road Repair System &copy; 2024
          </div>
        </footer>
      </main>
    </div>
  );
}