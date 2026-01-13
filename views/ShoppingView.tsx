import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';

// --- UI Components ---
const InputField: React.FC<{ label: string; icon: string; type: string; value: string; onChange: (val: string) => void; placeholder?: string; step?: string; min?: string; unit?: string }> = ({ label, icon, type, value, onChange, unit, ...props }) => (
    <div className="group">
        <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2 ml-1 transition-colors group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-transform group-focus-within:scale-110">
                <i className={`${icon} text-gray-400 dark:text-gray-500 group-focus-within:text-slate-500`}></i>
            </div>
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="block w-full rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/80 dark:text-white py-4 pl-12 pr-4 text-lg font-bold focus:border-slate-500 dark:focus:border-slate-400 focus:ring-0 transition-all shadow-sm group-hover:border-gray-200 dark:group-hover:border-gray-600 outline-none" 
                {...props} 
            />
            {unit && <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"><span className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest">{unit}</span></div>}
        </div>
    </div>
);

const ResultDisplay: React.FC<{ title: string; children: React.ReactNode; icon: string; variant?: 'success' | 'info' | 'warning' }> = ({ title, children, icon, variant = 'info' }) => {
    const bgStyles = {
        success: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        info: 'from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300',
        warning: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300'
    };

    return (
        <div className={`mt-8 p-6 bg-gradient-to-br ${bgStyles[variant]} rounded-[2rem] shadow-xl border-2 animate-fadeIn relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <i className={`${icon} fa-4x`}></i>
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-60 text-center mb-4 flex items-center justify-center gap-2">
                <i className={`${icon} text-sm`}></i> {title}
            </h3>
            <div className="relative z-10">{children}</div>
        </div>
    );
};


// --- Sub-components for each calculator ---
const SimpleCalculator = () => {
    const [display, setDisplay] = useState('0');
    const handleButtonClick = (value: string) => {
        if (value === 'C') setDisplay('0');
        else if (value === '<') setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
        else if (value === '=') {
            try {
                const sanitized = display.replace(/[^-()\d/*+.%]/g, '');
                const finalExpression = sanitized.replace(/(\d+)%/g, '($1/100)');
                // eslint-disable-next-line no-eval
                const result = eval(finalExpression);
                setDisplay(String(Number(result.toFixed(8))));
            } catch { setDisplay('Error'); }
        } else if (value === '00') {
             if (display !== '0') setDisplay(d => d + value);
        }
        else setDisplay(d => (d === '0' && value !== '.') ? value : d + value);
    };

    const buttons = [
        { val: 'C', type: 'util' }, { val: '<', type: 'util' }, { val: '%', type: 'op' }, { val: '/', type: 'op' },
        { val: '7', type: 'num' }, { val: '8', type: 'num' }, { val: '9', type: 'num' }, { val: '*', type: 'op' },
        { val: '4', type: 'num' }, { val: '5', type: 'num' }, { val: '6', type: 'num' }, { val: '-', type: 'op' },
        { val: '1', type: 'num' }, { val: '2', type: 'num' }, { val: '3', type: 'num' }, { val: '+', type: 'op' },
        { val: '00', type: 'num' }, { val: '0', type: 'num' }, { val: '.', type: 'num' }, { val: '=', type: 'eq' }
    ];

    return (
        <div className="p-4 sm:p-8 flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem]">
            {/* Glass Display */}
            <div className="relative mb-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/10 flex flex-col justify-end items-end overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
                <div className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 group-hover:text-indigo-500 transition-colors">Digital Result</div>
                <input 
                    type="text" 
                    value={display} 
                    readOnly 
                    className="w-full bg-transparent text-right text-6xl font-black text-slate-800 dark:text-white border-none focus:ring-0 p-0 tracking-tighter" 
                />
            </div>

            <div className="grid grid-cols-4 gap-4 flex-grow max-w-lg mx-auto w-full">
                {buttons.map(btn => {
                    let style = 'bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-200 hover:scale-105 shadow-sm active:shadow-inner';
                    if (btn.type === 'op') style = 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black shadow-indigo-100 dark:shadow-none hover:bg-indigo-600 hover:text-white';
                    if (btn.type === 'eq') style = 'bg-slate-800 dark:bg-white text-white dark:text-black font-black shadow-lg hover:scale-[1.02] shadow-slate-300 dark:shadow-none';
                    if (btn.type === 'util') style = 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-black shadow-rose-100 dark:shadow-none hover:bg-rose-600 hover:text-white';

                    return (
                        <button 
                            key={btn.val} 
                            onClick={() => handleButtonClick(btn.val)} 
                            className={`p-4 sm:p-6 text-2xl font-bold rounded-[1.5rem] transition-all duration-200 active:scale-90 flex items-center justify-center ${style}`}
                        >
                            {btn.val === '<' ? <i className="fas fa-backspace"></i> : btn.val}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const DateCalculator: React.FC = () => {
    const { t } = useLanguage();
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [result, setResult] = useState<string | null>(null);

    const calculateDifference = useCallback(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
        
        const diffTime = end.getTime() - start.getTime();
        if (diffTime < 0) {
            setResult(null);
            return;
        }

        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years} ${t(years > 1 ? 'years' : 'year')}`);
        if (months > 0) parts.push(`${months} ${t(months > 1 ? 'months' : 'month')}`);
        if (days > 0) parts.push(`${days} ${t(days > 1 ? 'days' : 'day')}`);

        const friendlyDiff = parts.length > 0 ? parts.join(', ') : t('sameDay');
        setResult(`${friendlyDiff} (${t('totalDays', totalDays)})`);
    }, [startDate, endDate, t]);

    useEffect(() => {
        calculateDifference();
    }, [calculateDifference]);
    
    return (
        <div className="p-4 sm:p-10 max-w-2xl mx-auto space-y-8">
            <InputField label={t('startDate')} icon="fas fa-calendar-day" type="date" value={startDate} onChange={setStartDate} />
            <div className="flex justify-center -my-4 relative z-10">
                <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center text-slate-400 border-4 border-gray-50 dark:border-gray-900 shadow-lg">
                    <i className="fas fa-arrow-down"></i>
                </div>
            </div>
            <InputField label={t('endDate')} icon="fas fa-calendar-day" type="date" value={endDate} onChange={setEndDate} />
            {result && (
                <ResultDisplay title={t('dateDifference')} icon="fas fa-stopwatch" variant="info">
                    <div className="text-4xl font-black text-center tracking-tighter leading-tight">{result}</div>
                </ResultDisplay>
            )}
        </div>
    );
};

