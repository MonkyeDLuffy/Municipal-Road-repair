import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { WorkerLogin } from './pages/WorkerLogin';
import { WorkerRegister } from './pages/WorkerRegister';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { WorkerTasks } from './pages/WorkerTasks';
import { WorkerProfile } from './pages/WorkerProfile';
import { SupervisorLogin } from './pages/SupervisorLogin';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { SupervisorReports } from './pages/SupervisorReports';
import { SupervisorReportDetail } from './pages/SupervisorReportDetail';
import { SupervisorProfile } from './pages/SupervisorProfile';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSupervisors } from './pages/AdminSupervisors';
import { AdminSupervisorCreate } from './pages/AdminSupervisorCreate';
import { AdminProfile } from './pages/AdminProfile';
import { CitizenLogin } from './pages/citizen/CitizenLogin';
import { CitizenRegister } from './pages/citizen/CitizenRegister';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportForm } from './pages/citizen/ReportForm';
import { MyReports } from './pages/citizen/MyReports';
import { ReportDetails } from './pages/citizen/ReportDetails';
import { ProtectedRoute, CitizenProtectedRoute, WorkerProtectedRoute, SupervisorProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/worker/login" element={<WorkerLogin />} />
      <Route path="/worker/register" element={<WorkerRegister />} />
      <Route
        path="/worker/dashboard"
        element={
          <WorkerProtectedRoute>
            <WorkerDashboard />
          </WorkerProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks"
        element={
          <WorkerProtectedRoute>
            <WorkerTasks />
          </WorkerProtectedRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <WorkerProtectedRoute>
            <WorkerProfile />
          </WorkerProtectedRoute>
        }
      />
      <Route path="/worker" element={<Navigate to="/worker/dashboard" replace />} />
      
      <Route path="/citizen/login" element={<CitizenLogin />} />
      <Route path="/citizen/register" element={<CitizenRegister />} />
      <Route
        path="/citizen/dashboard"
        element={
          <CitizenProtectedRoute>
            <CitizenDashboard />
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/reports/new"
        element={
          <CitizenProtectedRoute>
            <ReportForm />
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/reports"
        element={
          <CitizenProtectedRoute>
            <MyReports />
          </CitizenProtectedRoute>
        }
      />
      <Route
        path="/citizen/reports/:id"
        element={
          <CitizenProtectedRoute>
            <ReportDetails />
          </CitizenProtectedRoute>
        }
      />
      <Route path="/citizen" element={<Navigate to="/citizen/dashboard" replace />} />
      
      <Route path="/supervisor/login" element={<SupervisorLogin />} />
      <Route
        path="/supervisor/dashboard"
        element={
          <SupervisorProtectedRoute>
            <SupervisorDashboard />
          </SupervisorProtectedRoute>
        }
      />
      <Route
        path="/supervisor/reports"
        element={
          <SupervisorProtectedRoute>
            <SupervisorReports />
          </SupervisorProtectedRoute>
        }
      />
      <Route
        path="/supervisor/reports/:id"
        element={
          <SupervisorProtectedRoute>
            <SupervisorReportDetail />
          </SupervisorProtectedRoute>
        }
      />
      <Route
        path="/supervisor/profile"
        element={
          <SupervisorProtectedRoute>
            <SupervisorProfile />
          </SupervisorProtectedRoute>
        }
      />
      <Route path="/supervisor" element={<Navigate to="/supervisor/dashboard" replace />} />
      
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/supervisors"
        element={
          <AdminProtectedRoute>
            <AdminSupervisors />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/supervisors/new"
        element={
          <AdminProtectedRoute>
            <AdminSupervisorCreate />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <AdminProtectedRoute>
            <AdminProfile />
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}