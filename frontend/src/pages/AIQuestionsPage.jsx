import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { saveAIAnswers } from '../services/projectService';

const AIQuestionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { answers, projectId } = location.state || {};
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiAnswers, setAiAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIQuestions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/generate-questions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${user.token}`
          },
          body: JSON.stringify({ 
            project_id: projectId,
            answers 
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate AI questions');
        }

        const data = await response.json();
        console.log('AI Questions response:', data);
        setAiQuestions(Array.isArray(data.questions) ? data.questions : []);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error('AI質問の生成に失敗しました');
        navigate('/applications');
      }
    };

    if (answers && projectId) {
      fetchAIQuestions();
    } else {
      navigate('/applications');
    }
  }, [answers, projectId, user.token, navigate]);

  const handleAnswerChange = (questionId, value) => {
    setAiAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await saveAIAnswers(projectId, aiAnswers, user.token);
      toast.success('回答が保存されました');
      navigate('/applications');
    } catch (error) {
      console.error('Error saving AI answers:', error);
      toast.error('保存に失敗しました');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI生成質問</h1>
      <div className="space-y-6">
        {Array.isArray(aiQuestions) && aiQuestions.map((question) => (
          <div key={question.id} className="border p-4 rounded">
            <p className="font-semibold mb-2">{question.text}</p>
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              placeholder={question.placeholder}
              value={aiAnswers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          回答を保存
        </button>
      </div>
    </div>
  );
};

export default AIQuestionsPage; 