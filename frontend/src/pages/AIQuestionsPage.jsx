import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AIQuestionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch project data');
      
      const data = await response.json();
      setProjectData(data);
      
      // プロジェクトがファーストステップ完了状態でない場合はリダイレクト
      if (data.status !== '基本質問完了' && data.status !== 'AI質問対応中') {
        toast.error('このプロジェクトはAI質問に進む準備ができていません');
        navigate('/project-plans');
        return;
      }
      
      setLoading(false);
      
      // AI質問対応中の場合は質問を取得
      if (data.status === 'AI質問対応中') {
        fetchAIQuestions();
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('プロジェクトデータの取得に失敗しました');
      setLoading(false);
    }
  };

  const fetchAIQuestions = async () => {
    // 実際のAPIから質問を取得する処理
    // ここではダミーデータを使用
    setAiQuestions([
      { id: 'ai_q1', text: '市場規模はどのくらいですか？' },
      { id: 'ai_q2', text: '主な競合他社は誰ですか？' },
      { id: 'ai_q3', text: '収益モデルについて詳しく説明してください' }
    ]);
  };

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/generate-ai-questions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI questions');
      }
      
      const data = await response.json();
      setAiQuestions(data.questions);
      setProjectData(prev => ({ ...prev, status: 'AI質問対応中' }));
      toast.success('AI質問を生成しました');
    } catch (error) {
      console.error('Error generating AI questions:', error);
      toast.error(error.message || 'AI質問の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (e) => {
    const currentQuestion = aiQuestions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 全ての質問が完了
      completeAIQuestions();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completeAIQuestions = async () => {
    // AI質問の回答を保存し、ステータスを更新する処理
    toast.success('AI質問への回答が完了しました');
    navigate('/project-plans');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  // AI質問がまだ生成されていない場合
  if (projectData.status === '基本質問完了' && aiQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-8">
          <Link to="/project-plans" className="text-blue-600 hover:text-blue-800">
            ← プロジェクト一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold mt-4">{projectData.title || `事業計画書 #${id}`}</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AIによる詳細質問</h2>
          <p className="mb-6">
            基本質問への回答をもとに、AIが事業計画書の作成に必要な詳細質問を生成します。
            このステップでは、より具体的な内容について質問します。
          </p>

          <button
            onClick={generateQuestions}
            disabled={generating}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {generating ? '生成中...' : 'AI質問を生成する'}
          </button>
        </div>
      </div>
    );
  }

  // AI質問に回答する画面
  const currentQuestion = aiQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / aiQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <Link to="/project-plans" className="text-blue-600 hover:text-blue-800">
          ← プロジェクト一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold mt-4">{projectData.title || `事業計画書 #${id}`}</h1>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div 
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          {currentQuestionIndex + 1} / {aiQuestions.length}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">
          {currentQuestion.text}
        </h2>
        
        <textarea
          value={answers[currentQuestion.id] || ''}
          onChange={handleAnswerChange}
          className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="ここに回答を入力してください..."
        />
        
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-md ${
              currentQuestionIndex === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            前へ
          </button>
          
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]?.trim()}
            className={`px-4 py-2 rounded-md ${
              !answers[currentQuestion.id]?.trim()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {currentQuestionIndex === aiQuestions.length - 1 ? '完了' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionsPage; 