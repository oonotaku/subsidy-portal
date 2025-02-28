import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProjectPlanPage from './pages/ProjectPlanPage';
import PrivateRoute from './components/PrivateRoute';
import ProjectPlanListPage from './pages/ProjectPlanListPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/project-plan" element={<PrivateRoute><ProjectPlanPage /></PrivateRoute>} />
          <Route path="/project-plans" element={<PrivateRoute><ProjectPlanListPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 