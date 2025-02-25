import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TypeFormContainer from '../components/TypeForm/TypeFormContainer';
import { sampleQuestions } from '../data/sampleQuestions';
import { toast } from 'react-toastify';

const ProjectPlanPage = () => {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);

  const handleComplete = (answers) => {
    console.log('Form completed with answers:', answers);
    toast.success('回答が保存されました');
    // 一時的に結果を表示
    setIsStarted(false);
    // あるいは別のページに遷移
    // navigate('/applications');
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
            onClick={() => setIsStarted(true)}
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