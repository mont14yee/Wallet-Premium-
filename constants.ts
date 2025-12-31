import { Transaction, SavingsGoal, CurrencySettings, Loan, Subscription, ScheduledTransaction, Investment } from './types';
import { Language } from './locales';

const today = new Date().toISOString().split('T')[0];

export const INITIAL_INCOME: Transaction[] = [];

export const INITIAL_EXPENSES: Transaction[] = [];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

export const INITIAL_LOANS: Loan[] = [];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export const INITIAL_SCHEDULED_TRANSACTIONS: ScheduledTransaction[] = [];

export const INITIAL_INVESTMENTS: Investment[] = [];


export const CATEGORIES = {
    am: {
        income: ['ደመወዝ', 'ቢዝነስ', 'ኢንቨስትመንት', 'የብድር ክፍያ', 'የኢንቨስትመንት ትርፍ', 'ሌላ'],
        expense: ['የቤት ክፍያዎች', 'ምግብ', 'ትራንስፖርት', 'መዝናኛ', 'ግዢዎች', 'ትምህርት', 'የጤና ክፍያ', 'የብድር ክፍያ', 'ሌላ'],
        shopping: ['አዳራሽ', 'የምግብ እቃዎች', 'ኤሌክትሮኒክስ', 'የቤት እቃዎች', 'መዋጮች', 'ሌላ'],
    },
    en: {
        income: ['Salary', 'Business', 'Investment', 'Loan Repayment', 'Investment Gains', 'Other'],
        expense: ['Bills', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Education', 'Health', 'Loan Payment', 'Other'],
        shopping: ['Groceries', 'Supplies', 'Electronics', 'Furniture', 'Donations', 'Other'],
    }
};

export const getIncomeCategories = (lang: Language): string[] => CATEGORIES[lang].income;
export const getExpenseCategories = (lang: Language): string[] => CATEGORIES[lang].expense;
export const getShoppingCategories = (lang: Language): string[] => CATEGORIES[lang].shopping;
export const getAllExpenseCategories = (lang: Language): string[] => [...new Set([...CATEGORIES[lang].expense, ...CATEGORIES[lang].shopping])];

export const formatCurrency = (amount: number, settings: CurrencySettings): string => {
    const { symbol, decimalPlaces, numberFormat, symbolPlacement } = settings;

    const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
        useGrouping: true,
    };

    let formattedAmount: string;

    if (numberFormat === 'dot-comma') {
        // e.g., German locale for 1.234,56
        formattedAmount = new Intl.NumberFormat('de-DE', options).format(amount);
    } else if (numberFormat === 'space-dot') {
        // No standard locale for this, so we format and replace.
        // Format with comma separator first
        const tempAmount = new Intl.NumberFormat('en-US', options).format(amount);
        // Then replace comma with space
        formattedAmount = tempAmount.replace(/,/g, ' ');
    } else { // 'comma-dot' is the default
        // e.g., US locale for 1,234.56
        formattedAmount = new Intl.NumberFormat('en-US', options).format(amount);
    }

    if (symbolPlacement === 'before') {
        return `${symbol} ${formattedAmount}`;
    } else {
        return `${formattedAmount} ${symbol}`;
    }
};