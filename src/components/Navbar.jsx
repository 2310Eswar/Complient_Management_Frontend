import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Plus, LayoutDashboard } from 'lucide-react';

const Navbar = ({ onOpenNewComplaint }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded-full font-semibold">ADMIN</span>;
      case 'STAFF':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-full font-semibold">STAFF</span>;
      case 'TECHNICIAN':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-semibold">TECHNICIAN</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium">STUDENT</span>;
    }
  };

  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition duration-150">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Campus Resolv
              </span>
              <span className="block text-[10px] tracking-wider font-extrabold text-brand-600 uppercase">
                Enterprise Portal
              </span>
            </div>
          </Link>

          {/* Nav Actions */}
          {user && (
            <div className="flex items-center space-x-3">
              
              {user.role === 'STUDENT' && (
                <button
                  onClick={() => {
                    if (onOpenNewComplaint) {
                      onOpenNewComplaint();
                    } else {
                      navigate('/dashboard?new=true');
                    }
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-600/25 active:scale-95 transition-all duration-200 cursor-pointer"
                  title="File a complaint ticket"
                >
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                  <span className="tracking-wide text-white font-bold">Quick File</span>
                </button>
              )}

              <Link
                to={user.role === 'STUDENT' ? '/dashboard' : user.role === 'TECHNICIAN' ? '/technician' : '/admin'}
                className="btn-modern-ghost"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Info */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
