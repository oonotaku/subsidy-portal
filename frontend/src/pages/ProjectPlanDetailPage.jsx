import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { projectQuestions } from '../data/projectQuestions';
import { debounce } from 'lodash';

const ProjectPlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [projectData, setProjectData] = useState({
    id: id,
    title: '',
    status: '',
    last_answered_question: 0,
    created_at: '',
    updated_at: ''
  });
  const [isPhase1Locked, setIsPhase1Locked] = useState(false);

  // 回答の自動保存（デバウンス処理）
  const saveAnswer = debounce(async (questionNumber, answer) => {
    if (!answer.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/answers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify({
          question_number: questionNumber,
          answer: answer
        })
      });
      
      if (!response.ok) throw new Error('Failed to save answer');
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('回答の保存に失敗しました');
      setSaving(false);
    }
  }, 1000);

  // 回答の変更ハンドラ
  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
    
    saveAnswer(currentQuestion, answer);
  };

  // 次の質問へ
  const handleNext = () => {
    if (currentQuestion < projectQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 全ての質問が完了した場合
      completePhase1();
    }
  };

  // 前の質問へ
  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // フェーズ1完了処理
  const completePhase1 = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/complete-phase1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to complete phase 1');
      
      toast.success('基本質問への回答が完了しました！');
      navigate('/project-plans');
      
    } catch (error) {
      console.error('Error completing phase 1:', error);
      toast.error('処理に失敗しました');
    }
  };

  // 初期データの読み込み
  useEffect(() => {
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
        setIsPhase1Locked(data.status !== '作成中');
        
        // 回答データも取得
        const answersResponse = await fetch(`http://localhost:8000/api/project-plans/${id}/answers/`, {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        });
        
        if (answersResponse.ok) {
          const answersData = await answersResponse.json();
          const formattedAnswers = {};
          
          answersData.forEach(item => {
            formattedAnswers[item.question_number] = item.answer;
          });
          
          setAnswers(formattedAnswers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('プロジェクトデータの取得に失敗しました');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id, user.token]);

  // タイトル編集関連の関数を追加
  const startEditingTitle = () => {
    setTitleInput(projectData.title);
    setIsEditingTitle(true);
  };

  const updateTitle = async () => {
    if (!titleInput.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/update-title/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify({ title: titleInput })
      });
      
      if (!response.ok) throw new Error('Failed to update title');
      
      const data = await response.json();
      setProjectData(prev => ({ ...prev, title: data.title }));
      setIsEditingTitle(false);
      toast.success('タイトルを更新しました');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('タイトル更新に失敗しました');
    }
  };

  const generateTitle = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/generate-title/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate title');
      
      const data = await response.json();
      setProjectData(prev => ({ ...prev, title: data.title }));
      toast.success('タイトルを生成しました');
    } catch (error) {
      console.error('Error generating title:', error);
      toast.error('タイトル生成に失敗しました');
    }
  };

  // ファーストステップを確定する関数
  const lockPhase1 = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/lock-phase1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to lock phase 1');
      }
      
      const data = await response.json();
      setIsPhase1Locked(true);
      setProjectData(prev => ({ ...prev, status: data.status }));
      toast.success('基本質問を確定しました。AIの詳細質問に進むことができます。');
      
      // 一覧ページにリダイレクト
      navigate('/project-plans');
    } catch (error) {
      console.error('Error locking phase 1:', error);
      toast.error(error.message || '基本質問の確定に失敗しました');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  const question = projectQuestions[currentQuestion - 1];
  const progress = (currentQuestion / projectQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">事業計画書の作成</h1>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          {currentQuestion} / {projectQuestions.length}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 w-full">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="border rounded px-2 py-1 flex-grow"
                placeholder="タイトルを入力"
                autoFocus
              />
              <button
                onClick={updateTitle}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">{projectData.title || `事業計画書 #${id}`}</h1>
              <button
                onClick={startEditingTitle}
                className="ml-2 text-gray-500 hover:text-gray-700"
                title="タイトルを編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={generateTitle}
                className="ml-2 text-blue-500 hover:text-blue-700"
                title="タイトルを自動生成"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold mb-4">
          {question.text}
        </h2>
        
        {question.help && (
          <p className="text-gray-600 mb-4 text-sm">
            {question.help}
          </p>
        )}
        
        <textarea
          value={answers[currentQuestion] || ''}
          onChange={handleAnswerChange}
          placeholder={question.placeholder}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
        />
        
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 1 || isPhase1Locked}
            className={`px-4 py-2 rounded-md ${
              currentQuestion === 1 || isPhase1Locked
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            前へ
          </button>
          
          <div className="flex items-center">
            {saving && (
              <span className="text-sm text-gray-500 mr-3">保存中...</span>
            )}
            
            {currentQuestion === projectQuestions.length && !isPhase1Locked ? (
              <button
                onClick={lockPhase1}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ml-4"
              >
                基本質問を確定する
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion]?.trim() || isPhase1Locked}
                className={`px-4 py-2 rounded-md ${
                  !answers[currentQuestion]?.trim() || isPhase1Locked
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentQuestion === projectQuestions.length ? '完了' : '次へ'}
              </button>
            )}
          </div>
        </div>
      </div>

      {isPhase1Locked && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            基本質問は確定済みです。編集できません。
          </p>
          <Link
            to="/project-plans"
            className="mt-2 inline-block text-blue-600 hover:text-blue-800"
          >
            プロジェクト一覧に戻る
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectPlanDetailPage; 