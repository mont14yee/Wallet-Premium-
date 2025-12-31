import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { translations, Language, TranslationKey } from '../locales';
import { CurrencySettings } from '../types';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, ...args: any[]) => string;
    currencySettings: CurrencySettings;
    setCurrencySettings: (settings: Partial<CurrencySettings>) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
    symbol: 'ETB',
    symbolPlacement: 'before',
    numberFormat: 'comma-dot',
    decimalPlaces: 2,
};


export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('wallet-language');
        return (savedLang === 'en' || savedLang === 'am') ? savedLang : 'en'; // Default to English
    });

    const [currencySettings, setCurrencySettingsState] = useState<CurrencySettings>(() => {
        try {
            const savedSettings = localStorage.getItem('wallet-currency-settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Basic validation to prevent app crash if stored data is malformed
                if (parsed.symbol && parsed.symbolPlacement && parsed.numberFormat && parsed.decimalPlaces !== undefined) {
                    return parsed;
                }
            }
        } catch {
            // Ignore parsing errors and fallback to default
        }
        return DEFAULT_CURRENCY_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('wallet-language', language);
    }, [language]);

    useEffect(() => {
        try {
            localStorage.setItem('wallet-currency-settings', JSON.stringify(currencySettings));
        } catch (error) {
            console.error("Could not save currency settings to localStorage", error);
        }
    }, [currencySettings]);

    const t = (key: TranslationKey, ...args: any[]): string => {
        let translation = translations[language][key] || translations['en'][key] || key;
        // Simple argument replacement, e.g., "Hello {0}"
        if (args.length > 0) {
            args.forEach((arg, index) => {
                const regex = new RegExp(`\\{${index}\\}`, 'g');
                translation = translation.replace(regex, arg);
            });
        }
        return translation;
    };

    const setCurrencySettings = (settings: Partial<CurrencySettings>) => {
        setCurrencySettingsState(prev => ({ ...prev, ...settings }));
    };

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
        currencySettings,
        setCurrencySettings,
    }), [language, currencySettings]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};