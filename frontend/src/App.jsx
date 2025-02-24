import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailConfirmPage from './pages/EmailConfirmPage';
import ApplicationListPage from './pages/ApplicationListPage';
import EligibilityCheckPage from './pages/EligibilityCheckPage';
import ApplicationPreparationPage from './pages/ApplicationPreparationPage';
import ProjectPlanPage from './pages/ProjectPlanPage';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/accounts/confirm-email/:key" element={<EmailConfirmPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <ApplicationListPage />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <ApplicationListPage />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/eligibility-check"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <EligibilityCheckPage />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/application/:checkId"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <ApplicationPreparationPage />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/application/:applicationId/plans"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <ProjectPlanPage />
                </>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="bottom-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 