import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ListTodo, LogOut, Trash2, Settings, MessageSquare } from 'lucide-react';
import logoText from '../assets/icon/task-master-text.png';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
            <img
            src={logoText}
            alt="TaskMaster Logo"
            className="sidebar-logo"
            />
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>
            <ListTodo size={20} /> All Tasks
          </Link>
          <Link to="/trash" className={location.pathname === '/trash' ? 'active' : ''}>
            <Trash2 size={20} /> Trash
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <div className="user-profile" ref={menuRef}>
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
            <div className="user-avatar" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {user && getInitials(user.first_name, user.last_name)}
            </div>
            {isMenuOpen && (
              // todo
              <div className="profile-dropdown">
                <div className="dropdown-item">
                  <MessageSquare size={18} />
                  <span>Messages</span>
                  <span className="notification-badge">3</span>
                </div>
                <div className="dropdown-item">
                  <Settings size={18} />
                  <span>Settings</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
