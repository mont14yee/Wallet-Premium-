
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ViewType } from '../types';

interface HeaderProps {
    activeView: ViewType;
}

const Header: React.FC<HeaderProps> = ({ activeView }) => {
    const { t } = useLanguage();

    if (activeView === ViewType.Dashboard) {
        return (
            <header className="py-6 bg-gray-200 dark:bg-gray-700 shadow-lg relative z-20">
                <div className="relative">
                    <div className="flex items-center justify-between px-4 sm:px-6">
                        {/* Left Slot: Empty for balance */}
                        <div className="flex-1 min-w-0 flex justify-start">
                           <div className="w-10 h-10"></div> {/* Placeholder for balance */}
                        </div>

                        {/* Center Slot: Title */}
                        <div className="flex-shrink-0 px-4 text-center">
                            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-gray-800 dark:text-gray-100">
                                <i className="fas fa-wallet"></i> {t('wallet')}
                            </h1>
                        </div>

                        {/* Right Slot: Empty for balance */}
                        <div className="flex-1 min-w-0 flex justify-end">
                           <div className="w-10 h-10"></div> {/* Placeholder for balance */}
                        </div>
                    </div>
                    <p className="text-xl font-semibold tracking-wider text-gray-600 dark:text-gray-300 mt-2 text-center px-4 max-w-3xl mx-auto">
                        {t('appDescription')}
                    </p>
                </div>
            </header>
        );
    }

    // No header for other views
    return null;
};

export default Header;
