import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ログインに失敗しました');
      }

      const data = await response.json();
      const userData = {
        email: email,
        token: data.token,
      };

      // プロフィール情報を取得
      const profileResponse = await fetch('http://localhost:8000/api/company-profile/', {
        headers: {
          'Authorization': `Token ${data.token}`,
        },
      });

      const hasProfile = profileResponse.ok && Object.keys(await profileResponse.json()).length > 0;

      setUser({ ...userData, hasProfile });
      localStorage.setItem('user', JSON.stringify(userData));

      // プロフィールが未登録の場合はプロフィール登録画面へ
      if (!hasProfile) {
        window.location.href = '/profile';
      }

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  console.log('Current user:', user); // デバッグ用

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 