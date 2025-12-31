import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile } from '../../types';

// ==================================================================
// START: Content from components/Sidebar.tsx (SettingsView)
// ==================================================================

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


interface SettingsProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsContent: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const { t, language, setLanguage, currencySettings, setCurrencySettings } = useLanguage();
    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [billReminders, setBillReminders] = useState(true);
    const [targetMilestones, setTargetMilestones] = useState(true);
    const [largeTransactions, setLargeTransactions] = useState(false);

    const [activeSection, setActiveSection] = useState<string | null>('appearance');

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <h2 className="p-4 text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">{t('settings')}</h2>
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
    );
};
// ==================================================================
// END: Content from components/Sidebar.tsx (SettingsView)
// ==================================================================


// ==================================================================
// START: Content from components/charts/ExpenseChart.tsx (AboutView)
// ==================================================================
interface InfoCardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-3">
            <i className={`${icon} text-slate-600 dark:text-slate-400`}></i>
            {title}
        </h3>
        {children}
    </div>
);


interface AboutContentProps {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
}

const AboutContent: React.FC<AboutContentProps> = ({ userProfile, setUserProfile }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const appVersion = '1.1.0';

    const [feedback, setFeedback] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userProfile.name);
    const [email, setEmail] = useState(userProfile.email);
    const [avatar, setAvatar] = useState(userProfile.avatar || '');

    const handleShare = async () => {
        const shareData = {
            title: 'ዋሌት (Wallet) - Budget App',
            text: 'Check out this awesome budget management app!',
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Feedback submitted:', feedback);
        setFeedbackSubmitted(true);
        setFeedback('');
        setTimeout(() => setFeedbackSubmitted(false), 3000);
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUserProfile({ name: name.trim(), email: email.trim(), avatar: avatar.trim() });
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setName(userProfile.name);
        setEmail(userProfile.email);
        setAvatar(userProfile.avatar || '');
        setIsEditing(true);
    };
    
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition";

    return (
        <div className="space-y-6">
            <InfoCard title={t('profile')} icon="fas fa-user-circle">
                {isEditing ? (
                    <form onSubmit={handleProfileSave} className="space-y-4 animate-fadeIn">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebarProfileName')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebarProfileEmail')}</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('avatarUrl')}</label>
                            <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} className={inputClasses} placeholder="https://example.com/image.png"/>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500">{t('cancel')}</button>
                            <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700">{t('saveProfile')}</button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name.replace(/\s/g, '+')}&background=random&color=fff`} alt="User Avatar" className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{userProfile.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile.email}</p>
                            </div>
                        </div>
                        <button onClick={handleEditClick} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                           <i className="fas fa-pencil-alt"></i> {t('sidebarEditProfile')}
                        </button>
                    </div>
                )}
            </InfoCard>
            <InfoCard title={t('sidebarGetInTouch')} icon="fas fa-headset">
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <i className="fas fa-envelope fa-fw text-lg text-slate-600 dark:text-slate-400"></i>
                        <a href="mailto:mon14yee@gmail.com" className="hover:underline text-blue-600 dark:text-blue-400 font-medium">mon14yee@gmail.com</a>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <i className="fab fa-instagram fa-fw text-lg text-slate-600 dark:text-slate-400"></i>
                        <a href="https://www.instagram.com/menkirwolde?igsh=MTY4Nmh1N2FtMHVrNg==" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400 font-medium">@menkirwolde</a>
                    </div>
                </div>
            </InfoCard>

            <InfoCard title={t('feedback')} icon="fas fa-comment-dots">
                <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">{t('sidebarFeedbackDescription')}</p>
                {feedbackSubmitted ? (
                    <div className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                         <p className="font-semibold text-slate-600 dark:text-slate-300">{t('feedbackSent')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                        <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder={t('feedbackPlaceholder')}
                            className={inputClasses}
                            rows={4}
                            required
                        />
                        <button type="submit" className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                            <i className="fas fa-paper-plane"></i> {t('submit')}
                        </button>
                    </form>
                )}
            </InfoCard>
            <InfoCard title={t('sidebarInvite')} icon="fas fa-share-alt">
                <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">{t('sidebarInviteDescription')}</p>
                <button onClick={handleShare} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full hover:bg-slate-700 transition-colors w-full flex items-center justify-center gap-2">
                    <i className="fas fa-share-alt"></i> {copied ? t('sidebarLinkCopied') : t('sidebarShareLink')}
                </button>
            </InfoCard>
            <InfoCard title={t('sidebarAbout')} icon="fas fa-info-circle">
                <div className="text-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{t('sidebarVersion')}</span>
                        <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-md text-xs">{appVersion}</span>
                    </div>
                    <button className="w-full text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors flex items-center justify-center gap-2">
                        <i className="fas fa-cloud-download-alt"></i> {t('sidebarCheckForUpdates')}
                    </button>
                </div>
            </InfoCard>

        </div>
    );
};
// ==================================================================
// END: Content from components/charts/ExpenseChart.tsx (AboutView)
// ==================================================================


// Main combined component
interface SettingsAndAboutViewProps {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsAndAboutView: React.FC<SettingsAndAboutViewProps> = ({ userProfile, setUserProfile, theme, setTheme }) => {
    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 h-full">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <SettingsContent theme={theme} setTheme={setTheme} />
                </div>
                <div>
                    <AboutContent userProfile={userProfile} setUserProfile={setUserProfile} />
                </div>
            </div>
        </div>
    );
};

export default SettingsAndAboutView;