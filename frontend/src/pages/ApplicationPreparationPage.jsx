import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const ApplicationPreparationPage = () => {
  const { checkId } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // 企業プロフィール情報
    company_name: '',
    representative: '',
    established_date: '',
    postal_code: '',
    address: '',
    phone_number: '',
    
    // 適格性チェック情報
    business_type: '',
    employee_count: '',
    capital_amount: '',
    industry_type: '',
    investment_amount: '',
    
    // 事業計画情報
    project_name: '',
    project_summary: '',
    implementation_period: '',
    
    // ファイル
    business_plan: null,
    company_registry: null,
    tax_return: null,
    other_documents: null
  });

  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchApplicationData();
  }, [checkId]);

  const fetchApplicationData = async () => {
    try {
      console.log('\n=== Fetching Application Data ===');
      console.log('CheckId:', checkId);
      console.log('User:', {
        email: user.email,
        token: user.token
      });
      
      const response = await fetch(`http://localhost:8000/api/applications/${checkId}/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'データの取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('Received data:', {
        company_info: {
          company_name: data.company_name,
          representative: data.representative,
          established_date: data.established_date,
          postal_code: data.postal_code,
          address: data.address,
          phone_number: data.phone_number
        },
        basic_info: {
          business_type: data.business_type,
          employee_count: data.employee_count,
          capital_amount: data.capital_amount,
          industry_type: data.industry_type,
          investment_amount: data.investment_amount
        }
      });
      
      setFormData(prev => {
        const newData = {...prev, ...data};
        console.log('Form data update:', {
          previous: prev,
          new: newData
        });
        return newData;
      });
      setIsPremium(data.is_premium);
      
    } catch (error) {
      console.error('Error in fetchApplicationData:', error);
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 自動保存を実行（デバウンス処理を追加）
    debouncedSave({ [name]: value });
  };

  // デバウンス処理（連続した保存リクエストを防ぐ）
  const debouncedSave = useCallback(
    debounce((updates) => {
      saveData(updates);
    }, 1000),
    []
  );

  // データを保存する関数
  const saveData = async (updates) => {
    try {
      const response = await fetch(`http://localhost:8000/api/applications/${checkId}/`, {
        method: 'PATCH',  // 部分的な更新にPATCHを使用
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }
    } catch (error) {
      console.error('自動保存エラー:', error);
      // ユーザーに通知しない（UXを妨げないため）
    }
  };

  // ファイルの変更時は即時保存
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));

    if (file) {
      const formData = new FormData();
      formData.append(name, file);
      saveFile(formData);
    }
  };

  const saveFile = async (formData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/applications/${checkId}/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('ファイルを保存しました');
      } else {
        throw new Error('ファイルの保存に失敗しました');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // テキストデータの追加
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // ファイルの追加
    if (formData.business_plan) formDataToSend.append('business_plan', formData.business_plan);
    if (formData.company_registry) formDataToSend.append('company_registry', formData.company_registry);
    if (formData.tax_return) formDataToSend.append('tax_return', formData.tax_return);
    if (formData.other_documents) formDataToSend.append('other_documents', formData.other_documents);

    try {
      const response = await fetch(`http://localhost:8000/api/applications/${checkId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${user.token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('保存しました');
      } else {
        throw new Error('保存に失敗しました');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePremiumSubscription = async () => {
    try {
      console.log('Starting subscription process...', checkId);  // デバッグ用
      
      const response = await fetch(`http://localhost:8000/api/create-subscription/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_id: checkId
        })
      });

      const data = await response.json();
      console.log('Stripe response:', data);  // デバッグ用

      if (!response.ok) {
        throw new Error(data.error || '支払い処理の開始に失敗しました');
      }

      // 同じウィンドウで開く（新しいタブではなく）
      window.location.href = data.sessionUrl;

    } catch (error) {
      console.error('Subscription error:', error);  // デバッグ用
      toast.error(error.message);
      setShowPremiumDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">申請準備</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 企業情報セクション */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">企業情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">会社名</label>
                <p className="mt-1 text-gray-900">{formData.company_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">代表者名</label>
                <p className="mt-1 text-gray-900">{formData.representative}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">設立日</label>
                <p className="mt-1 text-gray-900">{formData.established_date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">住所</label>
                <p className="mt-1 text-gray-900">{formData.postal_code}<br />{formData.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">電話番号</label>
                <p className="mt-1 text-gray-900">{formData.phone_number}</p>
              </div>
            </div>
          </div>

          {/* 基本情報セクション */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">事業形態</label>
                <p className="mt-1 text-gray-900">{formData.business_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">従業員数</label>
                <p className="mt-1 text-gray-900">{formData.employee_count}人</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">資本金</label>
                <p className="mt-1 text-gray-900">{formData.capital_amount.toLocaleString()}円</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">業種</label>
                <p className="mt-1 text-gray-900">{formData.industry_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">投資予定額</label>
                <p className="mt-1 text-gray-900">{formData.investment_amount.toLocaleString()}円</p>
              </div>
            </div>
          </div>

          {/* 事業計画セクション */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">事業計画</h2>
            {!isPremium ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  AIによる事業計画書作成支援を利用しませんか？
                </h3>
                <p className="text-gray-600 mb-6">
                  事業計画の作成をAIがサポートします。より効果的な申請書類の作成が可能です。
                </p>
                <button
                  type="button"
                  onClick={() => setShowPremiumDialog(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  プレミアムプランに登録する
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業計画名 *
                  </label>
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業概要 *
                  </label>
                  <textarea
                    name="project_summary"
                    value={formData.project_summary}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    実施期間 *
                  </label>
                  <input
                    type="text"
                    name="implementation_period"
                    value={formData.implementation_period}
                    onChange={handleChange}
                    required
                    placeholder="例：2024年4月〜2025年3月"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 必要書類セクション */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">必要書類</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  事業計画書
                </label>
                <input
                  type="file"
                  name="business_plan"
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf,.doc,.docx"
                />
                <p className="text-sm text-gray-500 mt-1">
                  PDFまたはWord形式（10MB以内）
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  登記簿謄本
                </label>
                <input
                  type="file"
                  name="company_registry"
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf"
                />
                <p className="text-sm text-gray-500 mt-1">
                  PDF形式（5MB以内）
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  確定申告書
                </label>
                <input
                  type="file"
                  name="tax_return"
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf"
                />
                <p className="text-sm text-gray-500 mt-1">
                  PDF形式（5MB以内）
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  その他の書類
                </label>
                <input
                  type="file"
                  name="other_documents"
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf,.zip"
                />
                <p className="text-sm text-gray-500 mt-1">
                  PDFまたはZIP形式（20MB以内）
                </p>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              保存する
            </button>
          </div>
        </form>

        {/* プレミアムプラン登録ダイアログ */}
        {showPremiumDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h3 className="text-lg font-bold mb-4">プレミアムプランの登録</h3>
              <p className="mb-4">月額1,000円で以下の機能が利用できます：</p>
              <ul className="list-disc list-inside mb-6">
                <li>AIによる事業計画書作成支援</li>
                <li>申請書類のチェック機能</li>
                <li>採択率予測機能</li>
              </ul>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowPremiumDialog(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={handlePremiumSubscription}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  登録する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationPreparationPage; 