
import React from 'react';
import TransactionView from '../components/TransactionView';
import { Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExpensesViewProps {
    items: Transaction[];
    allItems: Transaction[];
    total: number;
    addExpense: (item: Omit<Transaction, 'id'>) => void;
    deleteExpense: (id: number) => void;
    categoryFilter: string | null;
    onClearFilter: () => void;
    expenseCategories: string[];
    theme: 'light' | 'dark';
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ items, allItems, total, addExpense, deleteExpense, categoryFilter, onClearFilter, expenseCategories, theme }) => {
    const { t } = useLanguage();
    return (
        <TransactionView
            title={t('expenseManagement')}
            icon="fas fa-receipt"
            items={items}
            total={total}
            onAddItem={addExpense}
            onDeleteItem={deleteExpense}
            categories={expenseCategories}
            itemIcon="fas fa-receipt"
            itemColor="text-red-500"
            formTitle={t('addNewExpense')}
            nameLabel={t('expenseName')}
            namePlaceholder={t('expenseNamePlaceholder')}
            totalLabel={t('totalExpenses')}
            amountColor="text-red-500"
            categoryFilter={categoryFilter}
            onClearFilter={onClearFilter}
            allItems={allItems}
            theme={theme}
            chartTitle={t('monthlyExpenseFlow')}
            chartDataKey="expense"
            chartColor="#f44336"
        />
    );
};

export default ExpensesView;