import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import ViewContainer from './ViewContainer';
import { formatCurrency } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import MonthlyFlowChart from './charts/MonthlyFlowChart';

interface TransactionViewProps {
    title: string;
    icon: string;
    items: Transaction[];
    allItems: Transaction[];
    total: number;
    onAddItem: (item: Omit<Transaction, 'id'>) => void;
    onDeleteItem: (id: number) => void;
    categories: string[];
    itemIcon: string;
    itemColor: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    totalLabel: string;
    amountColor: string;
    categoryFilter: string | null;
    onClearFilter: () => void;
    onAddCategory?: (category: string) => void;
    theme: 'light' | 'dark';
    chartTitle: string;
    chartDataKey: string;
    chartColor: string;
}

const TransactionItem: React.FC<{ 
    item: Transaction; 
    icon: string; 
    color: string; 
    onDelete: (id: number) => void;
}> = ({ item, icon, color, onDelete }) => {
    const { currencySettings } = useLanguage();
    return (
        <div className="flex justify-between items-center p-4 rounded-2xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 ${color}`}>
                    <i className={`${icon} text-xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</h3>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{item.category} • {item.date}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 ml-2">
                <span className={`font-black text-lg ${color} whitespace-nowrap`}>{formatCurrency(item.amount, currencySettings)}</span>
                <button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                    <i className="fas fa-trash-alt text-sm"></i>
                </button>
            </div>
        </div>
    );
};


const TransactionForm: React.FC<{
    categories: string[];
    onSave: (item: Omit<Transaction, 'id'>) => void;
    onCancel: () => void;
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    initialData: { name: string; category: string } | null;
    onAddCategory?: (category: string) => void;
}> = ({ categories, onSave, onCancel, title, nameLabel, namePlaceholder, initialData, onAddCategory }) => {
    const { t, currencySettings } = useLanguage();
    const [name, setName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(initialData?.category || categories[0] || '');
    
    const inputClasses = "mt-1 block w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:text-white dark:placeholder-gray-600 focus:ring-2 focus:ring-slate-500 transition-all outline-none font-medium";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && amount && date && category) {
            if (onAddCategory && !categories.find(c => c.toLowerCase() === category.toLowerCase())) {
                onAddCategory(category);
            }
            onSave({ name, amount: parseFloat(amount), date, category });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3 uppercase tracking-wider">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <i className="fas fa-plus"></i>
                </div>
                {title}
            </h3>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{nameLabel}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder} className={inputClasses} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('amount')} ({currencySettings.symbol})</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputClasses} required />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('date')}</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('category')}</label>
                        <input 
                            list="category-options"
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            className={inputClasses} 
                            placeholder={t('categoryPlaceholder')}
                            required 
                        />
                        <datalist id="category-options">
                            {categories.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={onCancel} className="flex-1 py-3 px-6 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">{t('cancel')}</button>
                    <button type="submit" className="flex-1 py-3 px-6 rounded-2xl bg-slate-600 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-700 shadow-lg shadow-slate-200 dark:shadow-none transition-all">{t('save')}</button>
                </div>
            </form>
        </div>
    );
};


const TransactionView: React.FC<TransactionViewProps> = (props) => {
    const { title, items, total, onAddItem, onDeleteItem, categories, itemIcon, itemColor, formTitle, nameLabel, namePlaceholder, totalLabel, amountColor, categoryFilter, onClearFilter, onAddCategory, allItems, theme, chartTitle, chartDataKey, chartColor } = props;
    const { t, currencySettings, language } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [initialFormData, setInitialFormData] = useState<{ name: string; category: string } | null>(null);
    const [isChartVisible, setIsChartVisible] = useState(false);

    const otherCategoryNames = ['Other', 'ሌላ'];

    const comparisonData = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0);
        const firstDayOfPreviousMonth = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), 1);

        const currentMonthTotal = allItems
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= currentMonthStart && itemDate <= now;
            })
            .reduce((sum, item) => sum + item.amount, 0);

        const previousMonthTotal = allItems
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= firstDayOfPreviousMonth && itemDate <= lastDayOfPreviousMonth;
            })
            .reduce((sum, item) => sum + item.amount, 0);

        let text = '';
        let trend: 'up' | 'down' | 'none' = 'none';

        if (previousMonthTotal === 0) {
            text = currentMonthTotal > 0 ? t('comparisonNew') : t('comparisonNoPreviousData');
        } else {
            const percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
            if (Math.abs(percentageChange) < 0.1) {
                text = t('comparisonNoChange');
            } else if (percentageChange > 0) {
                text = t('comparisonIncrease', percentageChange.toFixed(1));
                trend = 'up';
            } else {
                text = t('comparisonDecrease', percentageChange.toFixed(1));
                trend = 'down';
            }
        }
        return { text, trend };
    }, [allItems, t]);

    const displayedItems = useMemo(() => {
        return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [items]);

    const monthlyData = useMemo(() => {
        const grouped: { [key: string]: number } = {};
        allItems.forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            grouped[monthKey] = (grouped[monthKey] || 0) + item.amount;
        });
        
        const monthFormatter = new Intl.DateTimeFormat(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', year: '2-digit' });

        return Object.entries(grouped)
            .map(([monthKey, total]) => {
                const [year, month] = monthKey.split('-').map(Number);
                const date = new Date(year, month - 1, 1);
                return {
                    date: date,
                    month: monthFormatter.format(date),
                    monthKey: monthKey,
                    [chartDataKey]: total,
                };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [allItems, chartDataKey, language]);


    const handleSave = (item: Omit<Transaction, 'id'>) => {
        onAddItem(item);
        setShowForm(false);
        setInitialFormData(null);
    };
    
    const handleCancel = () => {
        setShowForm(false);
        setInitialFormData(null);
    };

    const handleQuickAddClick = (category: string) => {
        setInitialFormData({
            name: category,
            category: category,
        });
        setShowForm(true);
    };

    return (
        <ViewContainer title="" icon="">
            {/* Header / Summary Section */}
            <div className="relative mb-10">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative group">
                    {/* Decorative Background Elements */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl transition-all group-hover:scale-150 duration-700 ${amountColor.replace('text-', 'bg-')}`}></div>
                    
                    <div className="relative flex flex-col items-center text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-2">
                            {totalLabel} • {t('allTime')}
                        </span>
                        
                        <div className={`text-5xl sm:text-6xl font-black ${amountColor} dark:text-white tracking-tighter mb-4`}>
                            {formatCurrency(total, currencySettings)}
                        </div>
                        
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border
                            ${comparisonData.trend === 'up' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 
                              comparisonData.trend === 'down' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' : 
                              'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600'}`}>
                            <i className={`fas ${comparisonData.trend === 'up' ? 'fa-arrow-trend-up' : comparisonData.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus'}`}></i>
                            {comparisonData.text}
                        </div>
                    </div>
                </div>

                {categoryFilter && (
                    <div className="mt-4 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                                <i className="fas fa-filter"></i>
                            </div>
                            <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                                {t('showingTransactionsFor')}: <span className="text-amber-600 dark:text-amber-400">{categoryFilter}</span>
                            </span>
                        </div>
                        <button
                            onClick={onClearFilter}
                            className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl shadow-sm border border-amber-200 dark:border-amber-700 hover:bg-amber-500 hover:text-white transition-all"
                        >
                            {t('clearFilter')}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Transaction List */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('transactionDetails')}</h3>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-4"></div>
                    </div>
                    
                    <div className="space-y-3">
                        {displayedItems.length > 0 ? displayedItems.map(item => (
                             <TransactionItem 
                                key={item.id} 
                                item={item} 
                                icon={itemIcon} 
                                color={itemColor} 
                                onDelete={onDeleteItem}
                            />
                        )) : (
                             <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                                <i className="fas fa-ghost text-4xl text-gray-200 dark:text-gray-600 mb-3"></i>
                                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('noItemsFound')}</p>
                             </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions & Stats */}
                <div className="space-y-8">
                    {/* Quick Add Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6 px-1 flex items-center gap-2">
                            <i className="fas fa-bolt text-amber-400"></i> {t('quickAdd')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.filter(c => !otherCategoryNames.includes(c)).map(cat => (
                                <button key={cat} onClick={() => handleQuickAddClick(cat)} className="group text-left p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-slate-500 hover:text-white transition-all border border-transparent hover:border-slate-400 dark:hover:border-slate-500 shadow-sm overflow-hidden relative">
                                    <span className="font-bold text-xs uppercase tracking-tight block truncate relative z-10">{cat}</span>
                                    <i className="fas fa-plus absolute -right-2 -bottom-2 text-gray-200 dark:text-gray-800 text-3xl opacity-20 group-hover:text-white group-hover:scale-125 transition-transform"></i>
                                </button>
                            ))}
                            <button onClick={() => setShowForm(true)} className="col-span-2 p-4 rounded-2xl bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-gray-600">
                                <i className="fas fa-plus-circle"></i> {t('addNew')}
                            </button>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{chartTitle}</h3>
                            <button onClick={() => setIsChartVisible(!isChartVisible)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-slate-500 transition-all">
                                <i className={`fas fa-chevron-down transition-transform duration-300 ${isChartVisible ? 'rotate-180 text-slate-500' : ''}`}></i>
                            </button>
                        </div>
                        
                        <div className={`transition-all duration-500 ease-in-out ${isChartVisible ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-2">
                                <MonthlyFlowChart
                                    theme={theme}
                                    data={monthlyData}
                                    dataKey={chartDataKey}
                                    color={chartColor}
                                />
                            </div>
                        </div>
                        
                        {!isChartVisible && (
                             <button onClick={() => setIsChartVisible(true)} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                View Performance Trends
                             </button>
                        )}
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn" onClick={handleCancel}>
                    <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <TransactionForm 
                            categories={categories}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            title={formTitle}
                            nameLabel={nameLabel}
                            namePlaceholder={namePlaceholder}
                            initialData={initialFormData}
                            onAddCategory={onAddCategory}
                        />
                    </div>
                </div>
            )}
        </ViewContainer>
    );
};

export default TransactionView;