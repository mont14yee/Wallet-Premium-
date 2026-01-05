import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ViewType } from '../types';

interface HeaderProps {
    activeView: ViewType;
    onSettingsClick?: (origin: { x: number, y: number }) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onSettingsClick }) => {
    const { t } = useLanguage();

    const viewConfig = {
        [ViewType.Dashboard]: {
            title: t('wallet'),
            icon: 'fas fa-wallet',
            color: 'text-slate-600 dark:text-slate-300'
        },
        [ViewType.Income]: {
            title: t('income'),
            icon: 'fas fa-money-bill-trend-up',
            color: 'text-emerald-600 dark:text-emerald-400'
        },
        [ViewType.Expenses]: {
            title: t('expenses'),
            icon: 'fas fa-receipt',
            color: 'text-rose-600 dark:text-rose-400'
        },
        [ViewType.More]: {
            title: t('more'),
            icon: 'fas fa-layer-group',
            color: 'text-indigo-600 dark:text-indigo-400'
        }
    };

    const current = viewConfig[activeView];
    const isDashboard = activeView === ViewType.Dashboard;
    const isMore = activeView === ViewType.More;

    return (
        <header className="py-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 relative z-20 transition-colors duration-300">
            <div className="relative">
                <div className="flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
                    {/* Left Slot: Settings for More view */}
                    <div className="flex-1 min-w-0 flex justify-start">
                        {isMore && onSettingsClick ? (
                            <button
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    onSettingsClick({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top + rect.height / 2
                                    });
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-white transition-all shadow-sm active:scale-95 border border-gray-200 dark:border-gray-600"
                                title={t('settings')}
                            >
                                <i className="fas fa-cog fa-lg"></i>
                            </button>
                        ) : (
                            <div className="w-10 h-10"></div>
                        )}
                    </div>

                    {/* Center Slot: Title */}
                    <div className="flex-shrink-0 px-4 text-center">
                        <h1 className={`text-2xl sm:text-3xl font-black flex items-center justify-center gap-3 ${current.color} tracking-tight`}>
                            <i className={`${current.icon} opacity-80`}></i>
                            <span className="uppercase tracking-widest">{current.title}</span>
                        </h1>
                    </div>

                    {/* Right Slot: Empty placeholder for balance or symmetry */}
                    <div className="flex-1 min-w-0 flex justify-end">
                        <div className="w-10 h-10"></div>
                    </div>
                </div>
                
                {isDashboard && (
                    <p className="text-sm font-bold tracking-widest text-gray-400 dark:text-gray-500 mt-2 text-center px-4 max-w-3xl mx-auto uppercase">
                        {t('appDescription')}
                    </p>
                )}
            </div>
        </header>
    );
};

export default Header;