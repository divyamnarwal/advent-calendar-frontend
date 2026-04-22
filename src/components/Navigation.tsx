import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, TrendingUp, Clock, Sparkles, Flame, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Calendar', icon: <Calendar size={20} /> },
  { path: '/progress', label: 'Progress', icon: <TrendingUp size={20} /> },
  { path: '/capsules', label: 'Capsules', icon: <Clock size={20} /> },
  { path: '/recap', label: 'Recap', icon: <Sparkles size={20} /> },
  { path: '/pulse', label: 'Pulse', icon: <Flame size={20} /> },
  { path: '/profile', label: 'Profile', icon: <UserRound size={20} /> },
];

export function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
        <div className="grid grid-cols-4 gap-1 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex min-h-[4rem] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center transition-all hover-lift-subtle ${
                  isActive
                    ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-violet-600'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => {
              void logout();
            }}
            className="flex min-h-[4rem] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-gray-500 transition-colors dark:text-gray-400 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white border-r border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-serif">
            Campus Advent
          </h1>
          {user && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hi, {user.name}!</p>
          )}
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover-lift-subtle ${
                      isActive
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              void logout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
