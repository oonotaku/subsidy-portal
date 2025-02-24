import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SubsidyCard from '../components/SubsidyCard';
import { useAuth } from '../contexts/AuthContext';

const SubsidyList = () => {
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [acceptanceStatus, setAcceptanceStatus] = useState('1');
  const { user } = useAuth();

  const fetchSubsidies = async (keyword = '', acceptance = '1') => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/subsidies/?keyword=${encodeURIComponent(keyword)}&status=${acceptance}`,
        {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch subsidies');
      const data = await response.json();
      setSubsidies(data.result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubsidies(searchKeyword, acceptanceStatus);
  }, [acceptanceStatus, user.token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubsidies(searchKeyword, acceptanceStatus);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/subsidies/export/', {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'subsidies.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('エクスポートに失敗しました');
    }
  };

  if (error) return <div className="text-red-600 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">補助金一覧</h1>
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Excelダウンロード
        </button>
      </div>

      <div className="mb-8 space-y-4">
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="補助金を検索（例：ものづくり補助金）"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            検索
          </button>
        </form>

        {/* 受付期間フィルター */}
        <div className="flex gap-2">
          <button
            onClick={() => setAcceptanceStatus('1')}
            className={`px-4 py-2 rounded ${
              acceptanceStatus === '1'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            受付中
          </button>
          <button
            onClick={() => setAcceptanceStatus('2')}
            className={`px-4 py-2 rounded ${
              acceptanceStatus === '2'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            受付終了
          </button>
          <button
            onClick={() => setAcceptanceStatus('3')}
            className={`px-4 py-2 rounded ${
              acceptanceStatus === '3'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            受付予定
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-6">
          {subsidies.map(subsidy => (
            <SubsidyCard key={subsidy.id} subsidy={subsidy} />
          ))}
          {subsidies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              該当する補助金が見つかりませんでした
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubsidyList; 