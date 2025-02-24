import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProjectPlanPage = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, [applicationId]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/applications/${applicationId}/plans/`,
        {
          headers: {
            'Authorization': `Token ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('事業計画の取得に失敗しました');

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast.error('事業計画の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createNewPlan = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/applications/${applicationId}/plans/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: '新規事業計画',
            investment_amount: 0
          })
        }
      );

      if (!response.ok) throw new Error('事業計画の作成に失敗しました');

      toast.success('新しい事業計画を作成しました');
      fetchPlans();
    } catch (error) {
      toast.error('事業計画の作成に失敗しました');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">事業計画一覧</h1>
        <button
          onClick={createNewPlan}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規事業計画作成
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
            <div className="space-y-2">
              <p className="text-gray-600">投資予定額: {plan.investment_amount.toLocaleString()}円</p>
              <p className="text-gray-600">作成日: {new Date(plan.created_at).toLocaleDateString()}</p>
              <button
                className="mt-4 text-blue-600 hover:text-blue-800"
                onClick={() => navigate(`/application/${applicationId}/plan/${plan.id}`)}
              >
                詳細を見る
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPlanPage; 