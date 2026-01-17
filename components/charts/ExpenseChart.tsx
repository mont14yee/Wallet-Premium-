import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile } from '../../types';

// ==================================================================
// START: Content for Settings & About
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
            className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:outline-none"
            aria-expanded={isOpen}
            aria-controls={`section-content-${sectionId}`}
        >
            <span className="flex items-center gap-4 text-lg">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
                    <i className={`${icon} fa-fw`}></i>
                </div>
                {title}
            </span>
            <i className={`fas fa-chevron-right transition-transform duration-500 text-gray-400 ${isOpen ? 'rotate-90' : ''}`}></i>
        </button>
        <div
            id={`section-content-${sectionId}`}
            className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
            <div className="overflow-hidden">
                 <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
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
        <button onClick={onToggle} id={id} className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors ${isOn ? 'bg-slate-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'} shadow-md`} />
        </button>
    );
    
    const sections = {
        appearance: { id: 'appearance', title: t('sidebarAppearance'), icon: 'fas fa-palette' },
        language: { id: 'language', title: t('sidebarLanguage'), icon: 'fas fa-globe-europe' },
        currency: { id: 'currency', title: t('sidebarCurrency'), icon: 'fas fa-coins' },
        notifications: { id: 'notifications', title: t('sidebarNotifications'), icon: 'fas fa-bell' },
        security: { id: 'security', title: t('sidebarSecurity'), icon: 'fas fa-shield-halved' },
    };

    const LANGUAGES = [
        { code: 'en', label: 'English', region: 'Global' },
        { code: 'am', label: 'አማርኛ', region: 'Ethiopia' },
        { code: 'fr', label: 'French', region: 'Europe' },
        { code: 'de', label: 'German', region: 'Europe' },
        { code: 'es', label: 'Spanish', region: 'Europe' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <h2 className="p-8 text-2xl font-black text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 uppercase tracking-widest">{t('settings')}</h2>
            <AccordionSection 
                {...sections.appearance}
                isOpen={activeSection === sections.appearance.id}
                onToggle={() => toggleSection(sections.appearance.id)}
            >
                <div className="flex items-center justify-between">
                    <label htmlFor="darkModeToggle" className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-3">
                        <i className={`fas ${theme === 'dark' ? 'fa-moon text-indigo-400' : 'fa-sun text-amber-500'}`}></i> 
                        {t('sidebarDarkMode')}
                    </label>
                    <ToggleSwitch isOn={theme === 'dark'} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} id="darkModeToggle" />
                </div>
            </AccordionSection>

            <AccordionSection 
                {...sections.language}
                isOpen={activeSection === sections.language.id}
                onToggle={() => toggleSection(sections.language.id)}
            >
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as any)}
                            className={`flex flex-col p-4 rounded-2xl transition-all border-2 text-left
                                ${language === lang.code 
                                    ? 'bg-slate-800 border-transparent text-white shadow-lg' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-slate-200'}`}
                        >
                            <span className="font-black uppercase tracking-tight">{lang.label}</span>
                            <span className={`text-[10px] uppercase tracking-widest ${language === lang.code ? 'text-slate-400' : 'text-gray-400'}`}>{lang.region}</span>
                        </button>
                    ))}
                </div>
            </AccordionSection>

            <AccordionSection 
                {...sections.currency}
                isOpen={activeSection === sections.currency.id}
                onToggle={() => toggleSection(sections.currency.id)}
            >
                 <div className="space-y-6">
                    <div>
                        <label htmlFor="currencySymbol" className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t('sidebarCurrencySymbol')}</label>
                        <input type="text" id="currencySymbol" value={currencySettings.symbol} onChange={(e) => setCurrencySettings({ symbol: e.target.value })} className="w-full bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 px-4 focus:ring-2 focus:ring-slate-500 outline-none font-bold" placeholder="e.g., $, €, ETB"/>
                    </div>
                    <div>
                        <label htmlFor="symbolPlacement" className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t('sidebarSymbolPlacement')}</label>
                        <select id="symbolPlacement" value={currencySettings.symbolPlacement} onChange={(e) => setCurrencySettings({ symbolPlacement: e.target.value as 'before' | 'after' })} className="w-full bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 px-4 outline-none font-bold">
                            <option value="before">{t('sidebarSymbolBefore')} ({currencySettings.symbol}100)</option>
                            <option value="after">{t('sidebarSymbolAfter')} (100{currencySettings.symbol})</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="numberFormat" className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t('sidebarNumberFormat')}</label>
                        <select id="numberFormat" value={currencySettings.numberFormat} onChange={(e) => setCurrencySettings({ numberFormat: e.target.value as any })} className="w-full bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl py-3 px-4 outline-none font-bold">
                            <option value="comma-dot">1,234.56</option>
                            <option value="dot-comma">1.234,56</option>
                            <option value="space-dot">1 234.56</option>
                        </select>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection
                {...sections.notifications}
                isOpen={activeSection === sections.notifications.id}
                onToggle={() => toggleSection(sections.notifications.id)}
            >
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <label htmlFor="billRemindersToggle" className="font-bold text-sm">{t('sidebarBillReminders')}</label>
                        <ToggleSwitch isOn={billReminders} onToggle={() => setBillReminders(!billReminders)} id="billRemindersToggle" />
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <label htmlFor="targetMilestonesToggle" className="font-bold text-sm">{t('sidebarTargetMilestones')}</label>
                        <ToggleSwitch isOn={targetMilestones} onToggle={() => setTargetMilestones(!targetMilestones)} id="targetMilestonesToggle" />
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <label htmlFor="largeTransactionsToggle" className="font-bold text-sm">{t('sidebarLargeTransactions')}</label>
                        <ToggleSwitch isOn={largeTransactions} onToggle={() => setLargeTransactions(!largeTransactions)} id="largeTransactionsToggle" />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection
                {...sections.security}
                isOpen={activeSection === sections.security.id}
                onToggle={() => toggleSection(sections.security.id)}
            >
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="appLockToggle" className="font-bold text-gray-700 dark:text-gray-300">{t('sidebarAppLock')}</label>
                        <ToggleSwitch isOn={appLockEnabled} onToggle={() => setAppLockEnabled(!appLockEnabled)} id="appLockToggle" />
                    </div>
                    {appLockEnabled && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 animate-fadeIn">
                            <button className="text-center text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 transition-colors border border-gray-100 dark:border-gray-600 flex items-center justify-center gap-2">
                                <i className="fas fa-key"></i> PIN
                            </button>
                             <button className="text-center text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 transition-colors border border-gray-100 dark:border-gray-600 flex items-center justify-center gap-2">
                                <i className="fas fa-fingerprint"></i> BIO
                            </button>
                        </div>
                    )}
                </div>
            </AccordionSection>
        </div>
    );
};


