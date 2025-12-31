import React, { useState, useMemo } from 'react';
import { Investment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InvestmentsViewProps {
    investments: Investment[];
    addInvestment: (item: Omit<Investment, 'id'>) => void;
    updateInvestment: (item: Investment) => void;
    sellInvestment: (id: number) => void;
}

const InvestmentFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<Investment, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [type, setType] = useState<Investment['type']>('Stock');
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name, type,
            quantity: parseFloat(quantity),
            purchasePrice: parseFloat(purchasePrice),
            currentPrice: parseFloat(currentPrice),
            purchaseDate,
        });
        onClose();
    };
    
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";
    
    return (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b dark:border-gray-700">
                        <h2 className="font-bold text-lg">{t('newInvestment')}</h2>
                    </header>
                    <main className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm">{t('stockName')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('stockNamePlaceholder')} className={inputClasses} required /></div>
                            <div><label className="text-sm">{t('investmentType')}</label><select value={type} onChange={e => setType(e.target.value as Investment['type'])} className={inputClasses}>
                                <option value="Stock">{t('stock')}</option>
                                <option value="ETF">{t('etf')}</option>
                                <option value="Crypto">{t('crypto')}</option>
                                <option value="Mutual Fund">{t('mutualFund')}</option>
                                <option value="Other">{t('other')}</option>
                            </select></div>
                            <div><label className="text-sm">{t('quantity')}</label><input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" className={inputClasses} required /></div>
                            <div><label className="text-sm">{t('purchaseDate')}</label><input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={inputClasses} required /></div>
                            <div><label className="text-sm">{t('purchasePrice')}</label><input type="number" step="any" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0.00" className={inputClasses} required /></div>
                            <div><label className="text-sm">{t('currentPrice')}</label><input type="number" step="any" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="0.00" className={inputClasses} required /></div>
                        </div>
                    </main>
                    <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 font-bold py-2 px-4 rounded-full">{t('cancel')}</button>
                        <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full">{t('save')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const InvestmentCard: React.FC<{
    item: Investment;
    onUpdate: (item: Investment) => void;
    onSell: (id: number) => void;
}> = ({ item, onUpdate, onSell }) => {
    const { t, currencySettings } = useLanguage();
    const [newCurrentPrice, setNewCurrentPrice] = useState(item.currentPrice.toString());
    const [isUpdating, setIsUpdating] = useState(false);

    const costBasis = item.purchasePrice * item.quantity;
    const marketValue = item.currentPrice * item.quantity;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    const gainLossColor = gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    
    const handleUpdate = () => {
        onUpdate({ ...item, currentPrice: parseFloat(newCurrentPrice) });
        setIsUpdating(false);
    };

    const handleSell = () => {
        const { quantity, name, currentPrice } = item;
        const formattedPrice = formatCurrency(currentPrice, currencySettings);
        if(window.confirm(t('sellConfirmationText', quantity, name, formattedPrice))) {
            onSell(item.id);
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{item.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({item.type})</span></h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('purchaseDate')}: {item.purchaseDate}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-slate-600 dark:text-slate-300">{formatCurrency(marketValue, currencySettings)}</p>
                    <p className={`font-semibold text-sm ${gainLossColor}`}>{formatCurrency(gainLoss, currencySettings)} ({gainLossPercent.toFixed(2)}%)</p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 grid grid-cols-3 gap-2 text-center">
                <div><span className="font-semibold block">{t('quantity')}</span> {item.quantity.toLocaleString()}</div>
                <div><span className="font-semibold block">{t('purchasePrice')}</span> {formatCurrency(item.purchasePrice, currencySettings)}</div>
                <div><span className="font-semibold block">{t('currentPrice')}</span> {formatCurrency(item.currentPrice, currencySettings)}</div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
                {isUpdating ? (
                    <div className="flex items-center gap-2 animate-fadeIn">
                        <input type="number" value={newCurrentPrice} onChange={e => setNewCurrentPrice(e.target.value)} className="w-28 p-1 border rounded bg-transparent text-sm"/>
                        <button onClick={handleUpdate} className="text-green-600 p-2"><i className="fas fa-check"></i></button>
                        <button onClick={() => setIsUpdating(false)} className="text-red-500 p-2"><i className="fas fa-times"></i></button>
                    </div>
                ) : (
                    <button onClick={() => setIsUpdating(true)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t('update')}</button>
                )}
                <button onClick={handleSell} className="text-sm font-semibold text-red-500 dark:text-red-400 hover:underline">{t('sell')}</button>
            </div>
        </div>
    );
};


const COLORS = ['#64748b', '#2196f3', '#ff9800', '#4caf50', '#f44336'];

const InvestmentsView: React.FC<InvestmentsViewProps> = ({ investments, addInvestment, updateInvestment, sellInvestment }) => {
    const { t, currencySettings } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    
    const portfolioSummary = useMemo(() => {
        const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
        const totalCost = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
        return { totalValue, totalCost, totalGainLoss, totalGainLossPercent };
    }, [investments, currencySettings]);

    const chartData = useMemo(() => {
        return investments.map(inv => ({
            name: inv.name,
            value: inv.currentPrice * inv.quantity
        })).filter(d => d.value > 0);
    }, [investments]);

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 h-full space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-400 flex items-center gap-3">
                    <i className="fas fa-chart-line"></i> {t('investments')}
                </h2>
                <button onClick={() => setShowForm(true)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors">
                    <i className="fas fa-plus"></i> {t('addInvestment')}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('portfolioValue')}</h3>
                <p className="text-4xl font-extrabold text-slate-700 dark:text-slate-200 my-2">
                    {formatCurrency(portfolioSummary.totalValue, currencySettings)}
                </p>
                <div className={`text-lg font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    <span>{portfolioSummary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalGainLoss, currencySettings)}</span>
                    <span className="text-sm ml-2">({portfolioSummary.totalGainLossPercent.toFixed(2)}%)</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('investmentTotalCost')}: {formatCurrency(portfolioSummary.totalCost, currencySettings)}
                </p>
            </div>

            {investments.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{t('portfolioAllocation')}</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value, currencySettings)}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {investments.length > 0 ? (
                    investments.map(inv => <InvestmentCard key={inv.id} item={inv} onUpdate={updateInvestment} onSell={sellInvestment} />)
                ) : (
                    <div className="text-center py-16">
                        <i className="fas fa-seedling text-6xl text-gray-300 dark:text-gray-600"></i>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noInvestments')}</p>
                    </div>
                )}
            </div>

            <InvestmentFormModal isOpen={showForm} onClose={() => setShowForm(false)} onSave={addInvestment} />
        </div>
    );
};

export default InvestmentsView;
