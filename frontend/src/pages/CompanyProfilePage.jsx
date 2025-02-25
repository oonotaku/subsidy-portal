import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CompanyProfilePage = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    representative: '',
    phone_number: '',
    established_date: '',
    capital_amount: '',
    employee_count: '',
    industry_type: '',
    postal_code: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/company-profile/', {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      const data = await response.json();
      if (data && !Array.isArray(data)) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/company-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify({
          company_name: formData.company_name.trim(),
          representative: formData.representative.trim(),
          phone_number: formData.phone_number.trim(),
          established_date: formData.established_date || null,
          capital_amount: formData.capital_amount ? parseInt(formData.capital_amount) : null,
          employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
          industry_type: formData.industry_type?.trim() || null,
          postal_code: formData.postal_code?.trim() || null,
          address: formData.address?.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error('プロフィールの保存に失敗しました');
      }

      toast.success('プロフィールを保存しました');
      navigate('/');  // 保存後はホームページに遷移
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-semibold">基本情報</h2>
              <div>
                <label className="block mb-1">会社名</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">代表者名</label>
                <input
                  type="text"
                  name="representative"
                  value={formData.representative}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">電話番号</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">追加情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">設立日</label>
                  <input
                    type="date"
                    name="established_date"
                    value={formData.established_date}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">資本金（円）</label>
                  <input
                    type="number"
                    name="capital_amount"
                    value={formData.capital_amount}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">従業員数</label>
                  <input
                    type="number"
                    name="employee_count"
                    value={formData.employee_count}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">業種</label>
                  <input
                    type="text"
                    name="industry_type"
                    value={formData.industry_type}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1">郵便番号</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">住所</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfilePage; 