const LoanCalculator = () => {
    const { t, currencySettings } = useLanguage();
    const [amount, setAmount] = useState('10000');
    const [rate, setRate] = useState('5');
    const [term, setTerm] = useState('5');
    const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);
    
    const calculate = () => {
        const p = parseFloat(amount), r = parseFloat(rate) / 100 / 12, n = parseFloat(term) * 12;
        if (p > 0 && r > 0 && n > 0) {
            const m = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const total = m * n;
            setResult({ monthly: m, total, interest: total - p });
        }
    };
    
    return (
        <div className="p-4 sm:p-10 max-w-2xl mx-auto space-y-8">
            <InputField label={t('loanAmount')} icon="fas fa-hand-holding-usd" type="number" value={amount} onChange={setAmount} unit={currencySettings.symbol}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <InputField label={t('annualInterestRate')} icon="fas fa-percentage" type="number" value={rate} onChange={setRate} unit="%"/>
                <InputField label={t('loanTermYears')} icon="fas fa-calendar-alt" type="number" value={term} onChange={setTerm} unit={t('years')}/>
            </div>
            <button onClick={calculate} className="w-full bg-slate-800 dark:bg-white text-white dark:text-black font-black py-5 px-4 rounded-[1.5rem] hover:scale-[1.02] shadow-2xl transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95">
                <i className="fas fa-calculator"></i> {t('calculate')}
            </button>
            {result && (
                <ResultDisplay title={t('loanDetails')} icon="fas fa-file-invoice-dollar" variant="success">
                    <div className="space-y-6">
                        <div className="text-center pb-4 border-b border-white/20">
                            <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('monthlyPayment')}</span>
                            <span className="text-5xl font-black">{formatCurrency(result.monthly, currencySettings)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-2xl">
                                <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('totalPayment')}</span>
                                <span className="text-xl font-bold">{formatCurrency(result.total, currencySettings)}</span>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl">
                                <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('totalInterest')}</span>
                                <span className="text-xl font-bold">{formatCurrency(result.interest, currencySettings)}</span>
                            </div>
                        </div>
                    </div>
                </ResultDisplay>
            )}
        </div>
    );
};

