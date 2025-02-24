import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import EmailConfirmPage from './pages/EmailConfirmPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import SubsidyListPage from './pages/SubsidyListPage';
import EligibilityCheckPage from './pages/EligibilityCheckPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/accounts/confirm-email/:key" element={<EmailConfirmPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <SubsidyListPage />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <CompanyProfilePage />
            </PrivateRoute>
          } />
          <Route path="/eligibility-check" element={
            <PrivateRoute>
              <EligibilityCheckPage />
            </PrivateRoute>
          } />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App; 