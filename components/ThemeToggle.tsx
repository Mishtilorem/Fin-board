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
      className="p-2 rounded-lg bg-gray-200/80 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="text-amber-500 dark:text-amber-400" size={20} /> : <Moon className="text-gray-700 dark:text-gray-300" size={20} />}
    </button>
  );
}