const FuelCalculator = () => {
    const { t, currencySettings } = useLanguage();
    const [dist, setDist] = useState('100');
    const [eff, setEff] = useState('8');
    const [price, setPrice] = useState('1.5');
    const [result, setResult] = useState<{ cost: number; fuel: number } | null>(null);
    
    const calculate = () => {
        const d = parseFloat(dist), e = parseFloat(eff), p = parseFloat(price);
        if (d > 0 && e > 0 && p > 0) {
            const fuelNeeded = (d / 100) * e;
            setResult({ fuel: fuelNeeded, cost: fuelNeeded * p });
        }
    };
    
    return (
        <div className="p-4 sm:p-10 max-w-2xl mx-auto space-y-8">
            <InputField label={t('tripDistance')} icon="fas fa-road" type="number" value={dist} onChange={setDist} unit="km" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <InputField label={t('fuelEfficiency')} icon="fas fa-tachometer-alt" type="number" value={eff} onChange={setEff} unit="L/100km"/>
                <InputField label={t('fuelPrice')} icon="fas fa-gas-pump" type="number" value={price} onChange={setPrice} unit={`${currencySettings.symbol}/L`}/>
            </div>
            <button onClick={calculate} className="w-full bg-slate-800 dark:bg-white text-white dark:text-black font-black py-5 px-4 rounded-[1.5rem] hover:scale-[1.02] shadow-2xl transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95">
                <i className="fas fa-gas-pump"></i> {t('calculate')}
            </button>
            {result && (
                <ResultDisplay title={t('tripCost')} icon="fas fa-burn" variant="warning">
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                            <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('totalFuelNeeded')}</span>
                            <span className="text-4xl font-black">{result.fuel.toFixed(2)} Liters</span>
                        </div>
                        <div className="w-full h-px bg-white/20"></div>
                        <div className="text-center">
                            <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('totalCost')}</span>
                            <span className="text-5xl font-black">{formatCurrency(result.cost, currencySettings)}</span>
                        </div>
                    </div>
                </ResultDisplay>
            )}
        </div>
    );
};

const DiscountCalculator = () => {
    const { t, currencySettings } = useLanguage();
    const [price, setPrice] = useState('100');
    const [discount, setDiscount] = useState('20');
    const [result, setResult] = useState<{ final: number; saved: number } | null>(null);
    
    const calculate = () => {
        const p = parseFloat(price), d = parseFloat(discount);
        if (p > 0 && d >= 0) {
            const saved = p * (d / 100);
            setResult({ saved, final: p - saved });
        }
    };
    
    return (
        <div className="p-4 sm:p-10 max-w-2xl mx-auto space-y-8">
            <InputField label={t('originalPrice')} icon="fas fa-tag" type="number" value={price} onChange={setPrice} unit={currencySettings.symbol}/>
            <InputField label={t('discountPercentage')} icon="fas fa-percentage" type="number" value={discount} onChange={setDiscount} unit="%"/>
            <button onClick={calculate} className="w-full bg-slate-800 dark:bg-white text-white dark:text-black font-black py-5 px-4 rounded-[1.5rem] hover:scale-[1.02] shadow-2xl transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95">
                <i className="fas fa-tags"></i> {t('calculate')}
            </button>
            {result && (
                <ResultDisplay title={t('finalPrice')} icon="fas fa-receipt" variant="success">
                    <div className="text-center space-y-2">
                        <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">{t('finalPrice')}</span>
                        <div className="text-6xl font-black tracking-tighter">{formatCurrency(result.final, currencySettings)}</div>
                        <div className="inline-block mt-4 px-4 py-1.5 rounded-full bg-white/20 text-sm font-black uppercase tracking-widest">
                            {t('youSave')}: {formatCurrency(result.saved, currencySettings)}
                        </div>
                    </div>
                </ResultDisplay>
            )}
        </div>
    );
};

