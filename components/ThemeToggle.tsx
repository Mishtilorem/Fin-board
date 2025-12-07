'use client';

import { Moon, Sun } from 'lucide-react';
import useDashboardStore from '@/store/dashboardStore';

export default function ThemeToggle() {
  const theme = useDashboardStore((state) => state.theme);
  const setTheme = useDashboardStore((state) => state.setTheme);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-800/50 dark:hover:to-indigo-800/50 transition-all backdrop-blur-sm border-2 border-purple-300/50 dark:border-purple-700/50 shadow-md"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="text-amber-400 dark:text-amber-300" size={20} /> : <Moon className="text-purple-700 dark:text-purple-300" size={20} />}
    </button>
  );
}
