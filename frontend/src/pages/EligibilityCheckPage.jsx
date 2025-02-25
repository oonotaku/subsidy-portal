import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const EligibilityCheckPage = () => {
  const [searchParams] = useSearchParams();
  const subsidyId = searchParams.get('subsidy');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, [subsidyId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/subsidies/${subsidyId}/eligibility-questions/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('質問の取得に失敗しました');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/eligibility-check/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify({
          subsidy_id: subsidyId,
          answers: answers
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('申請要件を満たしています');
        navigate(`/application/${data.check_id}`);
      } else {
        toast.error(data.error || '申請要件を確認してください');
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">申請要件の確認</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <label className="block font-medium text-gray-700">
                  {question.text}
                </label>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value="yes"
                      onChange={() => handleAnswerChange(question.id, true)}
                      className="form-radio"
                    />
                    <span className="ml-2">はい</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value="no"
                      onChange={() => handleAnswerChange(question.id, false)}
                      className="form-radio"
                    />
                    <span className="ml-2">いいえ</span>
                  </label>
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '確認中...' : '確認する'}
              </button>
            </div>
          </form>
        </div>

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