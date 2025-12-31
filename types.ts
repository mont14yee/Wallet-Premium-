export enum ViewType {
    Dashboard = 'dashboard',
    Income = 'income',
    Expenses = 'expenses',
    More = 'more',
}

export enum FeatureType {
    ActivityLog = 'activityLog',
    Savings = 'savings',
    Investments = 'investments',
    Calculator = 'calculator',
    Converter = 'converter',
    Reports = 'reports',
    Nutrition = 'nutrition',
    Settings = 'settings',
    About = 'about',
    Loans = 'loans',
    Subscriptions = 'subscriptions',
    Scheduled = 'scheduled',
    Calendar = 'calendar',
}

export enum TransactionType {
    Income = 'income',
    Expense = 'expense',
    Shopping = 'shopping',
}

export type Category = string;

export interface Transaction {
    id: number;
    name: string;
    amount: number;
    date: string;
    category: Category;
    mood?: string;
}

export interface AllTransaction extends Transaction {
    type: TransactionType;
}

export enum CompoundingFrequency {
    Daily = 'daily',
    Monthly = 'monthly',
    Yearly = 'yearly',
}

export interface ExtraContribution {
    id: number;
    amount: number;
    date: string;
}

export interface SavingsGoal {
    id: number;
    name: string;
    targetAmount: number;
    deadline: string;
    startingBalance: number;
    monthlyContribution: number;
    interestRate: number; // APY as percentage
    compoundingFrequency: CompoundingFrequency;
    extraContributions: ExtraContribution[];
}


export interface Meal {
    mealType: string;
    recipeName: string;
    ingredients: string[];
    instructions: string;
    calories: number;
}

export interface MealPlan {
    mealPlan: Meal[];
    totalCalories: number;
}

// New Types for Loans Feature
export enum LoanType {
    Lent = 'lent',
    Borrowed = 'borrowed',
}

export enum InterestType {
    Simple = 'simple',
    Compound = 'compound',
}

export enum RepaymentSchedule {
    OneTime = 'one-time',
    Monthly = 'monthly',
}

export interface Repayment {
    id: number;
    amount: number;
    date: string;
}

export interface Loan {
    id: number;
    type: LoanType;
    person: string; // Borrower or Lender name
    totalAmount: number;
    outstandingAmount: number;
    interestRate: number; // Storing as percentage, e.g., 5 for 5%
    interestType: InterestType;
    date: string; // Date the loan was given/taken
    dueDate: string;
    repaymentSchedule: RepaymentSchedule;
    notes: string;
    repayments: Repayment[];
}

export interface Investment {
    id: number;
    name: string; // e.g., 'AAPL' or 'Vanguard S&P 500 ETF'
    type: 'Stock' | 'ETF' | 'Crypto' | 'Mutual Fund' | 'Other';
    quantity: number;
    purchasePrice: number; // Price per unit at purchase
    purchaseDate: string;
    currentPrice: number; // Current price per unit
    notes?: string;
}

// FIX: Added 'None' and 'Biweekly' to Frequency enum for HarvestHavenView.
export enum Frequency {
    None = 'none',
    Weekly = 'weekly',
    Biweekly = 'biweekly',
    Monthly = 'monthly',
    Yearly = 'yearly',
}

export interface ScheduledTransaction {
    id: number;
    name: string;
    amount: number;
    category: Category;
    type: TransactionType.Income | TransactionType.Expense;
    frequency: Frequency;
    startDate: string;
    endDate?: string;
    nextDueDate: string;
    notes?: string;
    variance?: number; // e.g. 15 for ±15%
}

export interface CurrencySettings {
    symbol: string;
    symbolPlacement: 'before' | 'after';
    numberFormat: 'comma-dot' | 'dot-comma' | 'space-dot';
    decimalPlaces: number;
}

export interface UserProfile {
    name: string;
    email: string;
    avatar?: string;
}

// New Types for Subscriptions Feature
export enum SubscriptionType {
    Expense = 'expense',
    Income = 'income',
}

export enum SubscriptionHealth {
    Good = 'good', // value-packed
    Review = 'review', // review-worthy
}

export interface Subscription {
    id: number;
    name: string;
    type: SubscriptionType;
    amount: number;
    frequency: Frequency;
    renewalDate: string;
    category: string;
    cancellationUrl?: string;
    isVariable?: boolean; // For income streams with variability
    health: SubscriptionHealth;
}
// FIX: Added ShoppingList and ShoppingListItem interfaces for HarvestHavenView.
export interface ShoppingListItem {
    id: number;
    name: string;
    quantity: string;
    estimatedPrice: number;
    isPurchased: boolean;
}

export interface ShoppingList {
    id: number;
    name: string;
    category: string;
    frequency: Frequency;
    items: ShoppingListItem[];
}