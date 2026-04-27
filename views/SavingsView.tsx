import React, { useState, useMemo, useCallback } from 'react';
import { SavingsGoal, ExtraContribution, CompoundingFrequency } from '../types';
import { formatCurrency } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface SavingsViewProps {
    items: SavingsGoal[];
    addSavingsGoal: (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => void;
    deleteSavingsGoal: (id: number) => void;
    addExtraContribution: (goalId: number, contribution: Omit<ExtraContribution, 'id'>) => void;
    netBalance: number;
    theme: 'light' | 'dark';
}

const calculateProjection = (goal: SavingsGoal) => {
    const { startingBalance, monthlyContribution, interestRate, compoundingFrequency, deadline, extraContributions } = goal;
    const today = new Date();
    today.setHours(0,0,0,0);
    const endDate = new Date(deadline);
    
    if (endDate <= today) return { projection: [], currentValue: startingBalance, futureValue: startingBalance };

    const months = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    const n = { [CompoundingFrequency.Daily]: 365, [CompoundingFrequency.Monthly]: 12, [CompoundingFrequency.Yearly]: 1 }[compoundingFrequency];
    const r = interestRate / 100;
    
    const projectionData = [];
    let balance = startingBalance;

    const monthFormatter = new Intl.DateTimeFormat('default', { month: 'short', year: '2-digit' });
    let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

    for (let i = 0; i <= months; i++) {
        projectionData.push({ date: monthFormatter.format(currentDate), balance: balance });

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        
        // Apply interest
        if (interestRate > 0) {
            if (compoundingFrequency === CompoundingFrequency.Monthly) {
                balance *= (1 + r / n);
            } else if (compoundingFrequency === CompoundingFrequency.Daily) {
                balance *= Math.pow(1 + r / n, daysInMonth);
            } else if (compoundingFrequency === CompoundingFrequency.Yearly && currentDate.getMonth() === 11) {
                balance *= (1 + r / n);
            }
        }

        // Add monthly contribution
        balance += monthlyContribution;

        // Add any extra contributions for this month
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        extraContributions.forEach(c => {
            if (c.date.startsWith(monthKey)) {
                balance += c.amount;
            }
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { projection: projectionData, currentValue: startingBalance, futureValue: balance };
};

const GrowthChart: React.FC<{ goal: SavingsGoal; projection: any[], theme: 'light' | 'dark' }> = ({ goal, projection, theme }) => {
    const { t } = useLanguage();
    const milestones = useMemo(() => {
        return [0.25, 0.50, 0.75, 1.0].map(p => {
            const target = goal.targetAmount * p;
            const point = projection.find(d => d.balance >= target);
            if (point) return { ...point, label: `${p*100}%` };
            return null;
        }).filter(Boolean);
    }, [goal.targetAmount, projection]);

    return (
        <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <LineChart data={projection} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                    <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#a0aec0' : '#4a5568' }} fontSize={10} />
                    <YAxis tick={{ fill: theme === 'dark' ? '#a0aec0' : '#4a5568' }} fontSize={10} domain={['dataMin', goal.targetAmount * 1.1]}/>
                    <Tooltip />
                    <Line type="monotone" dataKey="balance" name={t('balance')} stroke="#22c55e" strokeWidth={2} dot={false} />
                    {milestones.map((m, i) => m && <ReferenceDot key={i} x={m.date} y={m.balance} r={5} fill="#fbbf24" stroke="white" isFront={true} />)}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


const SavingsGoalCard: React.FC<{ item: SavingsGoal; onDelete: (id: number) => void; onAddExtra: (goalId: number, contribution: Omit<ExtraContribution, 'id'>) => void; theme: 'light' | 'dark' }> = ({ item, onDelete, onAddExtra, theme }) => {
    const { t, currencySettings } = useLanguage();
    const [boosterAmount, setBoosterAmount] = useState('');
    const { projection, futureValue } = useMemo(() => calculateProjection(item), [item]);
    
    const currentValue = useMemo(() => {
         const { startingBalance, monthlyContribution, interestRate, compoundingFrequency, extraContributions } = item;
         const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
         const today = new Date();
         const months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
         const n = { [CompoundingFrequency.Daily]: 365, [CompoundingFrequency.Monthly]: 12, [CompoundingFrequency.Yearly]: 1 }[compoundingFrequency];
         const r = interestRate / 100;
         let balance = startingBalance;
         
         let currentDate = new Date(startDate);
         for(let i=0; i<months; i++){
            balance *= (1 + r/n);
            balance += monthlyContribution;
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            extraContributions.forEach(c => {
                if (c.date.startsWith(monthKey)) {
                    balance += c.amount;
                }
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
         }
         return balance;
    }, [item]);


    const progress = item.targetAmount > 0 ? Math.min(100, (currentValue / item.targetAmount) * 100) : 0;

    const handleAddBooster = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(boosterAmount);
        if (amount > 0) {
            onAddExtra(item.id, { amount, date: new Date().toISOString().split('T')[0] });
            setBoosterAmount('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('deadline')}: {item.deadline}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.interestRate}% APY, {t(item.compoundingFrequency)}</p>
                </div>
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                    <i className="fas fa-trash"></i>
                </button>
            </div>

            <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('progress')}</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm mt-1 text-gray-600 dark:text-gray-400">
                    <span>{formatCurrency(currentValue, currencySettings)}</span>
                    <span>{formatCurrency(item.targetAmount, currencySettings)}</span>
                </div>
            </div>

            <div className="mt-4">
                 <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">{t('projectedGrowth')}</h4>
                 <GrowthChart goal={item} projection={projection} theme={theme} />
                 <p className="text-center text-xs text-gray-500 dark:text-gray-400">{t('futureValue')}: <span className="font-bold">{formatCurrency(futureValue, currencySettings)}</span></p>
            </div>
            
             <form onSubmit={handleAddBooster} className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center gap-2">
                <i className="fas fa-rocket text-yellow-500"></i>
                <input type="number" value={boosterAmount} onChange={e => setBoosterAmount(e.target.value)} placeholder={t('addBooster')} className="flex-grow bg-transparent text-sm focus:outline-none" />
                <button type="submit" className="text-sm font-bold text-green-600 dark:text-green-400 hover:underline">{t('add')}</button>
            </form>
        </div>
    );
};

const SavingsView: React.FC<SavingsViewProps> = ({ items, addSavingsGoal, deleteSavingsGoal, addExtraContribution, netBalance, theme }) => {
    const { t, currencySettings } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
    const [startingBalance, setStartingBalance] = useState('0');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [interestRate, setInterestRate] = useState('4.5');
    const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>(CompoundingFrequency.Monthly);

    const resetForm = () => {
        setName(''); setTargetAmount(''); setStartingBalance('0'); setMonthlyContribution('');
        setDeadline(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
        setInterestRate('4.5'); setCompoundingFrequency(CompoundingFrequency.Monthly);
        setShowForm(false);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSavingsGoal({
            name,
            targetAmount: parseFloat(targetAmount),
            deadline,
            startingBalance: parseFloat(startingBalance),
            monthlyContribution: parseFloat(monthlyContribution),
            interestRate: parseFloat(interestRate),
            compoundingFrequency,
        });
        resetForm();
    };
    
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-400 flex items-center gap-3">
                    <i className="fas fa-piggy-bank"></i>
                    {t('savings')}
                </h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors">
                    <i className="fas fa-plus"></i> {t('newSavingsGoal')}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-400 mb-4">{t('newSavingsGoal')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('goalNamePlaceholder')} className={inputClasses} required />
                            <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder={`${t('targetAmount')} (${currencySettings.symbol})`} className={inputClasses} required />
                            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputClasses} required />
                            <input type="number" value={startingBalance} onChange={e => setStartingBalance(e.target.value)} placeholder={`${t('startingBalance')} (${currencySettings.symbol})`} className={inputClasses} required />
                            <div>
                                <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} placeholder={`${t('monthlyContribution')} (${currencySettings.symbol})`} className={inputClasses} required />
                                {netBalance > 0 && <p className="text-xs text-gray-500 mt-1">{t('suggestedContribution')}: {formatCurrency(netBalance, currencySettings)}</p>}
                            </div>
                            <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder={`${t('interestRate')}`} className={inputClasses} required />
                            <select value={compoundingFrequency} onChange={e => setCompoundingFrequency(e.target.value as CompoundingFrequency)} className={inputClasses}>
                                <option value={CompoundingFrequency.Daily}>{t('daily')}</option>
                                <option value={CompoundingFrequency.Monthly}>{t('monthly')}</option>
                                <option value={CompoundingFrequency.Yearly}>{t('yearly')}</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={resetForm} className="bg-gray-300 dark:bg-gray-600 font-bold py-2 px-4 rounded-full">{t('cancel')}</button>
                            <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full">{t('save')}</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="space-y-4">
                {items.length > 0 ? (
                    items.map(item => <SavingsGoalCard key={item.id} item={item} onDelete={deleteSavingsGoal} onAddExtra={addExtraContribution} theme={theme} />)
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noSavingsGoals')}</p>
                )}
            </div>
        </div>
    );
};

export default SavingsView;