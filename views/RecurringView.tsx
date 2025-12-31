
import React, { useState } from 'react';
import { formatCurrency } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

const CurrencyConverter: React.FC = () => {
    const { t, currencySettings } = useLanguage();
    const currencies = ['ETB', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
    const [amount, setAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState('ETB');
    const [toCurrency, setToCurrency] = useState('USD');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const inputClasses = "mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md";

    const handleConvert = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError(t('converterErrorAmount'));
            setLoading(false);
            return;
        }

        if (fromCurrency === toCurrency) {
            setResult(formatCurrency(numAmount, { ...currencySettings, symbol: toCurrency }));
            setLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `What is the current exchange rate for 1 ${fromCurrency} to ${toCurrency}? Please provide only the numerical value of the conversion rate, nothing else. For example: 0.017`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            const rateText = response.text.trim().replace(/,/g, '');
            const rate = parseFloat(rateText);

            if (isNaN(rate)) {
                console.error("Parsed rate is NaN. Raw response:", response.text);
                throw new Error('Could not parse the exchange rate from the response.');
            }

            const convertedAmount = numAmount * rate;
            setResult(formatCurrency(convertedAmount, { ...currencySettings, symbol: toCurrency }));

        } catch (e) {
            console.error("Currency conversion error:", e);
            setError(t('converterErrorRate'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-full flex flex-col">
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('converterDescription')}</p>
             <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount')}</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="100.00"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('from')}</label>
                            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className={inputClasses}>
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('to')}</label>
                            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className={inputClasses}>
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="self-end">
                            <button onClick={handleConvert} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={loading}>
                                {loading ? <><i className="fas fa-spinner fa-spin"></i><span>{t('converting')}...</span></> : <><i className="fas fa-exchange-alt"></i> <span>{t('convert')}</span></>}
                            </button>
                        </div>
                    </div>
                </div>
                 <div>
                    {error && <div className="mt-4 text-center p-3 bg-red-100 dark:bg-red-900/50 rounded-lg"><p className="font-semibold text-sm text-red-600 dark:text-red-400">{error}</p></div>}
                    {result && !error && <div className="mt-4 text-center p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg"><h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('result')}</h3><p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{result}</p></div>}
                </div>
             </div>
        </div>
    );
};

export default CurrencyConverter;