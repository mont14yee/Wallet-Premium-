import React, { useState, useMemo } from 'react';
import { ShoppingList, ShoppingListItem, Frequency, TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';

// Props Interface
interface HarvestHavenViewProps {
    shoppingLists: ShoppingList[];
    categories: string[];
    expenseCategories: string[];
    onAddList: (list: Omit<ShoppingList, 'id' | 'items'>) => void;
    onDeleteList: (listId: number) => void;
    onUpdateList: (listId: number, updates: Partial<ShoppingList>) => void;
    onAddItem: (listId: number, item: Omit<ShoppingListItem, 'id' | 'isPurchased'>) => void;
    onUpdateItem: (listId: number, itemId: number, updates: Partial<ShoppingListItem>) => void;
    onDeleteItem: (listId: number, itemId: number) => void;
    onToggleItem: (listId: number, itemId: number) => void;
    onCompleteShopping: (listId: number, totalSpent: number, expenseCategory: string) => void;
}

// Sub-components
const ListFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (list: Omit<ShoppingList, 'id' | 'items'>) => void;
    list?: ShoppingList | null;
    categories: string[];
}> = ({ isOpen, onClose, onSave, list, categories }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(list?.name || '');
    const [category, setCategory] = useState(list?.category || categories[0] || '');
    const [frequency, setFrequency] = useState<Frequency>(list?.frequency || Frequency.None);
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, category, frequency });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b dark:border-gray-700">
                        <h2 className="font-bold text-lg">{list ? t('editShoppingList') : t('newShoppingList')}</h2>
                    </header>
                    <main className="p-4 space-y-4">
                        <div>
                            <label className="text-sm">{t('listName')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('listNamePlaceholder')} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="text-sm">{t('listCategory')}</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClasses}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm">{t('listFrequency')}</label>
                            <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className={inputClasses}>
                                <option value={Frequency.None}>{t('none')}</option>
                                <option value={Frequency.Weekly}>{t('weekly')}</option>
                                <option value={Frequency.Biweekly}>{t('biweekly')}</option>
                                <option value={Frequency.Monthly}>{t('monthly')}</option>
                            </select>
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

