import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EmailConfirmPage = () => {
  const [status, setStatus] = useState('確認中...');
  const { key } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('メールアドレスの確認が完了しました');
          // 3秒後にログインページへ
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus(data.error || '確認に失敗しました');
        }
      } catch (err) {
        setStatus('エラーが発生しました');
      }
    };

    confirmEmail();
  }, [key, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          メール確認
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center text-lg">
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmPage; 