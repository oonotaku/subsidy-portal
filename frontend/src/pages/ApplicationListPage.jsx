import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ApplicationListPage = () => {
  const [applications, setApplications] = useState([]);
  const { user } = useAuth();

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/applications/', {
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('データの取得に失敗しました');
      
      const data = await response.json();
      console.log('Fetched applications:', data);
      setApplications(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('申請一覧の取得に失敗しました');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const getStatusLabel = (status) => {
    const statusMap = {
      'draft': '下書き',
      'in_progress': '作成中',
      'submitted': '申請済み',
      'approved': '承認済み',
      'rejected': '却下'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">事業計画一覧</h1>
        <Link
          to="/eligibility-check"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ものづくり補助金(第19次公募)無料診断
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                事業計画名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終更新日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map(app => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.project_name || '(未設定)'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                    {app.status_display}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.last_edited_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/application/${app.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationListPage; 