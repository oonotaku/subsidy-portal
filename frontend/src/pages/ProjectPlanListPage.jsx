import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ProjectPlanListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/project-plans/', {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/project-plans/start/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to create project');
      
      const data = await response.json();
      navigate(`/project-plan/${data.id}`);
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('事業計画書の作成に失敗しました');
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('この事業計画書を削除しますか？')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/project-plans/${id}/hide/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      toast.success('事業計画書を削除しました');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('事業計画書の削除に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case '作成中':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">作成中</span>;
      case '基本質問完了':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">基本質問完了</span>;
      case 'AI質問対応中':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">AI質問対応中</span>;
      case 'AI質問完了':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">AI質問完了</span>;
      case '事業計画書完成':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">完成</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getProgressIndicator = (project) => {
    const progress = (project.last_answered_question / 6) * 100;
    
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">
            {project.last_answered_question === 6 ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-1" />
                基本質問完了
              </div>
            ) : (
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-1" />
                進行中
              </div>
            )}
          </span>
          <span className="text-sm text-gray-500">
            {project.last_answered_question}/6 質問
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">事業計画書一覧</h1>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {project.title}
                </h2>
                <p className="text-sm text-gray-500">
                  作成開始: {format(new Date(project.created_at), 'yyyy年MM月dd日', { locale: ja })}
                </p>
                <p className="text-sm text-gray-500">
                  最終更新: {format(new Date(project.updated_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </p>
              </div>
              {getStatusBadge(project.status)}
            </div>

            {getProgressIndicator(project)}

            {project.latest_answer && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 font-medium mb-1">最新の回答:</p>
                <p className="text-gray-700">
                  {project.latest_answer.length > 100
                    ? `${project.latest_answer.substring(0, 100)}...`
                    : project.latest_answer}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {project.status === '作成中' && (
                <Link
                  to={`/project-plan/${project.id}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  続きを編集
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              
              {project.status === '基本質問完了' && (
                <Link
                  to={`/project-plan/${project.id}/ai-questions`}
                  className="text-purple-600 hover:text-purple-800 flex items-center"
                >
                  AIの詳細質問に進む
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              
              {project.status === 'AI質問対応中' && (
                <Link
                  to={`/project-plan/${project.id}/ai-questions`}
                  className="text-purple-600 hover:text-purple-800 flex items-center"
                >
                  AI質問を続ける
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              
              {project.status === 'AI質問完了' && (
                <Link
                  to={`/project-plan/${project.id}/generate-document`}
                  className="text-green-600 hover:text-green-800 flex items-center"
                >
                  事業計画書を作成する
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              
              <button
                onClick={(e) => handleDelete(project.id, e)}
                className="text-red-600 hover:text-red-800"
              >
                削除
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            事業計画書がありません。新規作成ボタンから作成を開始してください。
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPlanListPage; 