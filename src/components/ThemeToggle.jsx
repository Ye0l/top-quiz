import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-yellow-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-lg backdrop-blur-sm border border-slate-300 dark:border-slate-700 hover:scale-110 active:scale-95 z-50"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            {theme === 'dark' ? <Moon className="w-5 h-5 fill-current" /> : <Sun className="w-5 h-5 fill-current text-orange-500" />}
        </button>
    );
}
