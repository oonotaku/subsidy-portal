import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('ログアウトに失敗しました');
      }

      logout();
      toast.success('ログアウトしました');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">補助金ポータル</span>
            </div>
          </div>
          {user && (
            <div className="flex items-center">
              <span className="mr-4">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 