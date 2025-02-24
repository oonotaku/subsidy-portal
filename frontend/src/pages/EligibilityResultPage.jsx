import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const EligibilityResultPage = () => {
  const { checkId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [checkId]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/eligibility-check/${checkId}/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error('結果の取得に失敗しました');
    }
  };

  const handleStartApplication = () => {
    navigate(`/application/${checkId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* ヘッダー部分 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">適格性チェック結果</h1>
          </div>

          {/* 結果表示部分 */}
          <div className="p-6 space-y-6">
            {/* 判定結果 */}
            <div className="flex items-center justify-center">
              <div className={`text-center p-4 rounded-full ${
                result?.is_eligible 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <span className="text-xl font-bold">
                  {result?.is_eligible ? '基本要件を満たしています！' : '基本要件を満たしていません'}
                </span>
              </div>
            </div>

            {/* 申請可能な補助金枠 */}
            {result?.eligible_frames?.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg mt-6">
                <h2 className="text-lg font-semibold mb-4">申請可能な補助金枠</h2>
                <div className="space-y-4">
                  {result.eligible_frames.map((frame, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">{frame}</h3>
                        {frame === '小規模枠' && (
                          <p className="text-sm text-gray-600">従業員20人以下、補助上限500万円</p>
                        )}
                        {frame === '通常枠' && (
                          <p className="text-sm text-gray-600">従業員300人以下、補助上限1,000万円</p>
                        )}
                        {frame === '大規模枠' && (
                          <p className="text-sm text-gray-600">従業員2,000人以下、補助上限1億円</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* メッセージ */}
            <div className="text-gray-600">
              <p>{result?.message}</p>
            </div>

            {/* アクションボタン */}
            {result?.is_eligible && (
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleStartApplication}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>申請準備を始める</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-sm text-gray-500 text-center">
                  申請に必要な情報の入力と書類の準備をサポートします
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityResultPage; 