const SalesTaxCalculator = () => {
    const { t, currencySettings } = useLanguage();
    const [price, setPrice] = useState('100');
    const [tax, setTax] = useState('15');
    const [result, setResult] = useState<{ final: number; taxAmount: number } | null>(null);
    
    const calculate = () => {
        const p = parseFloat(price), tx = parseFloat(tax);
        if (p > 0 && tx >= 0) {
            const taxAmount = p * (tx / 100);
            setResult({ taxAmount, final: p + taxAmount });
        }
    };
    
    return (
        <div className="p-4 sm:p-10 max-w-2xl mx-auto space-y-8">
            <InputField label={t('priceBeforeTax')} icon="fas fa-money-bill-wave" type="number" value={price} onChange={setPrice} unit={currencySettings.symbol}/>
            <InputField label={t('salesTaxRate')} icon="fas fa-percentage" type="number" value={tax} onChange={setTax} unit="%"/>
            <button onClick={calculate} className="w-full bg-slate-800 dark:bg-white text-white dark:text-black font-black py-5 px-4 rounded-[1.5rem] hover:scale-[1.02] shadow-2xl transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95">
                <i className="fas fa-receipt"></i> {t('calculate')}
            </button>
            {result && (
                <ResultDisplay title={t('priceAfterTax')} icon="fas fa-file-alt" variant="info">
                    <div className="text-center space-y-4">
                        <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('taxAmount')}</span>
                            <span className="text-2xl font-bold">{formatCurrency(result.taxAmount, currencySettings)}</span>
                        </div>
                        <div className="w-full h-px bg-white/20"></div>
                        <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t('priceAfterTax')}</span>
                            <span className="text-6xl font-black tracking-tighter">{formatCurrency(result.final, currencySettings)}</span>
                        </div>
                    </div>
                </ResultDisplay>
            )}
        </div>
    );
};

const HealthCalculator = () => {
    const { t } = useLanguage();
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');
    const [result, setResult] = useState<{ bmi: number, category: string, colorClass: string } | null>(null);
    
    const calculate = () => {
        const w = parseFloat(weight), h = parseFloat(height) / 100;
        if (w > 0 && h > 0) {
            const bmi = w / (h * h);
            let category, colorClass;
            if(bmi < 18.5) { category = t('bmiUnderweight'); colorClass = 'text-blue-500'; }
            else if (bmi < 24.9) { category = t('bmiNormal'); colorClass = 'text-emerald-500'; }
            else if (bmi < 29.9) { category = t('bmiOverweight'); colorClass = 'text-orange-500'; }
            else { category = t('bmiObese'); colorClass = 'text-rose-500'; }
            setResult({ bmi, category, colorClass });
        }
    };
    
    return (
        <div className="p-4 sm:p-10 max-w-2xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <InputField label={t('weightKg')} icon="fas fa-weight" type="number" value={weight} onChange={setWeight} unit="kg"/>
                <InputField label={t('heightCm')} icon="fas fa-ruler-vertical" type="number" value={height} onChange={setHeight} unit="cm"/>
            </div>
            <button onClick={calculate} className="w-full bg-slate-800 dark:bg-white text-white dark:text-black font-black py-5 px-4 rounded-[1.5rem] hover:scale-[1.02] shadow-2xl transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95">
                <i className="fas fa-heartbeat"></i> {t('calculate')}
            </button>
            {result && (
                <ResultDisplay title="Body Mass Index (BMI)" icon="fas fa-heartbeat" variant="info">
                    <div className="text-center space-y-2">
                        <span className="text-7xl font-black tracking-tighter block">{result.bmi.toFixed(1)}</span>
                        <span className={`text-2xl font-black uppercase tracking-widest ${result.colorClass}`}>{result.category}</span>
                        <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 via-emerald-400 to-rose-400" style={{ width: `${Math.min(100, (result.bmi / 40) * 100)}%` }}></div>
                        </div>
                    </div>
                </ResultDisplay>
            )}
        </div>
    );
};

// --- Main View Component ---
type CalculatorType = 'simple' | 'date' | 'loan' | 'fuel' | 'discount' | 'tax' | 'health';

