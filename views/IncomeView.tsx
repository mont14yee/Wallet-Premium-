
import React from 'react';
import TransactionView from '../components/TransactionView';
import { Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface IncomeViewProps {
    items: Transaction[];
    allItems: Transaction[];
    total: number;
    addIncome: (item: Omit<Transaction, 'id'>) => void;
    deleteIncome: (id: number) => void;
    categoryFilter: string | null;
    onClearFilter: () => void;
    categories: string[];
    addCategory: (category: string) => void;
    theme: 'light' | 'dark';
}

const IncomeView: React.FC<IncomeViewProps> = ({ items, allItems, total, addIncome, deleteIncome, categoryFilter, onClearFilter, categories, addCategory, theme }) => {
    const { t } = useLanguage();
    return (
        <TransactionView
            title={t('incomeManagement')}
            icon="fas fa-money-bill-wave"
            items={items}
            total={total}
            onAddItem={addIncome}
            onDeleteItem={deleteIncome}
            categories={categories}
            itemIcon="fas fa-money-bill-wave"
            itemColor="text-slate-500"
            formTitle={t('addNewIncome')}
            nameLabel={t('incomeSource')}
            namePlaceholder={t('incomeSourcePlaceholder')}
            totalLabel={t('totalIncome')}
            amountColor="text-slate-600"
            categoryFilter={categoryFilter}
            onClearFilter={onClearFilter}
            onAddCategory={addCategory}
            allItems={allItems}
            theme={theme}
            chartTitle={t('monthlyIncomeFlow')}
            chartDataKey="income"
            chartColor="#64748b"
        />
    );
};

export default IncomeView;