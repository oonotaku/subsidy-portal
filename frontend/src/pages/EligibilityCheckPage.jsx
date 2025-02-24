import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EligibilityCheckPage = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">補助金適格性チェック</h1>
      {/* チェックフォーム */}
    </div>
  );
};

export default EligibilityCheckPage; 