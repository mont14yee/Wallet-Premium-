import React from 'react';
import { ViewType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavItem {
    id: ViewType;
    icon: string;
    labelKey: 'home' | 'income' | 'expenses' | 'more';
}

const NAV_ITEMS: NavItem[] = [
    { id: ViewType.Dashboard, icon: 'fas fa-home', labelKey: 'home' },
    { id: ViewType.Income, icon: 'fas fa-money-bill-wave', labelKey: 'income' },
    { id: ViewType.Expenses, icon: 'fas fa-receipt', labelKey: 'expenses' },
    { id: ViewType.More, icon: 'fas fa-layer-group', labelKey: 'more' },
];

interface FooterNavProps {
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ activeView, setActiveView }) => {
    const { t } = useLanguage();
    return (
        <nav className="fixed bottom-0 left-0 w-full bg-slate-800 text-slate-200 grid grid-cols-4 py-2 shadow-inner-top z-50 dark:bg-gray-900 dark:text-slate-300">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex flex-col items-center justify-center px-1 py-1 transition-colors duration-300 ease-in-out text-center text-xs w-full h-16 relative rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 dark:focus-visible:ring-offset-gray-900 ${
                        activeView === item.id ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 hover:text-white dark:hover:text-slate-200'
                    }`}
                >
                    <div className={`absolute top-0 h-1 w-8 bg-slate-500 dark:bg-slate-400 rounded-b-full transition-all duration-300 ease-in-out transform ${
                        activeView === item.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}></div>
                    <i className={`${item.icon} text-lg mb-1`}></i>
                    <span className="leading-tight">{t(item.labelKey)}</span>
                </button>
            ))}
        </nav>
    );
};

export default FooterNav;