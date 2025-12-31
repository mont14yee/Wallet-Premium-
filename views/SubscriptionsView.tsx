import React, { useState, useMemo } from 'react';
import { Subscription, SubscriptionType, SubscriptionHealth, Frequency } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';
import BloomingFlowerChart from '../components/charts/BloomingFlowerChart';

interface SubscriptionsViewProps {
    subscriptions: Subscription[];
    addSubscription: (sub: Omit<Subscription, 'id'>) => void;
    updateSubscription: (sub: Subscription) => void;
    deleteSubscription: (id: number) => void;
    theme: 'light' | 'dark';
    expenseCategories: string[];
    incomeCategories: string[];
}

const SubscriptionCard: React.FC<{ sub: Subscription, onUpdate: (sub: Subscription) => void, onDelete: (id: number) => void, onEdit: (sub: Subscription) => void }> = ({ sub, onUpdate, onDelete, onEdit }) => {
    const { t, currencySettings } = useLanguage();
    const [isFlipped, setIsFlipped] = useState(false);

    const frequencyMap = {
        [Frequency.Weekly]: t('weekly'),
        [Frequency.Monthly]: t('monthly'),
        [Frequency.Yearly]: t('yearly'),
    };

    const handleHealthChange = (newHealth: SubscriptionHealth) => {
        onUpdate({ ...sub, health: newHealth });
    };

    const icon = useMemo(() => {
        const name = sub.name.toLowerCase();
        if (name.includes('netflix')) return 'fas fa-film';
        if (name.includes('spotify') || name.includes('music')) return 'fab fa-spotify';
        if (name.includes('patreon')) return 'fab fa-patreon';
        if (name.includes('cloud') || name.includes('storage') || name.includes('google') || name.includes('icloud')) return 'fas fa-cloud';
        if (name.includes('gym')) return 'fas fa-dumbbell';
        if (sub.type === SubscriptionType.Income) return 'fas fa-arrow-down';
        return 'fas fa-receipt';
    }, [sub.name, sub.type]);

    return (
        <div className="w-72 h-48 flex-shrink-0 perspective-1000">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className={`absolute w-full h-full backface-hidden p-4 rounded-xl shadow-lg flex flex-col justify-between overflow-hidden
                    ${sub.type === SubscriptionType.Income ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'}`}>
                    <div>
                        <div className="flex justify-between items-start">
                            <i className={`${icon} fa-2x opacity-80`}></i>
                            <span className="font-bold text-2xl">{sub.name}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{formatCurrency(sub.amount, currencySettings)}</p>
                        <p className="text-sm opacity-80">/ {frequencyMap[sub.frequency]}</p>
                        <p className="text-xs opacity-70 mt-1">{t('renewalDate')}: {sub.renewalDate}</p>
                    </div>
                    <button onClick={() => setIsFlipped(true)} className="absolute bottom-2 right-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1">
                        {t('flipToSeeDetails')} <i className="fas fa-redo-alt"></i>
                    </button>
                </div>
                {/* Back */}
                <div className={`absolute w-full h-full backface-hidden p-4 rounded-xl shadow-lg flex flex-col justify-between rotate-y-180 bg-white dark:bg-gray-800 border-2 ${sub.health === SubscriptionHealth.Review ? 'border-amber-400' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div>
                        <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400">{t('subscriptionHealth')}</h4>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => handleHealthChange(SubscriptionHealth.Good)} className={`text-xs px-2 py-1 rounded-full ${sub.health === SubscriptionHealth.Good ? 'bg-slate-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('goodValue')}</button>
                            <button onClick={() => handleHealthChange(SubscriptionHealth.Review)} className={`text-xs px-2 py-1 rounded-full ${sub.health === SubscriptionHealth.Review ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('reviewNeeded')}</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                         {sub.cancellationUrl && <a href={sub.cancellationUrl} target="_blank" rel="noopener noreferrer" className="text-center w-full bg-slate-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-slate-700">{t('cancelSubscription')} <i className="fas fa-external-link-alt ml-1"></i></a>}
                         <div className="flex gap-2">
                             <button onClick={() => onEdit(sub)} className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-sm font-bold py-2 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">{t('edit')}</button>
                             <button onClick={() => onDelete(sub.id)} className="flex-1 text-center bg-red-500 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-red-600">{t('delete')}</button>
                         </div>
                    </div>
                     <button onClick={() => setIsFlipped(false)} className="absolute bottom-2 right-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i className="fas fa-undo-alt"></i></button>
                </div>
            </div>
        </div>
    );
};

const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ subscriptions, addSubscription, updateSubscription, deleteSubscription, theme, expenseCategories, incomeCategories }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<'all' | 'outflows' | 'inflows'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [priceAlert, setPriceAlert] = useState<string | null>(null);

    const filteredSubscriptions = useMemo(() => {
        if (view === 'outflows') return subscriptions.filter(s => s.type === SubscriptionType.Expense);
        if (view === 'inflows') return subscriptions.filter(s => s.type === SubscriptionType.Income);
        return subscriptions;
    }, [subscriptions, view]);

    const { totalOutflow, totalInflow } = useMemo(() => {
        return subscriptions.reduce((acc, sub) => {
            let monthlyAmount = sub.amount;
            if (sub.frequency === Frequency.Yearly) monthlyAmount /= 12;
            if (sub.frequency === Frequency.Weekly) monthlyAmount *= 4; // Approximation

            if (sub.type === SubscriptionType.Expense) {
                acc.totalOutflow += monthlyAmount;
            } else {
                acc.totalInflow += monthlyAmount;
            }
            return acc;
        }, { totalOutflow: 0, totalInflow: 0 });
    }, [subscriptions]);
    
    const handleOpenForm = (sub: Subscription | null) => {
        setEditingSub(sub);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (formData: Omit<Subscription, 'id'> | Subscription) => {
        if ('id' in formData) {
            // Update
            const originalSub = subscriptions.find(s => s.id === formData.id);
            if (originalSub && originalSub.amount !== formData.amount && originalSub.type === SubscriptionType.Expense) {
                const diff = ((formData.amount - originalSub.amount) / originalSub.amount) * 100;
                if (diff > 0) {
                    setPriceAlert(t('priceHikeAlert', diff.toFixed(0)));
                } else if (diff < 0) {
                     setPriceAlert(t('priceDropAlert', Math.abs(diff).toFixed(0)));
                }
                setTimeout(() => setPriceAlert(null), 4000);
            }
            updateSubscription(formData);
        } else {
            // Add
            addSubscription(formData);
        }
        setIsFormOpen(false);
        setEditingSub(null);
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 h-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
                    <h3 className="text-sm font-semibold text-red-500 dark:text-red-400">{t('monthlyOutflow')}</h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalOutflow, { symbol: '$', decimalPlaces: 2, numberFormat: 'comma-dot', symbolPlacement: 'before' })}</p>
                 </div>
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-center">
                    <h3 className="text-sm font-semibold text-green-500 dark:text-green-400">{t('monthlyInflow')}</h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalInflow, { symbol: '$', decimalPlaces: 2, numberFormat: 'comma-dot', symbolPlacement: 'before' })}</p>
                 </div>
            </div>
            
            <div aria-live="assertive" className="sr-only">{priceAlert}</div>
            {priceAlert && <div className="p-3 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-lg text-center font-semibold animate-fadeIn">{priceAlert}</div>}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                         <button onClick={() => setView('all')} className={`px-3 py-1 text-sm rounded-full ${view === 'all' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>{t('viewAll')}</button>
                         <button onClick={() => setView('outflows')} className={`px-3 py-1 text-sm rounded-full ${view === 'outflows' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>{t('viewOutflows')}</button>
                         <button onClick={() => setView('inflows')} className={`px-3 py-1 text-sm rounded-full ${view === 'inflows' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>{t('viewInflows')}</button>
                     </div>
                     <button onClick={() => handleOpenForm(null)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 flex items-center gap-2">
                        <i className="fas fa-plus"></i> {t('addSubscription')}
                    </button>
                 </div>
                 {filteredSubscriptions.length > 0 ? (
                    <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
                        {filteredSubscriptions.map(sub => (
                             <SubscriptionCard key={sub.id} sub={sub} onUpdate={updateSubscription} onDelete={deleteSubscription} onEdit={handleOpenForm} />
                        ))}
                    </div>
                 ) : (
                     <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noSubscriptions')}</p>
                 )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{t('incomeFlower')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('incomeFlowerDescription')}</p>
                <BloomingFlowerChart data={subscriptions.filter(s => s.type === SubscriptionType.Income)} theme={theme} />
            </div>

            {isFormOpen && <SubscriptionFormModal sub={editingSub} onSave={handleFormSubmit} onClose={() => setIsFormOpen(false)} expenseCategories={expenseCategories} incomeCategories={incomeCategories} />}
        </div>
    );
};

const SubscriptionFormModal: React.FC<{ sub: Subscription | null; onSave: (data: any) => void; onClose: () => void; expenseCategories: string[]; incomeCategories: string[]; }> = ({ sub, onSave, onClose, expenseCategories, incomeCategories }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: sub?.name || '',
        amount: sub?.amount || '',
        type: sub?.type || SubscriptionType.Expense,
        frequency: sub?.frequency || Frequency.Monthly,
        renewalDate: sub?.renewalDate || new Date().toISOString().split('T')[0],
        category: sub?.category || '',
        cancellationUrl: sub?.cancellationUrl || '',
        isVariable: sub?.isVariable || false,
        health: sub?.health || SubscriptionHealth.Good
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData, amount: parseFloat(String(formData.amount)) };
        if (sub) {
            onSave({ ...sub, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
    };
    
    const categories = formData.type === SubscriptionType.Income ? incomeCategories : expenseCategories;
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="p-4 border-b dark:border-gray-700">
                    <h2 className="font-bold text-lg">{sub ? t('editSubscription') : t('newSubscription')}</h2>
                </header>
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    {/* ... form fields ... */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm">{t('providerName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('providerNamePlaceholder')} className={inputClasses} required />
                        </div>
                        <div>
                             <label className="text-sm">{t('amount')}</label>
                             <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" className={inputClasses} required />
                        </div>
                    </div>
                     <div>
                        <label className="text-sm">{t('subscriptionType')}</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                            <option value={SubscriptionType.Expense}>{t('expenseStream')}</option>
                            <option value={SubscriptionType.Income}>{t('incomeStream')}</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm">{t('frequency')}</label>
                            <select name="frequency" value={formData.frequency} onChange={handleChange} className={inputClasses}>
                                <option value={Frequency.Weekly}>{t('weekly')}</option>
                                <option value={Frequency.Monthly}>{t('monthly')}</option>
                                <option value={Frequency.Yearly}>{t('yearly')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm">{t('renewalDate')}</label>
                            <input type="date" name="renewalDate" value={formData.renewalDate} onChange={handleChange} className={inputClasses} required />
                        </div>
                    </div>
                    <div>
                         <label className="text-sm">{t('category')}</label>
                         <input list="category-options" name="category" value={formData.category} onChange={handleChange} className={inputClasses} required />
                         <datalist id="category-options">{categories.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                     <div>
                         <label className="text-sm">{t('cancellationUrlOptional')}</label>
                         <input type="text" name="cancellationUrl" value={formData.cancellationUrl} onChange={handleChange} placeholder={t('cancellationUrlPlaceholder')} className={inputClasses} />
                    </div>
                    {formData.type === SubscriptionType.Income && (
                         <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                            <input type="checkbox" name="isVariable" id="isVariable" checked={formData.isVariable} onChange={handleChange} className="h-4 w-4" />
                            <label htmlFor="isVariable" className="text-sm">{t('isIncomeVariable')}</label>
                        </div>
                    )}
                </form>
                 <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 font-bold py-2 px-4 rounded-full">{t('cancel')}</button>
                    <button type="submit" onClick={handleSubmit} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full">{t('save')}</button>
                </footer>
            </div>
        </div>
    );
};

export default SubscriptionsView;