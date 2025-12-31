
import React, { useState, useMemo } from 'react';
import { Transaction, ViewType } from '../types';
import ViewContainer from '../components/ViewContainer';
import CategoryChart from '../components/charts/CategoryChart';
import FinancialHealthChart from '../components/charts/FinancialHealthChart';
import { formatCurrency } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardViewProps {
    income: number;
    expenses: number;
    netAmount: number;
    allIncome: Transaction[];
    allExpenses: Transaction[];
    theme: 'light' | 'dark';
    setActiveView: (view: ViewType) => void;
    setCategoryFilter: (category: string | null) => void;
    exportToCSV: () => void;
    assets: number;
    liabilities: number;
}

const CATEGORY_ICONS: Record<string, string> = {
    // English
    'Salary': 'fa-money-bill-trend-up',
    'Business': 'fa-building-columns',
    'Investment': 'fa-chart-pie',
    'Loan Repayment': 'fa-hand-holding-dollar',
    'Investment Gains': 'fa-arrow-trend-up',
    'Bills': 'fa-file-invoice-dollar',
    'Food': 'fa-bowl-food',
    'Transport': 'fa-bus-simple',
    'Entertainment': 'fa-clapperboard',
    'Shopping': 'fa-cart-shopping',
    'Education': 'fa-book-open-reader',
    'Health': 'fa-stethscope',
    'Loan Payment': 'fa-receipt',
    'Other': 'fa-shapes',
    // Amharic
    'ደመወዝ': 'fa-money-bill-trend-up',
    'ቢዝነስ': 'fa-building-columns',
    'ኢንቨስትመንት': 'fa-chart-pie',
    'የብድር ክፍያ': 'fa-hand-holding-dollar',
    'የኢንቨስትመንት ትርፍ': 'fa-arrow-trend-up',
    'የቤት ክፍያዎች': 'fa-file-invoice-dollar',
    'ምግብ': 'fa-bowl-food',
    'ትራንስፖርት': 'fa-bus-simple',
    'መዝናኛ': 'fa-clapperboard',
    'ግዢዎች': 'fa-cart-shopping',
    'ትምህርት': 'fa-book-open-reader',
    'የጤና ክፍያ': 'fa-stethoscope',
    'ሌላ': 'fa-shapes',
};

// Colors matching CategoryChart.tsx for visual cohesion
const CHART_COLORS = ['#64748b', '#2196f3', '#ff9800'];

const getIconForCategory = (cat: string) => CATEGORY_ICONS[cat] || 'fa-tag';

