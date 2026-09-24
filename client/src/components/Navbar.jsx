import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Compass, LogOut, PlusCircle, User } from 'lucide-react';

export default function Navbar({ onOpenAuth }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-500 tracking-wide">
          <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
          <span>Bhopali<span className="text-stone-100">Blogs</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/add-spot"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md shadow-emerald-950"
              >
                <PlusCircle className="w-4 h-4" />
                Add Hidden Gem
              </Link>
              <div className="flex items-center gap-3 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-stone-200">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-stone-400 hover:text-red-400 transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-md shadow-emerald-950"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}