interface InfoCardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    premium?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, premium }) => (
    <div className={`rounded-[2.5rem] p-8 shadow-xl transition-all duration-500 hover:shadow-2xl border ${premium 
        ? 'bg-gradient-to-br from-slate-800 to-black text-white border-transparent' 
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
        <h3 className={`font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3 ${premium ? 'text-slate-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <i className={`${icon} text-lg ${premium ? 'text-indigo-400' : 'text-slate-500'}`}></i>
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
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userProfile.name);
    const [email, setEmail] = useState(userProfile.email);
    const [avatar, setAvatar] = useState(userProfile.avatar || '');
    const [feedback, setFeedback] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const handleShare = async () => {
        const shareData = { title: 'Wallet Premium', text: 'Master your finances.', url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else throw new Error('Not supported');
        } catch (err) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCheckUpdate = () => {
        setIsCheckingUpdate(true);
        setTimeout(() => setIsCheckingUpdate(false), 2500);
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUserProfile({ name: name.trim(), email: email.trim(), avatar: avatar.trim() });
        setIsEditing(false);
    };

    const inputClasses = "w-full p-4 border-2 rounded-2xl bg-white/5 border-gray-100 dark:border-gray-700 dark:text-white focus:ring-4 focus:ring-slate-500/10 outline-none transition font-bold";

    return (
        <div className="space-y-10">
            {/* Premium Profile Section */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <InfoCard title={t('profile')} icon="fas fa-crown" premium>
                    {isEditing ? (
                        <form onSubmit={handleProfileSave} className="space-y-5 animate-fadeIn">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} placeholder={t('sidebarProfileName')} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} placeholder={t('sidebarProfileEmail')} />
                            <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} className={inputClasses} placeholder="Avatar URL" />
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">{t('cancel')}</button>
                                <button type="submit" className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">{t('saveProfile')}</button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 rounded-full animate-spin-slow"></div>
                                <img src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name.replace(/\s/g, '+')}&background=1e293b&color=fff&size=128`} 
                                     alt="User" 
                                     className="w-24 h-24 rounded-full relative z-10 border-4 border-black p-1 object-cover shadow-2xl" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-3xl font-black tracking-tight">{userProfile.name}</h4>
                                <p className="text-slate-400 font-bold">{userProfile.email}</p>
                                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                                    <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all">
                                        <i className="fas fa-edit mr-2"></i> {t('sidebarEditProfile')}
                                    </button>
                                    <span className="px-5 py-2 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">Premium Elite</span>
                                </div>
                            </div>
                        </div>
                    )}
                </InfoCard>
            </div>

            {/* Developer Card - Deep Premium Overhaul */}
            <div className="bg-slate-900 rounded-[2.5rem] p-[2px] shadow-2xl bg-gradient-to-tr from-indigo-600 via-slate-400 to-rose-600 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                    <i className="fas fa-terminal fa-10x"></i>
                </div>
                <div className="bg-slate-900 backdrop-blur-3xl p-8 rounded-[2.4rem] relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8 border border-indigo-500/20">
                            Master Architect
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                            MENKIR <span className="text-indigo-500">WOLDE</span>
                        </h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full mb-8"></div>
                        <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed italic opacity-80">
                            "Redefining the synergy between engineering precision and aesthetic elegance."
                        </p>
                        
                        <div className="flex gap-6">
                            <a href="mailto:mon14yee@gmail.com" className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-indigo-600 transition-all flex items-center justify-center text-xl text-white shadow-xl hover:-translate-y-2 border border-white/10">
                                <i className="fas fa-envelope"></i>
                            </a>
                            <a href="https://www.instagram.com/menkirwolde?igsh=MTY4Nmh1N2FtMHVrNg==" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-rose-600 transition-all flex items-center justify-center text-xl text-white shadow-xl hover:-translate-y-2 border border-white/10">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support & System Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoCard title={t('feedback')} icon="fas fa-comment-dots">
                    {feedbackSubmitted ? (
                        <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                                <i className="fas fa-check"></i>
                            </div>
                            <p className="font-black uppercase tracking-widest text-sm text-emerald-600">{t('feedbackSent')}</p>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); setFeedbackSubmitted(true); }} className="space-y-4">
                            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder={t('feedbackPlaceholder')} rows={4} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-700 outline-none focus:border-slate-500 transition-colors font-medium text-sm" required />
                            <button type="submit" className="w-full py-4 bg-slate-800 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] transition-all shadow-xl active:scale-95">{t('submit')}</button>
                        </form>
                    )}
                </InfoCard>

                <InfoCard title="System Vitals" icon="fas fa-heartbeat">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('sidebarVersion')}</span>
                            <span className="font-mono bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">v1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Engine Status</span>
                            <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2 tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Optimal
                            </span>
                        </div>
                        <button 
                            onClick={handleCheckUpdate} 
                            disabled={isCheckingUpdate}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3
                                ${isCheckingUpdate ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200'}`}
                        >
                            {isCheckingUpdate ? <i className="fas fa-spinner fa-spin text-sm"></i> : <i className="fas fa-cloud-arrow-down text-sm"></i>}
                            {isCheckingUpdate ? 'Syncing...' : t('sidebarCheckForUpdates')}
                        </button>
                    </div>
                </InfoCard>
            </div>

            {/* Share Section */}
            <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                <div className="text-center sm:text-left relative z-10">
                    <h3 className="text-3xl font-black text-white tracking-tight uppercase mb-2">{t('sidebarInvite')}</h3>
                    <p className="text-indigo-100 font-bold opacity-80 max-w-xs">{t('sidebarInviteDescription')}</p>
                </div>
                <button onClick={handleShare} className="relative z-10 px-10 py-5 bg-white text-indigo-600 font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
                    <i className="fas fa-share-nodes mr-2"></i> {copied ? t('sidebarLinkCopied') : t('sidebarShareLink')}
                </button>
            </div>

            <p className="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] pt-10 pb-20">
                Wallet Premium • Design v1.0 • © 2026
            </p>
        </div>
    );
};


// Main combined component
interface SettingsAndAboutViewProps {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsAndAboutView: React.FC<SettingsAndAboutViewProps> = ({ userProfile, setUserProfile, theme, setTheme }) => {
    return (
        <div className="p-4 sm:p-10 bg-gray-50 dark:bg-gray-900 min-h-full transition-colors duration-500">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5">
                        <SettingsContent theme={theme} setTheme={setTheme} />
                    </div>
                    <div className="lg:col-span-7">
                        <AboutContent userProfile={userProfile} setUserProfile={setUserProfile} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsAndAboutView;