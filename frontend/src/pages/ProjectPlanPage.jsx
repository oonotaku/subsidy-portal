import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TypeFormContainer from '../components/TypeForm/TypeFormContainer';
import { sampleQuestions } from '../data/sampleQuestions';
import { saveProjectAnswers, createProject } from '../services/projectService';
import { toast } from 'react-toastify';

const ProjectPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isStarted, setIsStarted] = useState(false);
  const [projectId, setProjectId] = useState(null);

  const handleComplete = async (answers) => {
    try {
      await saveProjectAnswers(projectId, answers, user.token);
      toast.success('回答が保存されました');
      navigate('/confirm-answers', { 
        state: { answers, projectId } 
      });
    } catch (error) {
      toast.error('保存に失敗しました');
      console.error('Error saving answers:', error);
    }
  };

  const handleStart = async () => {
    try {
      const { project_id } = await createProject(user.token);
      setProjectId(project_id);
      setIsStarted(true);
    } catch (error) {
      toast.error('プロジェクトの作成に失敗しました');
      console.error('Error creating project:', error);
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            事業計画書の作成を始めましょう
          </h1>
          <p className="text-gray-600 mb-8">
            質問に答えていくことで、事業計画書を作成していきます。
            途中で保存することもできます。
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            始める
          </button>
        </div>
      </div>
    );
  }

  return (
    <TypeFormContainer 
      questions={sampleQuestions} 
      onComplete={handleComplete}
    />
  );
};

export default ProjectPlanPage; 