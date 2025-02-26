import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProjectPlanPage from './pages/ProjectPlanPage';
import AnswerConfirmationPage from './pages/AnswerConfirmationPage';
import AIQuestionsPage from './pages/AIQuestionsPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/applications" replace />} />
          <Route path="/applications" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/project-plan" element={<PrivateRoute><ProjectPlanPage /></PrivateRoute>} />
          <Route path="/confirm-answers" element={<PrivateRoute><AnswerConfirmationPage /></PrivateRoute>} />
          <Route path="/ai-questions" element={<PrivateRoute><AIQuestionsPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 