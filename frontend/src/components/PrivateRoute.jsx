import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // ユーザーが未ログインの場合、ログインページにリダイレクト
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 