const DashboardView: React.FC<DashboardViewProps> = ({ income, expenses, netAmount, allIncome, allExpenses, theme, setActiveView, setCategoryFilter, exportToCSV, assets, liabilities }) => {
    const { t, currencySettings, language } = useLanguage();
    const [dateRange, setDateRange] = useState('month');

    const dateRanges = [
        { key: '7d', label: t('d7') },
        { key: '15d', label: t('d15') },
        { key: 'month', label: t('thisMonth') },
        { key: 'year', label: t('thisYear') },
        { key: 'all', label: t('all') },
    ];

    const getStartDate = (range: string): Date | null => {
        if (range === 'all') return null;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate: Date;

        switch(range) {
            case '7d':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 6);
                break;
            case '15d':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 14);
                break;
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(today.getFullYear(), 0, 1);
                break;
            default:
                return null;
        }
        return startDate;
    };

    const filteredData = useMemo(() => {
        const startDate = getStartDate(dateRange);
        const filterFn = (transaction: Transaction) => !startDate || new Date(transaction.date) >= startDate;
        
        const filteredIncome = allIncome.filter(filterFn);
        const filteredExpenses = allExpenses.filter(filterFn);

        const getCategoryBreakdown = (txs: Transaction[]) => {
            const map: Record<string, number> = {};
            txs.forEach(t => map[t.category] = (map[t.category] || 0) + t.amount);
            return Object.entries(map)
                .map(([name, amount]) => ({ name, amount }))
                .sort((a, b) => b.amount - a.amount);
        };

        return {
            income: filteredIncome,
            expenses: filteredExpenses,
            incomeTotal: filteredIncome.reduce((sum, item) => sum + item.amount, 0),
            expensesTotal: filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
            incomeBreakdown: getCategoryBreakdown(filteredIncome),
            expenseBreakdown: getCategoryBreakdown(filteredExpenses),
        };
    }, [dateRange, allIncome, allExpenses]);

    const monthlyFinancialData = useMemo(() => {
        const all = [
            ...allIncome.map(tx => ({ ...tx, type: 'income' })),
            ...allExpenses.map(tx => ({ ...tx, type: 'expense' })),
        ];

        const groupedByMonth: { [key: string]: { income: number, expenses: number } } = {};

        all.forEach(tx => {
            const date = new Date(tx.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!groupedByMonth[monthKey]) {
                groupedByMonth[monthKey] = { income: 0, expenses: 0 };
            }
            if (tx.type === 'income') {
                groupedByMonth[monthKey].income += tx.amount;
            } else {
                groupedByMonth[monthKey].expenses += tx.amount;
            }
        });
        
        const monthFormatter = new Intl.DateTimeFormat(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', year: '2-digit' });

        return Object.entries(groupedByMonth)
            .map(([monthKey, values]) => {
                const [year, month] = monthKey.split('-').map(Number);
                const date = new Date(year, month - 1, 1);
                return {
                    date: date,
                    month: monthFormatter.format(date),
                    income: values.income,
                    expenses: values.expenses,
                    balance: values.income - values.expenses
                }
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());

    }, [allIncome, allExpenses, language]);

    const handleCategoryClick = (category: string, type: 'income' | 'expense') => {
        setCategoryFilter(category);
        setActiveView(type === 'income' ? ViewType.Income : ViewType.Expenses);
    };
    
    const StatCard: React.FC<{ title: string; amount: number; icon: string; color: string; borderColor: string }> = ({ title, amount, icon, color, borderColor }) => (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] border-t-4 ${borderColor}`}>
            <div className="flex items-center justify-between">
                <div>
                     <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                     <h3 className={`text-2xl font-extrabold mt-2 ${amount >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-red-500'}`}>
                        {formatCurrency(amount, currencySettings)}
                    </h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl`} style={{ backgroundColor: color + '20', color: color }}>
                    <i className={icon}></i>
                </div>
            </div>
        </div>
    );

    const CategoryList: React.FC<{ breakdown: {name: string, amount: number}[], total: number, type: 'income' | 'expense' }> = ({ breakdown, total, type }) => (
        <div className="space-y-4 mt-4">
            {breakdown.slice(0, 5).map((item, index) => {
                const percentage = total > 0 ? (item.amount / total) * 100 : 0;
                const catColor = CHART_COLORS[index % CHART_COLORS.length];
                return (
                    <button 
                        key={item.name}
                        onClick={() => handleCategoryClick(item.name, type)}
                        className="w-full group text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transform hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: catColor }}>
                                    <i className={`fas ${getIconForCategory(item.name)} text-sm`}></i>
                                </div>
                                <div>
                                    <span className="block font-black text-gray-800 dark:text-gray-100 text-sm leading-tight">{item.name}</span>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{percentage.toFixed(1)}% {t('percentage')}</span>
                                </div>
                            </div>
                            <span className="font-black text-sm text-gray-800 dark:text-gray-100">{formatCurrency(item.amount, currencySettings)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${percentage}%`, backgroundColor: catColor }}
                            ></div>
                        </div>
                    </button>
                );
            })}
        </div>
    );

    return (
        <ViewContainer title={t('dashboard')} icon="fas fa-chart-line">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('totalIncome')} amount={income} icon="fas fa-arrow-up" color="#64748b" borderColor="border-slate-500" />
                <StatCard title={t('totalExpenses')} amount={expenses} icon="fas fa-arrow-down" color="#f44336" borderColor="border-red-500" />
                <StatCard title={t('netAmount')} amount={netAmount} icon="fas fa-balance-scale" color="#2196f3" borderColor="border-blue-500" />
            </div>

            {/* Assets & Liabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <StatCard title={t('assets')} amount={assets} icon="fas fa-hand-holding-usd" color="#4caf50" borderColor="border-green-500" />
                 <StatCard title={t('liabilities')} amount={liabilities} icon="fas fa-file-invoice-dollar" color="#ffc107" borderColor="border-yellow-500" />
            </div>

            {/* Time Filter & Period Stats */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border-t-4 border-indigo-500 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                        <i className="fas fa-filter text-indigo-500"></i>
                        {t('timeFilter')}
                    </h3>
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mt-3 md:mt-0">
                        {dateRanges.map(range => (
                            <button
                                key={range.key}
                                onClick={() => setDateRange(range.key)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${dateRange === range.key ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <i className="fas fa-arrow-up"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('periodIncome')}</p>
                            <p className="text-lg font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(filteredData.incomeTotal, currencySettings)}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center gap-4 border border-red-100 dark:border-red-900/30">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                            <i className="fas fa-arrow-down"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('periodExpenses')}</p>
                            <p className="text-lg font-extrabold text-red-600 dark:text-red-400">{formatCurrency(filteredData.expensesTotal, currencySettings)}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center gap-4 border border-blue-100 dark:border-blue-900/30">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <i className="fas fa-balance-scale"></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('periodNetAmount')}</p>
                            <p className={`text-lg font-extrabold ${filteredData.incomeTotal - filteredData.expensesTotal >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                                {formatCurrency(filteredData.incomeTotal - filteredData.expensesTotal, currencySettings)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Trend */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border-t-4 border-teal-500 mb-8">
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                        <i className="fas fa-heartbeat text-teal-500"></i>
                        {t('financialHealthTrend')}
                    </h3>
                </div>
                <FinancialHealthChart data={monthlyFinancialData} theme={theme} />
            </div>

            {/* Premium Category Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Income Categories */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border-l-8 border-slate-500 relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-slate-900/50">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 flex items-center gap-3">
                            <i className="fas fa-piggy-bank text-slate-500"></i>
                            {t('incomeCategories')}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                        <div className="h-[280px]">
                            <CategoryChart data={filteredData.income} theme={theme} onCategoryClick={(cat) => handleCategoryClick(cat, 'income')} />
                        </div>
                        <div>
                             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-3">{t('topCategories')}</h4>
                             <CategoryList breakdown={filteredData.incomeBreakdown} total={filteredData.incomeTotal} type="income" />
                        </div>
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border-l-8 border-red-500 relative overflow-hidden bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800 dark:to-red-900/20">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-red-600 dark:text-red-200 flex items-center gap-3">
                            <i className="fas fa-cart-shopping text-red-500"></i>
                            {t('expenseCategories')}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                        <div className="h-[280px]">
                            <CategoryChart data={filteredData.expenses} theme={theme} onCategoryClick={(cat) => handleCategoryClick(cat, 'expense')} />
                        </div>
                        <div>
                             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-3">{t('topCategories')}</h4>
                             <CategoryList breakdown={filteredData.expenseBreakdown} total={filteredData.expensesTotal} type="expense" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border-t-4 border-gray-500">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                            <i className="fas fa-file-export text-gray-500"></i>
                            {t('exportYourData')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('exportDescription')}
                        </p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="bg-slate-600 text-white font-bold py-3 px-6 rounded-full hover:bg-slate-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <i className="fas fa-file-csv"></i>
                        <span>{t('exportCSV')}</span>
                    </button>
                </div>
            </div>
        </ViewContainer>
    );
};

export default DashboardView;
