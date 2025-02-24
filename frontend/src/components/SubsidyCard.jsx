import { Link } from 'react-router-dom';

const SubsidyCard = ({ subsidy }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow">
      <div className="mb-6">
        <Link 
          to={`/subsidies/${subsidy.id}`}
          className="text-2xl font-bold text-blue-600 hover:text-blue-800 hover:underline block mb-2"
        >
          {subsidy.title}
        </Link>
        <div className="text-sm text-gray-500">
          登録/更新日: {new Date(subsidy.acceptance_start_datetime).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm mb-1">上限金額</div>
          <div className="text-xl font-semibold text-gray-900">
            {subsidy.subsidy_max_limit 
              ? `${subsidy.subsidy_max_limit.toLocaleString()}円`
              : '要問合せ'}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm mb-1">補助率</div>
          <div className="text-xl font-semibold text-gray-900">
            {subsidy.subsidy_rate || '要問合せ'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm mb-1">補助対象地域</div>
          <div className="font-semibold text-gray-900">
            {subsidy.target_area_search || '未定'}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-medium">受付期間:</span> 
          {new Date(subsidy.acceptance_start_datetime).toLocaleDateString()} 
          ～ {new Date(subsidy.acceptance_end_datetime).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          to={`/subsidies/${subsidy.id}`}
          className="text-blue-500 hover:text-blue-700"
        >
          詳細を見る
        </Link>
      </div>
    </div>
  );
};

export default SubsidyCard; 