const CalculatorSelectionCard: React.FC<{ icon: string; label: string; onClick: () => void; color: string }> = ({ icon, label, onClick, color }) => (
    <button
        onClick={onClick}
        className={`group flex flex-col items-start p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left relative overflow-hidden border border-gray-100 dark:border-gray-700`}
    >
        <div className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500`}></div>
        <div className={`text-2xl sm:text-4xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${color} text-white mb-4 sm:mb-6 shadow-xl group-hover:rotate-12 transition-transform`}>
            <i className={icon}></i>
        </div>
        <div>
            <h3 className="text-sm sm:text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight leading-tight uppercase">{label}</h3>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 group-hover:text-slate-500 transition-colors">Start Tool <i className="fas fa-arrow-right ml-1"></i></p>
        </div>
    </button>
);

const Calculator: React.FC = () => {
    const { t } = useLanguage();
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);

    const calculators = [
        { id: 'simple', icon: 'fas fa-calculator', label: t('calculatorSimple'), color: 'from-blue-500 to-indigo-600' },
        { id: 'loan', icon: 'fas fa-hand-holding-usd', label: t('calculatorLoan'), color: 'from-emerald-500 to-teal-600' },
        { id: 'discount', icon: 'fas fa-tags', label: t('calculatorDiscount'), color: 'from-orange-500 to-amber-600' },
        { id: 'tax', icon: 'fas fa-file-invoice-dollar', label: t('calculatorTax'), color: 'from-slate-600 to-slate-800' },
        { id: 'fuel', icon: 'fas fa-gas-pump', label: t('calculatorFuel'), color: 'from-purple-500 to-indigo-600' },
        { id: 'health', icon: 'fas fa-heartbeat', label: t('calculatorHealth'), color: 'from-rose-500 to-pink-600' },
        { id: 'date', icon: 'fas fa-calendar-alt', label: t('calculatorDate'), color: 'from-cyan-500 to-blue-600' },
    ];

    const renderActiveCalculator = () => {
        switch (activeCalculator) {
            case 'simple': return <SimpleCalculator />;
            case 'date': return <DateCalculator />;
            case 'loan': return <LoanCalculator />;
            case 'fuel': return <FuelCalculator />;
            case 'discount': return <DiscountCalculator />;
            case 'tax': return <SalesTaxCalculator />;
            case 'health': return <HealthCalculator />;
            default: return null;
        }
    };
    
    if (!activeCalculator) {
        return (
            <div className="p-4 sm:p-10 h-full bg-gray-50 dark:bg-gray-900 min-h-full">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-800 dark:bg-white text-white dark:text-black shadow-2xl mb-4">
                            <i className="fas fa-shapes fa-2x"></i>
                        </div>
                        <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight uppercase">
                            {t('calculator')}
                        </h2>
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            {t('calculatorDescription')}
                        </p>
                    </div>

                    {/* Pattern tools in two columns as requested */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-8">
                        {calculators.map(calc => (
                            <CalculatorSelectionCard
                                key={calc.id}
                                icon={calc.icon}
                                label={calc.label}
                                color={calc.color}
                                onClick={() => setActiveCalculator(calc.id as CalculatorType)}
                            />
                        ))}
                    </div>
                    
                    <div className="pt-12 text-center">
                         <div className="h-1 w-12 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6"></div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Designed for Wallet Premium</p>
                    </div>
                </div>
            </div>
        );
    }

    const activeCalcDetails = calculators.find(c => c.id === activeCalculator);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 h-full flex flex-col transition-colors duration-300">
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center p-6 gap-6 shadow-sm relative z-20">
                <button
                    onClick={() => setActiveCalculator(null)}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all active:scale-90"
                    aria-label={t('cancel')}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                {activeCalcDetails && (
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCalcDetails.color} text-white flex items-center justify-center text-lg shadow-lg`}>
                            <i className={activeCalcDetails.icon}></i>
                        </div>
                        <div>
                             <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 leading-tight uppercase tracking-tight">
                                {activeCalcDetails.label}
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('calculator')}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="h-full animate-fadeIn">
                    {renderActiveCalculator()}
                </div>
            </div>
        </div>
    );
};

export default Calculator;