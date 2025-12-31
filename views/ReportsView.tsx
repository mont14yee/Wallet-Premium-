
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { formatCurrency } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { AllTransaction, TransactionType, UserProfile } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportsViewProps {
    userProfile: UserProfile;
    allTransactions: AllTransaction[];
    incomeCategories: string[];
    expenseCategories: string[];
    shoppingCategories: string[];
}

interface ReportSummary {
    totalIncome: number;
    totalOutgoings: number;
    netBalance: number;
    transactionCount: number;
}

interface SavedReport {
    id: number;
    name: string;
    filters: {
        startDate: string;
        endDate: string;
        selectedTypes: TransactionType[];
        selectedCategories: string[];
    };
}

const ReportStatCard: React.FC<{ title: string; value: string; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md flex items-center gap-4">
        <div className={`text-2xl p-3 rounded-full bg-opacity-10 ${color}`}><i className={`${icon}`}></i></div>
        <div>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{title}</h4>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</div>
        </div>
    </div>
);

const FinancialSummaryChart: React.FC<{ summary: ReportSummary }> = ({ summary }) => {
    const { t, currencySettings } = useLanguage();
    const chartData = [
        { name: t('income'), value: summary.totalIncome, fill: '#64748b' },
        { name: t('outgoings'), value: summary.totalOutgoings, fill: '#f44336' },
        { name: t('netBalance'), value: summary.netBalance, fill: '#2196f3' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl">
                    <p className="label font-bold text-gray-800 dark:text-gray-200">{`${label}`}</p>
                    <p className="intro" style={{ color: payload[0].payload.fill }}>
                        {`${t('amount')}: ${formatCurrency(payload[0].value, currencySettings)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" className="fill-gray-600 dark:fill-gray-400" fontSize={12} />
                    <YAxis
                        className="fill-gray-600 dark:fill-gray-400"
                        fontSize={12}
                        tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const COLORS = ['#64748b', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#673ab7', '#00bcd4'];

const CategoryBreakdownChart: React.FC<{ 
    data: AllTransaction[]; 
    theme: 'light' | 'dark';
    onCategoryClick: (category: string) => void;
    activeCategory: string | null;
}> = ({ data, theme, onCategoryClick, activeCategory }) => {
    const { t, currencySettings } = useLanguage();

    const chartData = useMemo(() => {
        const expenseData = data.filter(t => t.type === TransactionType.Expense || t.type === TransactionType.Shopping);
        const categoryMap: { [key: string]: number } = {};
        expenseData.forEach(item => {
            categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
        });
        return Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] })).sort((a,b) => b.value - a.value);
    }, [data]);

    const activeIndex = useMemo(() => {
        if (!activeCategory) return -1;
        return chartData.findIndex(d => d.name === activeCategory);
    }, [chartData, activeCategory]);

    const handlePieClick = useCallback((data: any) => {
        if (data.name) {
            onCategoryClick(data.name);
        }
    }, [onCategoryClick]);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">{t('noDataForPeriod')}</div>;
    }

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie 
                        data={chartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={90} 
                        paddingAngle={2} 
                        dataKey="value" 
                        nameKey="name" 
                        onClick={handlePieClick}
                        style={{ cursor: 'pointer' }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                stroke={theme === 'dark' ? '#1f2937' : '#fff'} 
                                strokeWidth={2}
                                opacity={activeIndex === -1 || activeIndex === index ? 1 : 0.3}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return <div className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl"><p className="font-bold" style={{ color: payload[0].fill }}>{payload[0].name}</p><p>{formatCurrency(payload[0].value, currencySettings)}</p></div>;
                        }
                        return null;
                    }}/>
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const AISummary: React.FC<{ summary: string | null; isLoading: boolean }> = ({ summary, isLoading }) => {
    const { t } = useLanguage();
    if (isLoading) {
        return (
            <div className="p-4 bg-blue-50 dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="p-4 bg-blue-50 dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <i className="fas fa-robot"></i> AI Financial Insights
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
        </div>
    );
};


const ReportsView: React.FC<ReportsViewProps> = ({ userProfile, allTransactions, incomeCategories, expenseCategories, shoppingCategories }) => {
    const { t, currencySettings, language } = useLanguage();
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([TransactionType.Income, TransactionType.Expense, TransactionType.Shopping]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    
    const [generatedReport, setGeneratedReport] = useState<AllTransaction[] | null>(null);
    const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [newReportName, setNewReportName] = useState('');
    const userKey = userProfile.email;

    useEffect(() => {
        if (!userKey) return;
        try {
            const storedReports = localStorage.getItem(`walletSavedReports-${userKey}`);
            if (storedReports) {
                setSavedReports(JSON.parse(storedReports));
            } else {
                setSavedReports([]);
            }
        } catch (error) {
            console.error("Failed to load saved reports from localStorage:", error);
            localStorage.removeItem(`walletSavedReports-${userKey}`);
        }
    }, [userKey]);

    useEffect(() => {
        if (!userKey) return;
        try {
            localStorage.setItem(`walletSavedReports-${userKey}`, JSON.stringify(savedReports));
        } catch (error) {
            console.error("Failed to save reports to localStorage:", error);
        }
    }, [savedReports, userKey]);

    const availableCategories = useMemo(() => {
        let cats: string[] = [];
        if (selectedTypes.includes(TransactionType.Income)) cats = [...cats, ...incomeCategories];
        if (selectedTypes.includes(TransactionType.Expense)) cats = [...cats, ...expenseCategories];
        if (selectedTypes.includes(TransactionType.Shopping)) cats = [...cats, ...shoppingCategories];
        return [...new Set(cats)].sort();
    }, [selectedTypes, incomeCategories, expenseCategories, shoppingCategories]);
    
    React.useEffect(() => {
        setSelectedCategories(prev => prev.filter(cat => availableCategories.includes(cat)));
    }, [availableCategories]);

    const handleTypeChange = (type: TransactionType) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategories([...e.target.selectedOptions].map(o => o.value));

    const generateAndSetAiSummary = async (summary: ReportSummary, report: AllTransaction[]) => {
        setIsGeneratingSummary(true);
        setAiSummary(null);
        try {
            const expenseCategories = report
                .filter(t => t.type !== TransactionType.Income)
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                }, {} as {[key: string]: number});
            
            const top5Expenses = Object.entries(expenseCategories)
                .sort(([,a],[,b]) => b-a)
                .slice(0, 5)
                .map(([name, amount]) => `${name}: ${formatCurrency(amount, currencySettings)}`)
                .join('\n');

            const prompt = `You are a helpful financial assistant. Based on the following financial data from a user's report, provide a concise summary and one or two actionable tips. The currency is ${currencySettings.symbol}. The user's language is ${language === 'am' ? 'Amharic' : 'English'}. Respond in the user's language.

- Time Period: ${startDate} to ${endDate}
- Total Income: ${formatCurrency(summary.totalIncome, currencySettings)}
- Total Expenses: ${formatCurrency(summary.totalOutgoings, currencySettings)}
- Net Balance: ${formatCurrency(summary.netBalance, currencySettings)}
- Top 5 Expense Categories:
${top5Expenses}

Keep the summary friendly, insightful, and brief (around 3-4 sentences). The tips should be practical and relevant to the data provided. For example, if food spending is high, suggest meal planning. If the net balance is negative, suggest reviewing specific spending categories. Do not use markdown formatting like headers or lists. Just provide a single paragraph of text.`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            setAiSummary(response.text);
        } catch (error) {
            console.error("AI Summary generation failed:", error);
            setAiSummary("Could not generate AI summary at this time.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleGenerateReport = () => {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);

        const filtered = allTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end && selectedTypes.includes(t.type) && (selectedCategories.length === 0 || selectedCategories.includes(t.category));
        });

        const newSummary = filtered.reduce((acc, t) => {
            if (t.type === TransactionType.Income) acc.totalIncome += t.amount;
            else acc.totalOutgoings += t.amount;
            return acc;
        }, { totalIncome: 0, totalOutgoings: 0 });
        
        const fullSummary = { ...newSummary, netBalance: newSummary.totalIncome - newSummary.totalOutgoings, transactionCount: filtered.length };

        setGeneratedReport(filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setReportSummary(fullSummary);
        setCategoryFilter(null);
        generateAndSetAiSummary(fullSummary, filtered);
    };

    const handleSaveReport = () => {
        if (!newReportName.trim()) {
            alert(t('reportEnterName'));
            return;
        }
        const newReport: SavedReport = {
            id: Date.now(),
            name: newReportName.trim(),
            filters: {
                startDate,
                endDate,
                selectedTypes,
                selectedCategories
            }
        };
        setSavedReports(prev => [...prev, newReport]);
        setNewReportName('');
        setShowSaveForm(false);
    };

    const handleLoadReport = (reportId: number) => {
        const reportToLoad = savedReports.find(r => r.id === reportId);
        if (reportToLoad) {
            setStartDate(reportToLoad.filters.startDate);
            setEndDate(reportToLoad.filters.endDate);
            setSelectedTypes(reportToLoad.filters.selectedTypes);
            setSelectedCategories(reportToLoad.filters.selectedCategories);
        }
    };

    const handleDeleteReport = (reportId: number) => {
        if (window.confirm(t('reportDeleteConfirm'))) {
            setSavedReports(prev => prev.filter(r => r.id !== reportId));
        }
    };
    
    const handlePieClick = (category: string) => {
        setCategoryFilter(prev => prev === category ? null : category);
    };

    const displayedTransactions = useMemo(() => {
        if (!generatedReport) return [];
        if (!categoryFilter) return generatedReport;
        return generatedReport.filter(tx => tx.category === categoryFilter);
    }, [generatedReport, categoryFilter]);
    
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";
    const labelClasses = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="no-print">
                {savedReports.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-gray-600">
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2"><i className="fas fa-star"></i> {t('savedReports')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {savedReports.map(report => (
                                <div key={report.id} className="group relative">
                                    <button onClick={() => handleLoadReport(report.id)} className="bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-blue-100 text-sm font-medium py-1.5 pl-3 pr-8 rounded-full hover:bg-blue-300 dark:hover:bg-blue-500 transition-colors" title={`${t('reportLoad')}: ${report.name}`}>
                                        {report.name}
                                    </button>
                                    <button onClick={() => handleDeleteReport(report.id)} className="absolute top-1/2 right-1 -translate-y-1/2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:opacity-100" aria-label={`${t('reportDelete')} ${report.name}`}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                     <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><i className="fas fa-filter"></i> {t('customizeReport')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div><label className={labelClasses} htmlFor="startDate">{t('startDate')}</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} /></div>
                        <div><label className={labelClasses} htmlFor="endDate">{t('endDate')}</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} /></div>
                        <div className="md:col-span-2 lg:col-span-1"><label className={labelClasses}>{t('transactionTypes')}</label><div className="flex flex-col sm:flex-row sm:gap-4 pt-1">{(Object.values(TransactionType) as TransactionType[]).map(type => (<label key={type} className="flex items-center gap-2 text-gray-800 dark:text-gray-200 cursor-pointer"><input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => handleTypeChange(type)} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" /><span className="capitalize">{t(type as any)}</span></label>))}</div></div>
                        <div><label className={labelClasses} htmlFor="categories">{t('categories')}</label><select id="categories" multiple value={selectedCategories} onChange={handleCategoryChange} className={`${inputClasses} h-24`} aria-label="Select categories for the report">{availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('reportCategoriesHelp')}</p></div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                    <button onClick={() => setShowSaveForm(!showSaveForm)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                        <i className={`fas fa-save transition-transform duration-300 ${showSaveForm ? 'text-blue-500' : ''}`}></i>
                        {showSaveForm ? t('reportCancelSave') : t('reportSaveFilters')}
                    </button>
                    <button onClick={handleGenerateReport} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full hover:bg-slate-700 transition-colors flex items-center gap-2"><i className="fas fa-cogs"></i> {t('generateReport')}</button>
                </div>

                {showSaveForm && (
                    <div className="mt-4 p-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600 animate-fadeIn">
                        <label className={`${labelClasses} text-center sm:text-left`}>{t('reportSaveFilters')}</label>
                        <div className="flex flex-col sm:flex-row items-stretch gap-4 mt-2">
                            <input
                                type="text"
                                value={newReportName}
                                onChange={(e) => setNewReportName(e.target.value)}
                                placeholder={t('reportNamePlaceholder')}
                                className={`${inputClasses} flex-grow`}
                                aria-label="New report name"
                            />
                            <button onClick={handleSaveReport} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition-colors flex-shrink-0 flex items-center justify-center gap-2">
                                <i className="fas fa-save"></i> {t('save')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {generatedReport && reportSummary && (
                <div id="printable-report-area" className="mt-8 p-4 sm:p-6 bg-gray-100 dark:bg-gray-900/50 rounded-2xl shadow-lg animate-fadeIn">
                    <header className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('reportCustomTitle')}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('reportGeneratedOn')} {new Date().toLocaleDateString()} | {startDate} to {endDate}
                            </p>
                        </div>
                        <button onClick={() => window.print()} className="no-print bg-teal-600 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-700 transition-colors flex items-center gap-2">
                            <i className="fas fa-print"></i> Print Report
                        </button>
                    </header>
                    
                    <div className="space-y-6">
                        <AISummary summary={aiSummary} isLoading={isGeneratingSummary} />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ReportStatCard title={t('totalIncome')} value={formatCurrency(reportSummary.totalIncome, currencySettings)} icon="fas fa-coins" color="text-slate-500" />
                                    <ReportStatCard title={t('totalOutgoings')} value={formatCurrency(reportSummary.totalOutgoings, currencySettings)} icon="fas fa-receipt" color="text-red-500" />
                                    <ReportStatCard title={t('totalTransactions')} value={reportSummary.transactionCount.toString()} icon="fas fa-list-ol" color="text-gray-500" />
                                    <ReportStatCard title={t('netBalance')} value={formatCurrency(reportSummary.netBalance, currencySettings)} icon="fas fa-balance-scale" color={reportSummary.netBalance >= 0 ? 'text-slate-500' : 'text-red-500'} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                                    <h4 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{t('visualSummary')}</h4>
                                    <FinancialSummaryChart summary={reportSummary} />
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                                 <h4 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Expense Breakdown</h4>
                                 <CategoryBreakdownChart 
                                    data={generatedReport} 
                                    theme={language === 'dark' ? 'dark' : 'light'}
                                    onCategoryClick={handlePieClick}
                                    activeCategory={categoryFilter}
                                 />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-700 dark:text-gray-200">{t('transactionDetails')}</h4>
                                {categoryFilter && (
                                    <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg">
                                        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                            {t('showingTransactionsFor')}: {categoryFilter}
                                        </span>
                                        <button onClick={() => setCategoryFilter(null)} className="text-xs font-bold bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 px-2 py-0.5 rounded-full hover:bg-yellow-300 dark:hover:bg-yellow-600">
                                            {t('clearFilter')}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                                            <tr>
                                                <th scope="col" className="px-4 py-3">{t('csvDate')}</th>
                                                <th scope="col" className="px-4 py-3">{t('csvType')}</th>
                                                <th scope="col" className="px-4 py-3">{t('csvName')}</th>
                                                <th scope="col" className="px-4 py-3">{t('csvCategory')}</th>
                                                <th scope="col" className="px-4 py-3 text-right">{t('csvAmount')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedTransactions.length > 0 ? displayedTransactions.map(item => (
                                                <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                                    <td className="px-4 py-3 whitespace-nowrap">{item.date}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`capitalize px-2 py-1 text-xs font-medium rounded-full ${item.type === TransactionType.Income ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                            {t(item.type as any)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                                    <td className="px-4 py-3">{item.category}</td>
                                                    <td className={`px-4 py-3 text-right font-bold ${item.type === TransactionType.Income ? 'text-slate-600 dark:text-slate-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {formatCurrency(item.amount, currencySettings)}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={5} className="text-center py-6">{t('noTransactionsFound')}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsView;