import React, { useState, useMemo, useCallback } from 'react';
import { ScheduledTransaction, TransactionType, Frequency, Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';
import ViewContainer from '../components/ViewContainer';

interface ScheduledViewProps {
    scheduled: ScheduledTransaction[];
    addScheduled: (item: Omit<ScheduledTransaction, 'id'>) => void;
    updateScheduled: (item: ScheduledTransaction) => void;
    deleteScheduled: (id: number) => void;
    logTransaction: (type: TransactionType, item: Omit<Transaction, 'id'>) => void;
    incomeCategories: string[];
    expenseCategories: string[];
}

const getNextDueDate = (lastDueDate: string, frequency: Frequency): string => {
    const nextDate = new Date(lastDueDate);
    switch (frequency) {
        case Frequency.Weekly:
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case Frequency.Monthly:
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case Frequency.Yearly:
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate.toISOString().split('T')[0];
};

const ScheduledForm: React.FC<{
    onSave: (item: Omit<ScheduledTransaction, 'id'>) => void;
    onCancel: () => void;
    incomeCategories: string[];
    expenseCategories: string[];
}> = ({ onSave, onCancel, incomeCategories, expenseCategories }) => {
    const { t } = useLanguage();
    const [type, setType] = useState<TransactionType.Income | TransactionType.Expense>(TransactionType.Expense);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [frequency, setFrequency] = useState<Frequency>(Frequency.Monthly);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            amount: parseFloat(amount),
            category,
            type,
            frequency,
            startDate,
            endDate: endDate || undefined,
            nextDueDate: startDate,
            notes: notes || undefined,
        });
    };

    const categories = type === TransactionType.Income ? incomeCategories : expenseCategories;
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 shadow-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-400 mb-4 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i> {t('addScheduled')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <div className="flex gap-4 p-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <button type="button" onClick={() => { setType(TransactionType.Expense); setCategory(''); }} className={`flex-1 py-1 rounded-full text-sm font-semibold ${type === TransactionType.Expense ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 shadow' : ''}`}>{t('expense')}</button>
                        <button type="button" onClick={() => { setType(TransactionType.Income); setCategory(''); }} className={`flex-1 py-1 rounded-full text-sm font-semibold ${type === TransactionType.Income ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 shadow' : ''}`}>{t('income')}</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('expenseName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('expenseNamePlaceholder')} className={inputClasses} required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputClasses} required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category')}</label>
                        <input list="scheduled-category-options" value={category} onChange={e => setCategory(e.target.value)} className={inputClasses} placeholder={t('categoryPlaceholder')} required />
                        <datalist id="scheduled-category-options">{categories.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('frequency')}</label>
                        <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className={inputClasses}>
                            <option value={Frequency.Weekly}>{t('weekly')}</option>
                            <option value={Frequency.Monthly}>{t('monthly')}</option>
                            <option value={Frequency.Yearly}>{t('yearly')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDateOptional')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} />
                    </div>
                     <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notesOptional')}</label>
                         <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t('notesPlaceholder')} className={inputClasses}></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500">{t('cancel')}</button>
                    <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700">{t('save')}</button>
                </div>
            </form>
        </div>
    );
};


const ScheduledItemCard: React.FC<{
    item: ScheduledTransaction;
    onLog: () => void;
    onDelete: () => void;
}> = ({ item, onLog, onDelete }) => {
    const { t, currencySettings } = useLanguage();
    const isIncome = item.type === TransactionType.Income;
    const isDue = new Date(item.nextDueDate) <= new Date();

    const frequencyMap = {
        [Frequency.Weekly]: t('weekly'),
        [Frequency.Monthly]: t('monthly'),
        [Frequency.Yearly]: t('yearly'),
    };
    
    return (
        <div className={`p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 ${isDue ? 'bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400' : 'bg-white dark:bg-gray-800'}`}>
            <div className={`text-2xl p-3 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-red-100 dark:bg-red-900/50 text-red-600'}`}>
                <i className={`fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} • {frequencyMap[item.frequency]}</p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">{t('nextDueDate')}: {item.nextDueDate}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <span className={`font-bold text-lg ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(item.amount, currencySettings)}</span>
                <button onClick={onLog} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors text-sm flex-grow sm:flex-grow-0">
                    {t('logNow')}
                </button>
                <button onClick={onDelete} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 px-2">
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

// ... more components for the view

const ScheduledView: React.FC<ScheduledViewProps> = ({ scheduled, addScheduled, updateScheduled, deleteScheduled, logTransaction, incomeCategories, expenseCategories }) => {
    const { t, currencySettings } = useLanguage();
    const [showForm, setShowForm] = useState(false);

    const sortedScheduled = useMemo(() => {
        return [...scheduled].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    }, [scheduled]);

    const handleLogTransaction = (item: ScheduledTransaction) => {
        logTransaction(item.type, {
            name: item.name,
            amount: item.amount,
            date: item.nextDueDate,
            category: item.category,
        });

        const nextDueDate = getNextDueDate(item.nextDueDate, item.frequency);

        if(item.endDate && new Date(nextDueDate) > new Date(item.endDate)) {
            deleteScheduled(item.id);
        } else {
            updateScheduled({ ...item, nextDueDate });
        }
    };
    
    const { upcomingIncome, upcomingExpenses } = useMemo(() => {
        const now = new Date();
        const next30Days = new Date();
        next30Days.setDate(now.getDate() + 30);

        return scheduled.reduce((acc, item) => {
            const dueDate = new Date(item.nextDueDate);
            if(dueDate >= now && dueDate <= next30Days) {
                if(item.type === TransactionType.Income) {
                    acc.upcomingIncome += item.amount;
                } else {
                    acc.upcomingExpenses += item.amount;
                }
            }
            return acc;
        }, { upcomingIncome: 0, upcomingExpenses: 0 });

    }, [scheduled]);

    const handleAddScheduled = (item: Omit<ScheduledTransaction, 'id'>) => {
        addScheduled(item);
        setShowForm(false);
    };

    return (
        <ViewContainer
            title={t('scheduledTransactions')}
            icon="fas fa-calendar-alt"
            actionButton={
                <button onClick={() => setShowForm(!showForm)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors">
                    <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i> {t('addScheduled')}
                </button>
            }
        >
            <p className="text-center text-gray-600 dark:text-gray-400 -mt-4 mb-6">{t('scheduledDescription')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">{t('upcomingIncome')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('next30Days')}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(upcomingIncome, currencySettings)}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">{t('upcomingExpenses')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('next30Days')}</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(upcomingExpenses, currencySettings)}</p>
                </div>
            </div>

            {showForm && (
                <ScheduledForm 
                    onSave={handleAddScheduled}
                    onCancel={() => setShowForm(false)}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                />
            )}

            <div className="space-y-4">
                {sortedScheduled.length > 0 ? (
                    sortedScheduled.map(item => (
                        <ScheduledItemCard
                            key={item.id}
                            item={item}
                            onLog={() => handleLogTransaction(item)}
                            onDelete={() => deleteScheduled(item.id)}
                        />
                    ))
                ) : (
                     <div className="text-center py-10">
                        <i className="fas fa-calendar-check text-5xl text-gray-300 dark:text-gray-600"></i>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noScheduled')}</p>
                    </div>
                )}
            </div>
        </ViewContainer>
    );
};

export default ScheduledView;