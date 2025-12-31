import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';

// --- UI Components ---
const InputField: React.FC<{ label: string; icon: string; type: string; value: string; onChange: (val: string) => void; placeholder?: string; step?: string; min?: string; unit?: string }> = ({ label, icon, type, value, onChange, unit, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i className={`${icon} text-gray-400`}></i>
            </div>
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="block w-full rounded-lg border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/60 dark:text-white py-3 pl-10 pr-4 text-base focus:border-slate-500 focus:ring-slate-500 transition" 
                {...props} 
            />
            {unit && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 dark:text-gray-400 text-sm">{unit}</span></div>}
        </div>
    </div>
);

const ResultDisplay: React.FC<{ title: string; children: React.ReactNode; icon: string; }> = ({ title, children, icon }) => (
    <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-inner">
        <h3 className="text-md font-semibold text-gray-600 dark:text-gray-400 text-center mb-3 flex items-center justify-center gap-2">
            <i className={`${icon} text-slate-600 dark:text-slate-400`}></i> {title}
        </h3>
        <div className="text-center font-bold text-slate-700 dark:text-slate-300">{children}</div>
    </div>
);


// --- Sub-components for each calculator ---
const SimpleCalculator = () => {
    const [display, setDisplay] = useState('0');
    const handleButtonClick = (value: string) => {
        if (value === 'C') setDisplay('0');
        else if (value === '<') setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
        else if (value === '=') {
            try {
                // Sanitize to prevent security issues with eval
                const sanitized = display.replace(/[^-()\d/*+.%]/g, '');
                // Handle percentage
                const finalExpression = sanitized.replace(/(\d+)%/g, '($1/100)');
                // eslint-disable-next-line no-eval
                const result = eval(finalExpression);
                setDisplay(String(result));
            } catch { setDisplay('Error'); }
        } else if (value === '00') {
             if (display !== '0') setDisplay(d => d + value);
        }
        else setDisplay(d => (d === '0' && value !== '.') ? value : d + value);
    };

    const buttons = ['C', '<', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '00', '0', '.', '='];
    return (
        <div className="p-3 sm:p-4 flex flex-col h-full bg-gray-100 dark:bg-gray-800/50">
            <input type="text" value={display} readOnly className="w-full p-4 mb-4 bg-gray-200 dark:bg-gray-900 text-right text-5xl font-light rounded-2xl border-none focus:ring-0" />
            <div className="grid grid-cols-4 gap-3 flex-grow">
                {buttons.map(btn => {
                    const isOp = ['/', '*', '-', '+', '%'].includes(btn);
                    const isEq = btn === '=';
                    const isC = ['C', '<'].includes(btn);
                    
                    let style = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600';
                    if (isOp) style = 'bg-orange-500 text-white hover:bg-orange-600';
                    if (isEq) style = 'bg-slate-600 text-white hover:bg-slate-700';
                    if (isC) style = 'bg-gray-400 dark:bg-gray-500 text-white hover:bg-gray-500 dark:hover:bg-gray-400';

                    return <button key={btn} onClick={() => handleButtonClick(btn)} className={`p-2 text-2xl font-semibold rounded-2xl transition-all duration-150 active:transform active:scale-95 h-full ${style}`}>
                        {btn === '<' ? <i className="fas fa-backspace"></i> : btn}
                    </button>;
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
            setResult(null); // Or show an error for start date after end date
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
        <div className="p-4 sm:p-6 space-y-5">
            <InputField label={t('startDate')} icon="fas fa-calendar-day" type="date" value={startDate} onChange={setStartDate} />
            <InputField label={t('endDate')} icon="fas fa-calendar-day" type="date" value={endDate} onChange={setEndDate} />
            {result && (
                <ResultDisplay title={t('dateDifference')} icon="fas fa-stopwatch">
                    <div className="text-3xl">{result}</div>
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
        <div className="p-4 sm:p-6 space-y-5">
            <InputField label={t('loanAmount')} icon="fas fa-hand-holding-usd" type="number" value={amount} onChange={setAmount} unit={currencySettings.symbol}/>
            <InputField label={t('annualInterestRate')} icon="fas fa-percentage" type="number" value={rate} onChange={setRate} unit="%"/>
            <InputField label={t('loanTermYears')} icon="fas fa-calendar-alt" type="number" value={term} onChange={setTerm} unit={t('years')}/>
            <button onClick={calculate} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors text-lg flex items-center justify-center gap-2">
                <i className="fas fa-calculator"></i> {t('calculate')}
            </button>
            {result && <ResultDisplay title={t('loanDetails')} icon="fas fa-file-invoice-dollar">
                <div className="text-lg space-y-2">
                    <div className="flex justify-between"><span>{t('monthlyPayment')}:</span> <strong>{formatCurrency(result.monthly, currencySettings)}</strong></div>
                    <div className="flex justify-between"><span>{t('totalPayment')}:</span> <strong>{formatCurrency(result.total, currencySettings)}</strong></div>
                    <div className="flex justify-between"><span>{t('totalInterest')}:</span> <strong>{formatCurrency(result.interest, currencySettings)}</strong></div>
                </div>
            </ResultDisplay>}
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
        <div className="p-4 sm:p-6 space-y-5">
            <InputField label={t('tripDistance')} icon="fas fa-road" type="number" value={dist} onChange={setDist} unit="km" />
            <InputField label={t('fuelEfficiency')} icon="fas fa-tachometer-alt" type="number" value={eff} onChange={setEff} unit="L/100km"/>
            <InputField label={t('fuelPrice')} icon="fas fa-gas-pump" type="number" value={price} onChange={setPrice} unit={`${currencySettings.symbol} / ${t('liter')}`}/>
            <button onClick={calculate} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors text-lg flex items-center justify-center gap-2"><i className="fas fa-calculator"></i> {t('calculate')}</button>
            {result && <ResultDisplay title={t('tripCost')} icon="fas fa-burn">
                <div className="text-xl">{t('totalFuelNeeded')}: <span className="font-extrabold">{result.fuel.toFixed(2)}L</span></div>
                <div className="text-3xl mt-1">{t('totalCost')}: <span className="font-extrabold">{formatCurrency(result.cost, currencySettings)}</span></div>
            </ResultDisplay>}
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
        <div className="p-4 sm:p-6 space-y-5">
            <InputField label={t('originalPrice')} icon="fas fa-tag" type="number" value={price} onChange={setPrice} unit={currencySettings.symbol}/>
            <InputField label={t('discountPercentage')} icon="fas fa-percentage" type="number" value={discount} onChange={setDiscount} unit="%"/>
            <button onClick={calculate} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors text-lg flex items-center justify-center gap-2"><i className="fas fa-calculator"></i> {t('calculate')}</button>
            {result && <ResultDisplay title={t('finalPrice')} icon="fas fa-receipt">
                 <div className="text-4xl">{formatCurrency(result.final, currencySettings)}</div>
                 <div className="text-lg mt-1 text-red-600 dark:text-red-400">({t('youSave')}: {formatCurrency(result.saved, currencySettings)})</div>
            </ResultDisplay>}
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
        <div className="p-4 sm:p-6 space-y-5">
            <InputField label={t('priceBeforeTax')} icon="fas fa-money-bill-wave" type="number" value={price} onChange={setPrice} unit={currencySettings.symbol}/>
            <InputField label={t('salesTaxRate')} icon="fas fa-percentage" type="number" value={tax} onChange={setTax} unit="%"/>
            <button onClick={calculate} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors text-lg flex items-center justify-center gap-2"><i className="fas fa-calculator"></i> {t('calculate')}</button>
            {result && <ResultDisplay title={t('priceAfterTax')} icon="fas fa-file-alt">
                <div className="text-4xl">{formatCurrency(result.final, currencySettings)}</div>
                <div className="text-lg mt-1 text-gray-500 dark:text-gray-400">({t('taxAmount')}: {formatCurrency(result.taxAmount, currencySettings)})</div>
            </ResultDisplay>}
        </div>
    );
};
const HealthCalculator = () => {
    const { t } = useLanguage();
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('175');
    const [result, setResult] = useState<{ bmi: number, category: string, categoryColor: string } | null>(null);
    const calculate = () => {
        const w = parseFloat(weight), h = parseFloat(height) / 100;
        if (w > 0 && h > 0) {
            const bmi = w / (h * h);
            let category, categoryColor;
            if(bmi < 18.5) { category = t('bmiUnderweight'); categoryColor = 'text-blue-500'; }
            else if (bmi < 24.9) { category = t('bmiNormal'); categoryColor = 'text-slate-500'; }
            else if (bmi < 29.9) { category = t('bmiOverweight'); categoryColor = 'text-yellow-500'; }
            else { category = t('bmiObese'); categoryColor = 'text-red-500'; }
            setResult({ bmi, category, categoryColor });
        }
    };
    return (
        <div className="p-4 sm:p-6 space-y-5">
            <InputField label={t('weightKg')} icon="fas fa-weight" type="number" value={weight} onChange={setWeight} unit="kg"/>
            <InputField label={t('heightCm')} icon="fas fa-ruler-vertical" type="number" value={height} onChange={setHeight} unit="cm"/>
            <button onClick={calculate} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors text-lg flex items-center justify-center gap-2"><i className="fas fa-calculator"></i> {t('calculate')}</button>
            {result && <ResultDisplay title="Body Mass Index (BMI)" icon="fas fa-heartbeat">
                <div className="text-5xl font-mono">{result.bmi.toFixed(1)}</div>
                <div className={`text-xl mt-2 font-semibold ${result.categoryColor}`}>{result.category}</div>
            </ResultDisplay>}
        </div>
    );
};

// --- Main View Component ---
type CalculatorType = 'simple' | 'date' | 'loan' | 'fuel' | 'discount' | 'tax' | 'health';

const CalculatorSelectionCard: React.FC<{ icon: string; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-center border-t-4 border-gray-200 dark:border-gray-700 hover:border-slate-500"
    >
        <div className="text-4xl text-slate-600 dark:text-slate-400 mb-3 group-hover:scale-110 transition-transform">
            <i className={icon}></i>
        </div>
        <h3 className="font-bold text-gray-800 dark:text-gray-200">{label}</h3>
    </button>
);

const Calculator: React.FC = () => {
    const { t } = useLanguage();
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);

    const calculators = [
        { id: 'loan', icon: 'fas fa-hand-holding-usd', label: t('calculatorLoan') },
        { id: 'discount', icon: 'fas fa-tags', label: t('calculatorDiscount') },
        { id: 'tax', icon: 'fas fa-file-invoice-dollar', label: t('calculatorTax') },
        { id: 'fuel', icon: 'fas fa-gas-pump', label: t('calculatorFuel') },
        { id: 'health', icon: 'fas fa-heartbeat', label: t('calculatorHealth') },
        { id: 'date', icon: 'fas fa-calendar-alt', label: t('calculatorDate') },
        { id: 'simple', icon: 'fas fa-calculator', label: t('calculatorSimple') },
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
            <div className="p-4 sm:p-6 h-full bg-gray-50 dark:bg-gray-900/40 rounded-2xl">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">{t('calculator')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {calculators.map(calc => (
                        <CalculatorSelectionCard
                            key={calc.id}
                            icon={calc.icon}
                            label={calc.label}
                            onClick={() => setActiveCalculator(calc.id as CalculatorType)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const activeCalcDetails = calculators.find(c => c.id === activeCalculator);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-full flex flex-col overflow-hidden border-4 border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center p-3 gap-3">
                <button
                    onClick={() => setActiveCalculator(null)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label={t('cancel')}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                {activeCalcDetails && (
                     <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <i className={`${activeCalcDetails.icon} text-slate-600 dark:text-slate-400 w-5 text-center`}></i>
                        {activeCalcDetails.label}
                    </h2>
                )}
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/40">
                {renderActiveCalculator()}
            </div>
        </div>
    );
};

export default Calculator;