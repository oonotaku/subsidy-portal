import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  console.log('PrivateRoute: Checking auth', { user });  // デバッグログを追加

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 