import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 初期化時にlocalStorageから認証状態を復元
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthProvider: Initializing', { hasToken: !!token });
    if (token) {
      setUser({ token });
    }
  }, []);

  const value = {
    user,
    login: (token) => {
      console.log('AuthContext: Login');
      localStorage.setItem('token', token);
      setUser({ token });
    },
    logout: () => {
      console.log('AuthContext: Logout');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    }
  };

  // 認証状態の変更をログ出力
  useEffect(() => {
    console.log('AuthContext: State changed', { 
      isAuthenticated: !!user,
      hasToken: !!user?.token 
    });
  }, [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 