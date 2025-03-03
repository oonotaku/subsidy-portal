import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProjectPlanPage from './pages/ProjectPlanPage';
import PrivateRoute from './components/PrivateRoute';
import ProjectPlanListPage from './pages/ProjectPlanListPage';
import ProjectPlanDetailPage from './pages/ProjectPlanDetailPage';
import AIQuestionsPage from './pages/AIQuestionsPage';
import GenerateDocumentPage from './pages/GenerateDocumentPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <PrivateRoute>
                <Header />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/project-plan" element={<ProjectPlanPage />} />
                    <Route path="/project-plans" element={<ProjectPlanListPage />} />
                    <Route path="/project-plan/:id" element={<ProjectPlanDetailPage />} />
                    <Route path="/project-plan/:id/ai-questions" element={<AIQuestionsPage />} />
                    <Route path="/project-plan/:id/generate-document" element={<GenerateDocumentPage />} />
                  </Routes>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 