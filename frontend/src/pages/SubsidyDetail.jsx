import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SubsidyDetail = () => {
  const { id } = useParams();
  const [subsidy, setSubsidy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubsidyDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/subsidies/${id}/`,
          {
            headers: {
              'Authorization': `Token ${user.token}`
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch subsidy details');
        const data = await response.json();
        setSubsidy(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubsidyDetail();
  }, [id, user.token]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!subsidy) return <div className="p-4">補助金が見つかりません</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {subsidy.title || '補助金名が設定されていません'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">補助金番号</p>
              <p className="font-semibold">{subsidy.name || '不明'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">上限金額</p>
              <p className="font-semibold">
                {subsidy.subsidy_max_limit 
                  ? `${Number(subsidy.subsidy_max_limit).toLocaleString()}円`
                  : '要問合せ'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">補助率</p>
              <p className="font-semibold">{subsidy.subsidy_rate || '要問合せ'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">期間・地域</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">受付開始</p>
              <p className="font-semibold">
                {subsidy.acceptance_start_datetime
                  ? new Date(subsidy.acceptance_start_datetime).toLocaleDateString()
                  : '未定'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">受付終了</p>
              <p className="font-semibold">
                {subsidy.acceptance_end_datetime
                  ? new Date(subsidy.acceptance_end_datetime).toLocaleDateString()
                  : '未定'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">対象地域</p>
              <p className="font-semibold">{subsidy.target_area_search || '未定'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">補助金の概要</h2>
          <div 
            className="prose max-w-none prose-headings:text-blue-600 prose-headings:font-bold prose-p:my-4 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: subsidy.detail || subsidy.description || '概要情報がありません'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default SubsidyDetail; 