import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCheckSquare, 
  FiUsers, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiUser,
  FiGrid,
  FiCalendar,
  FiMoon,
  FiSun,
  FiBell,
  FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Tasks', href: '/tasks', icon: FiCheckSquare },
    { name: 'Kanban', href: '/kanban', icon: FiGrid },
    { name: 'Calendar', href: '/calendar', icon: FiCalendar },
    { name: 'Analytics', href: '/analytics', icon: FiTrendingUp },
    { name: 'Notifications', href: '/notifications', icon: FiBell },
    ...(user?.role === 'admin' || user?.role === 'manager' 
      ? [{ name: 'Users', href: '/users', icon: FiUsers }] 
      : []
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b dark:border-gray-700 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white block leading-none">TaskFlow</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Manage your tasks</span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-2">
            Main Menu
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/50 dark:shadow-primary-900/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:translate-x-1'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-3 py-2 border-t dark:border-gray-700 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
          >
            <span className="flex items-center space-x-3">
              {isDark ? (
                <FiSun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <FiMoon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
              )}
              <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
          </button>
        </div>

        {/* User Info */}
        <div className="border-t dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-2 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold shadow-md text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center space-x-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  user?.role === 'admin' ? 'bg-red-500' : 
                  user?.role === 'manager' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></span>
                <span>{user?.role}</span>
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              to="/profile"
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium group"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 font-medium group"
            >
              <FiLogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="h-full px-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
