import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ユーザー情報を永続化
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value = {
    user,
    login: async (email, password) => {
      try {
        const response = await loginUser(email, password);
        // レスポンスの構造を確認
        console.log('Login response:', response);
        // トークンを直接取得
        const token = response.data.token;
        const userData = { token };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error('Login error in context:', error);
        throw error;
      }
    },
    logout: () => {
      console.log('AuthContext: Logout');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  // 認証状態の変更をログ出力
  useEffect(() => {
    console.log('AuthContext: State changed', { 
      isAuthenticated: !!user,
      hasToken: !!user?.token,
      user  // 実際のユーザーオブジェクトも確認
    });
  }, [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 