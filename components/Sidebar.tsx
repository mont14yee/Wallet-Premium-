import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Accordion Section Component
interface AccordionSectionProps {
    title: string;
    icon: string;
    sectionId: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, icon, sectionId, children, isOpen, onToggle }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            aria-expanded={isOpen}
            aria-controls={`section-content-${sectionId}`}
        >
            <span className="flex items-center gap-3 text-lg">
                <i className={`${icon} fa-fw w-6 text-center text-slate-600 dark:text-slate-400`}></i>
                {title}
            </span>
            <i className={`fas fa-chevron-down transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
        <div
            id={`section-content-${sectionId}`}
            className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
            <div className="overflow-hidden">
                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    </div>
);


interface SettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
    const { t, language, setLanguage, currencySettings, setCurrencySettings } = useLanguage();
    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [billReminders, setBillReminders] = useState(true);
    const [targetMilestones, setTargetMilestones] = useState(true);
    const [largeTransactions, setLargeTransactions] = useState(false);

    const [activeSection, setActiveSection] = useState<string | null>(null);

    const toggleSection = (sectionId: string) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const ToggleSwitch: React.FC<{isOn: boolean; onToggle: () => void; id: string}> = ({ isOn, onToggle, id }) => (
        <button onClick={onToggle} id={id} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isOn ? 'bg-slate-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
    
    const sections = {
        appearance: { id: 'appearance', title: t('sidebarAppearance'), icon: 'fas fa-paint-brush' },
        language: { id: 'language', title: t('sidebarLanguage'), icon: 'fas fa-language' },
        currency: { id: 'currency', title: t('sidebarCurrency'), icon: 'fas fa-coins' },
        notifications: { id: 'notifications', title: t('sidebarNotifications'), icon: 'fas fa-bell' },
        security: { id: 'security', title: t('sidebarSecurity'), icon: 'fas fa-shield-alt' },
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 h-full">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <AccordionSection 
                    {...sections.appearance}
                    isOpen={activeSection === sections.appearance.id}
                    onToggle={() => toggleSection(sections.appearance.id)}
                >
                    <div className="flex items-center justify-between">
                        <label htmlFor="darkModeToggle" className="font-semibold flex items-center gap-2"><i className="fas fa-moon"></i> {t('sidebarDarkMode')}</label>
                        <ToggleSwitch isOn={theme === 'dark'} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} id="darkModeToggle" />
                    </div>
                </AccordionSection>

                <AccordionSection 
                    {...sections.language}
                    isOpen={activeSection === sections.language.id}
                    onToggle={() => toggleSection(sections.language.id)}
                >
                     <div className="flex gap-2">
                        <button onClick={() => setLanguage('en')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-colors ${language === 'en' ? 'bg-slate-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>English</button>
                        <button onClick={() => setLanguage('am')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-colors ${language === 'am' ? 'bg-slate-600 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>አማርኛ</button>
                    </div>
                </AccordionSection>

                <AccordionSection 
                    {...sections.currency}
                    isOpen={activeSection === sections.currency.id}
                    onToggle={() => toggleSection(sections.currency.id)}
                >
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebarCurrencySymbol')}</label>
                            <input type="text" id="currencySymbol" value={currencySettings.symbol} onChange={(e) => setCurrencySettings({ symbol: e.target.value })} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" placeholder="e.g., $, €, ETB"/>
                        </div>
                        <div>
                            <label htmlFor="symbolPlacement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebarSymbolPlacement')}</label>
                            <select id="symbolPlacement" value={currencySettings.symbolPlacement} onChange={(e) => setCurrencySettings({ symbolPlacement: e.target.value as 'before' | 'after' })} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm">
                                <option value="before">{t('sidebarSymbolBefore')} ({currencySettings.symbol}100)</option>
                                <option value="after">{t('sidebarSymbolAfter')} (100{currencySettings.symbol})</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="numberFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebarNumberFormat')}</label>
                            <select id="numberFormat" value={currencySettings.numberFormat} onChange={(e) => setCurrencySettings({ numberFormat: e.target.value as any })} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm">
                                <option value="comma-dot">1,234.56</option>
                                <option value="dot-comma">1.234,56</option>
                                <option value="space-dot">1 234.56</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="decimalPlaces" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebarDecimalPlaces')}</label>
                            <input type="number" id="decimalPlaces" min="0" max="6" value={currencySettings.decimalPlaces} onChange={(e) => { const val = parseInt(e.target.value, 10); if (!isNaN(val)) { setCurrencySettings({ decimalPlaces: val }) } }} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection
                    {...sections.notifications}
                    isOpen={activeSection === sections.notifications.id}
                    onToggle={() => toggleSection(sections.notifications.id)}
                >
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="billRemindersToggle" className="font-medium text-sm">{t('sidebarBillReminders')}</label>
                            <ToggleSwitch isOn={billReminders} onToggle={() => setBillReminders(!billReminders)} id="billRemindersToggle" />
                        </div>
                         <div className="flex items-center justify-between">
                            <label htmlFor="targetMilestonesToggle" className="font-medium text-sm">{t('sidebarTargetMilestones')}</label>
                            <ToggleSwitch isOn={targetMilestones} onToggle={() => setTargetMilestones(!targetMilestones)} id="targetMilestonesToggle" />
                        </div>
                         <div className="flex items-center justify-between">
                            <label htmlFor="largeTransactionsToggle" className="font-medium text-sm">{t('sidebarLargeTransactions')}</label>
                            <ToggleSwitch isOn={largeTransactions} onToggle={() => setLargeTransactions(!largeTransactions)} id="largeTransactionsToggle" />
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection
                    {...sections.security}
                    isOpen={activeSection === sections.security.id}
                    onToggle={() => toggleSection(sections.security.id)}
                >
                     <div className="">
                        <div className="flex items-center justify-between">
                            <label htmlFor="appLockToggle" className="font-semibold">{t('sidebarAppLock')}</label>
                            <ToggleSwitch isOn={appLockEnabled} onToggle={() => setAppLockEnabled(!appLockEnabled)} id="appLockToggle" />
                        </div>
                        {appLockEnabled && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2 animate-fadeIn">
                                <button className="w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-3">
                                    <i className="fas fa-key fa-fw"></i> {t('sidebarChangePIN')}
                                </button>
                                 <button className="w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-3">
                                    <i className="fas fa-fingerprint fa-fw"></i> {t('sidebarEnableFingerprint')}
                                </button>
                            </div>
                        )}
                    </div>
                </AccordionSection>
            </div>
        </div>
    );
};

export default SettingsView;