const CompleteShoppingModal: React.FC<{
    list: ShoppingList;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (listId: number, totalSpent: number, expenseCategory: string) => void;
    expenseCategories: string[];
}> = ({ list, isOpen, onClose, onConfirm, expenseCategories }) => {
    const { t, currencySettings } = useLanguage();
    const purchasedTotal = useMemo(() => list.items.filter(i => i.isPurchased).reduce((sum, i) => sum + i.estimatedPrice, 0), [list.items]);
    const [totalSpent, setTotalSpent] = useState(purchasedTotal.toFixed(2));
    const [expenseCategory, setExpenseCategory] = useState(expenseCategories.includes('Shopping') ? 'Shopping' : expenseCategories[0]);
    
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <header className="p-4 border-b dark:border-gray-700">
                    <h2 className="font-bold text-lg">{t('confirmTotalSpent')}</h2>
                </header>
                <main className="p-4 space-y-4">
                    <p>{t('shoppingFromList')}: <strong>{list.name}</strong></p>
                    <div>
                        <label className="text-sm">{t('totalSpent')}</label>
                        <input type="number" step="0.01" value={totalSpent} onChange={e => setTotalSpent(e.target.value)} className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600"/>
                    </div>
                     <div>
                        <label className="text-sm">{t('category')}</label>
                        <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600">
                           {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </main>
                <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 dark:bg-gray-600 font-bold py-2 px-4 rounded-full">{t('cancel')}</button>
                    <button onClick={() => onConfirm(list.id, parseFloat(totalSpent), expenseCategory)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-full">{t('logExpenseAndReset')}</button>
                </footer>
            </div>
        </div>
    )
};


// Main View Component
const HarvestHavenView: React.FC<HarvestHavenViewProps> = ({ shoppingLists, categories, expenseCategories, onAddList, onDeleteList, onUpdateList, onAddItem, onUpdateItem, onDeleteItem, onToggleItem, onCompleteShopping }) => {
    const { t, currencySettings } = useLanguage();
    const [activeListId, setActiveListId] = useState<number | null>(shoppingLists[0]?.id || null);
    const [isListFormOpen, setIsListFormOpen] = useState(false);
    const [editingList, setEditingList] = useState<ShoppingList | null>(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('1');
    const [newItemPrice, setNewItemPrice] = useState('');

    const activeList = useMemo(() => shoppingLists.find(l => l.id === activeListId), [shoppingLists, activeListId]);

    const handleAddList = (list: Omit<ShoppingList, 'id' | 'items'>) => {
        onAddList(list);
    };

    const handleDeleteList = (listId: number) => {
        if(window.confirm(t('confirmListDelete'))){
            onDeleteList(listId);
            if(activeListId === listId) setActiveListId(shoppingLists[0]?.id || null);
        }
    };
    
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if(activeListId && newItemName) {
            onAddItem(activeListId, {
                name: newItemName,
                quantity: newItemQty,
                estimatedPrice: parseFloat(newItemPrice) || 0,
            });
            setNewItemName('');
            setNewItemQty('1');
            setNewItemPrice('');
        }
    };

    const { estimatedTotal, purchasedTotal } = useMemo(() => {
        if (!activeList) return { estimatedTotal: 0, purchasedTotal: 0 };
        const total = activeList.items.reduce((sum, i) => sum + i.estimatedPrice, 0);
        const purchased = activeList.items.filter(i => i.isPurchased).reduce((sum, i) => sum + i.estimatedPrice, 0);
        return { estimatedTotal: total, purchasedTotal: purchased };
    }, [activeList]);
    
    const sortedLists = useMemo(() => [...shoppingLists].sort((a,b) => a.name.localeCompare(b.name)), [shoppingLists]);

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 h-full">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {sortedLists.map(list => (
                            <button key={list.id} onClick={() => setActiveListId(list.id)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${activeListId === list.id ? 'bg-lime-600 text-white shadow' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-lime-100 dark:hover:bg-lime-900/50'}`}>
                                {list.name}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setEditingList(null); setIsListFormOpen(true); }} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 mt-3 sm:mt-0 flex-shrink-0">
                        <i className="fas fa-plus"></i> {t('newShoppingList')}
                    </button>
                </div>

                {activeList ? (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">{activeList.name}</h3>
                            <div>
                                <button onClick={() => { setEditingList(activeList); setIsListFormOpen(true); }} className="text-gray-500 hover:text-blue-500 px-2"><i className="fas fa-edit"></i></button>
                                <button onClick={() => handleDeleteList(activeList.id)} className="text-gray-500 hover:text-red-500 px-2"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={t('itemNamePlaceholder')} className="flex-grow p-2 border rounded bg-transparent" required/>
                            <input type="text" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} placeholder={t('quantityPlaceholder')} className="w-24 p-2 border rounded bg-transparent"/>
                            <input type="number" step="0.01" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder={t('estimatedPrice')} className="w-28 p-2 border rounded bg-transparent"/>
                            <button type="submit" className="bg-lime-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-lime-700">{t('add')}</button>
                        </form>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {activeList.items.map(item => (
                                <div key={item.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <input type="checkbox" checked={item.isPurchased} onChange={() => onToggleItem(activeList.id, item.id)} className="w-5 h-5 mr-3 rounded text-lime-600 focus:ring-lime-500"/>
                                    <div className="flex-grow">
                                        <p className={`font-semibold ${item.isPurchased ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity}</p>
                                    </div>
                                    <span className={`font-mono ${item.isPurchased ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>{formatCurrency(item.estimatedPrice, currencySettings)}</span>
                                    <button onClick={() => onDeleteItem(activeList.id, item.id)} className="ml-3 text-red-500/50 hover:text-red-500"><i className="fas fa-times"></i></button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t-2 border-dashed dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('purchased')}</p>
                                <p className="font-bold text-lg text-lime-600">{formatCurrency(purchasedTotal, currencySettings)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('estimatedTotal')}</p>
                                <p className="font-bold text-lg text-gray-700 dark:text-gray-200">{formatCurrency(estimatedTotal, currencySettings)}</p>
                            </div>
                             <button onClick={() => setIsCompleteModalOpen(true)} className="bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 flex items-center gap-2">
                                <i className="fas fa-check"></i> {t('completeShopping')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <i className="fas fa-shopping-basket text-6xl text-gray-300 dark:text-gray-600"></i>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noShoppingLists')}</p>
                    </div>
                )}
            </div>

            <ListFormModal isOpen={isListFormOpen} onClose={() => setIsListFormOpen(false)} onSave={handleAddList} list={editingList} categories={categories} />
            {activeList && <CompleteShoppingModal list={activeList} isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} onConfirm={onCompleteShopping} expenseCategories={expenseCategories} />}
        </div>
    );
};

export default HarvestHavenView;