import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const EligibilityCheckPage = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    business_type: '',  // 個人/法人
    employee_count: '',  // 従業員数（個人事業主は1）
    capital_amount: '',  // 資本金（個人事業主は0）
    industry_type: '',  // 業種
    investment_amount: '',  // 投資予定額
    is_innovative: false,  // 革新的な取組
    uses_digital: false,  // デジタル技術活用
    is_sustainable: false  // サステナビリティへの取組
  });

  // ツールチップの説明文
  const tooltips = {
    business_type: "「個人」は個人事業主（フリーランス含む）、「法人」は株式会社などの法人を指します",
    employee_count: "従業員数には、正社員、パート、アルバイトを含みます。個人事業主は「1」と入力してください",
    capital_amount: "資本金は会社設立時に出資した金額です。個人事業主は「0」と入力してください",
    industry_type: "主たる事業の業種を選択してください",
    investment_amount: "補助金を使って投資する予定の総額（税抜）を入力してください。\n" +
      "【投資額の目安】\n" +
      "・小規模枠：100万円～500万円\n" +
      "・通常枠：100万円～1,000万円\n" +
      "・大規模枠：1,000万円～1億円\n" +
      "・製品・サービス高付加価値枠：100万円～3,000万円\n" +
      "・グローバル枠：1,000万円～1億円\n" +
      "※枠ごとに補助率が異なります",
    is_innovative: "新しい製品・サービス、または生産方法・提供方法の導入を計画している場合は「はい」を選択",
    uses_digital: "AI、IoT、クラウドなどのデジタル技術を活用する計画がある場合は「はい」を選択",
    is_sustainable: "環境負荷低減、SDGsへの貢献を含む計画がある場合は「はい」を選択"
  };

  useEffect(() => {
    // プロフィールの必須項目チェック
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/company-profile/', {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      const data = await response.json();
      
      // プロフィールが未完成の場合、プロフィール画面にリダイレクト
      if (!isProfileComplete(data)) {
        navigate('/profile');
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/subsidy-eligibility-check/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        if (data.is_eligible) {
          toast.success('基本要件を満たしています');
          navigate(`/eligibility-result/${data.check_id}`);
        } else {
          toast.warning('申し訳ありませんが、基本要件を満たしていません');
        }
      } else {
        throw new Error(data.error || '適格性チェックに失敗しました');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 必須項目のバリデーション
  const isFormValid = () => {
    return (
      formData.business_type !== '' &&
      formData.employee_count !== '' &&
      formData.capital_amount !== '' &&
      formData.industry_type !== '' &&
      formData.investment_amount !== ''
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">補助金適格性チェック</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* 事業形態 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事業形態
              <span 
                className="ml-2 text-blue-500 cursor-help"
                data-tooltip-id="business-type-tooltip"
                data-tooltip-content={tooltips.business_type}
              >
                ？
              </span>
            </label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">選択してください</option>
              <option value="individual">個人</option>
              <option value="corporation">法人</option>
            </select>
          </div>

          {/* 従業員数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              従業員数
              <span 
                className="ml-2 text-blue-500 cursor-help"
                data-tooltip-id="employee-count-tooltip"
                data-tooltip-content={tooltips.employee_count}
              >？</span>
            </label>
            <input
              type="number"
              name="employee_count"
              value={formData.employee_count}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* 資本金 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資本金（円）
              <span 
                className="ml-2 text-blue-500 cursor-help"
                data-tooltip-id="capital-amount-tooltip"
                data-tooltip-content={tooltips.capital_amount}
              >？</span>
            </label>
            <input
              type="number"
              name="capital_amount"
              value={formData.capital_amount}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* 業種 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              業種
              <span 
                className="ml-2 text-blue-500 cursor-help"
                data-tooltip-id="industry-type-tooltip"
                data-tooltip-content={tooltips.industry_type}
              >？</span>
            </label>
            <select
              name="industry_type"
              value={formData.industry_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">選択してください</option>
              <option value="製造業">製造業</option>
              <option value="サービス業">サービス業</option>
              <option value="小売業">小売業</option>
              <option value="卸売業">卸売業</option>
              <option value="建設業">建設業</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* 投資予定額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投資予定額（円）
              <span 
                className="ml-2 text-blue-500 cursor-help"
                data-tooltip-id="investment-amount-tooltip"
                data-tooltip-content={tooltips.investment_amount}
              >？</span>
            </label>
            <input
              type="number"
              name="investment_amount"
              value={formData.investment_amount}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* チェックボックス群 */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_innovative"
                checked={formData.is_innovative}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                革新的な取組
                <span 
                  className="ml-2 text-blue-500 cursor-help"
                  data-tooltip-id="is-innovative-tooltip"
                  data-tooltip-content={tooltips.is_innovative}
                >？</span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="uses_digital"
                checked={formData.uses_digital}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                デジタル技術活用
                <span 
                  className="ml-2 text-blue-500 cursor-help"
                  data-tooltip-id="uses-digital-tooltip"
                  data-tooltip-content={tooltips.uses_digital}
                >？</span>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_sustainable"
                checked={formData.is_sustainable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                サステナビリティへの取組
                <span 
                  className="ml-2 text-blue-500 cursor-help"
                  data-tooltip-id="is-sustainable-tooltip"
                  data-tooltip-content={tooltips.is_sustainable}
                >？</span>
              </label>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-2 px-4 rounded ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              チェックを実行
            </button>
          </div>
        </form>

        {/* すべてのツールチップ */}
        <Tooltip id="business-type-tooltip" />
        <Tooltip id="employee-count-tooltip" />
        <Tooltip id="capital-amount-tooltip" />
        <Tooltip id="industry-type-tooltip" />
        <Tooltip id="investment-amount-tooltip" />
        <Tooltip id="is-innovative-tooltip" />
        <Tooltip id="uses-digital-tooltip" />
        <Tooltip id="is-sustainable-tooltip" />
      </div>
    </div>
  );
};

export default EligibilityCheckPage; 