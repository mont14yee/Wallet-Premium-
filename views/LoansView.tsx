import React, { useState, useMemo } from 'react';
import { Loan, LoanType, Repayment, InterestType, RepaymentSchedule } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';

interface LoansViewProps {
    loans: Loan[];
    addLoan: (loan: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => void;
    deleteLoan: (id: number) => void;
    addRepayment: (loanId: number, repayment: Omit<Repayment, 'id'>) => void;
}

const LoanForm: React.FC<{ onSave: LoansViewProps['addLoan']; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const { t, currencySettings } = useLanguage();
    const [type, setType] = useState<LoanType>(LoanType.Lent);
    const [person, setPerson] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [interestRate, setInterestRate] = useState('0');
    const [interestType, setInterestType] = useState<InterestType>(InterestType.Simple);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule>(RepaymentSchedule.OneTime);
    const [notes, setNotes] = useState('');

    const calculateEMI = () => {
        const p = parseFloat(totalAmount);
        const annualRate = parseFloat(interestRate) / 100;
        const start = new Date(date);
        const end = new Date(dueDate);

        // Basic validation: must be a monthly repayment schedule with a valid amount, dates, and term.
        if (repaymentSchedule !== RepaymentSchedule.Monthly || isNaN(p) || p <= 0 || !date || !dueDate || end <= start) {
            return 0;
        }

        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (months <= 0) {
            return 0;
        }

        // If interest rate is not a valid positive number, calculate as a zero-interest loan.
        if (isNaN(annualRate) || annualRate <= 0) {
            return p / months;
        }

        if (interestType === InterestType.Simple) {
            // Simple Interest: Total Repayable = Principal + (Principal * Rate * Years)
            // Monthly payment is Total Repayable / number of months.
            const years = months / 12;
            const totalInterest = p * annualRate * years;
            return (p + totalInterest) / months;
        }
        
        // Default to Compound Interest (standard EMI formula)
        const monthlyRate = annualRate / 12;
        const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        return emi;
    };

    const emi = useMemo(calculateEMI, [totalAmount, interestRate, date, dueDate, interestType, repaymentSchedule]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            type,
            person,
            totalAmount: parseFloat(totalAmount),
            interestRate: parseFloat(interestRate),
            interestType,
            date,
            dueDate,
            repaymentSchedule,
            notes,
        });
    };

    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 shadow-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-400 mb-4 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i> {t('addNewLoan')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('loanType')}</label>
                        <div className="flex gap-4 p-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <button type="button" onClick={() => setType(LoanType.Lent)} className={`flex-1 py-1 rounded-full text-sm font-semibold ${type === LoanType.Lent ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 shadow' : ''}`}>{t('lent')}</button>
                            <button type="button" onClick={() => setType(LoanType.Borrowed)} className={`flex-1 py-1 rounded-full text-sm font-semibold ${type === LoanType.Borrowed ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 shadow' : ''}`}>{t('borrowed')}</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{type === LoanType.Lent ? t('borrowerName') : t('lenderName')}</label>
                        <input type="text" value={person} onChange={e => setPerson(e.target.value)} placeholder={t('personNamePlaceholder')} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('totalAmount')} ({currencySettings.symbol})</label>
                        <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('interestRate')} (%)</label>
                        <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="e.g., 5" className={inputClasses} />
                    </div>
                    {parseFloat(interestRate) > 0 && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('interestType')}</label>
                            <select value={interestType} onChange={e => setInterestType(e.target.value as InterestType)} className={inputClasses}>
                                <option value={InterestType.Simple}>{t('simpleInterest')}</option>
                                <option value={InterestType.Compound}>{t('compoundInterest')}</option>
                            </select>
                        </div>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('loanDate')}</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dueDate')}</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('repaymentSchedule')}</label>
                        <select value={repaymentSchedule} onChange={e => setRepaymentSchedule(e.target.value as RepaymentSchedule)} className={inputClasses}>
                            <option value={RepaymentSchedule.OneTime}>{t('oneTime')}</option>
                            <option value={RepaymentSchedule.Monthly}>{t('monthly')}</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t('notesPlaceholder')} className={inputClasses}></textarea>
                    </div>
                </div>

                {type === LoanType.Borrowed && emi > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-center">
                        <p className="text-sm text-blue-800 dark:text-blue-300">{t('estimatedMonthlyPayment')}</p>
                        <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(emi, currencySettings)}</p>
                    </div>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500">{t('cancel')}</button>
                    <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700">{t('saveLoan')}</button>
                </div>
            </form>
        </div>
    );
};

const AddRepaymentForm: React.FC<{ loanId: number; onAddRepayment: LoansViewProps['addRepayment']; }> = ({ loanId, onAddRepayment }) => {
    const { t, currencySettings } = useLanguage();
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount) {
            onAddRepayment(loanId, { amount: parseFloat(amount), date });
            setAmount('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-end gap-3">
            <div className="flex-grow">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('repaymentAmount')}</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`0.00 ${currencySettings.symbol}`} className="w-full text-sm p-1 border-b bg-transparent border-gray-300 dark:border-gray-500 focus:outline-none focus:border-slate-500" required/>
            </div>
             <div className="flex-grow">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{t('repaymentDate')}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm p-1 border-b bg-transparent border-gray-300 dark:border-gray-500 focus:outline-none focus:border-slate-500" required/>
            </div>
            <button type="submit" className="bg-slate-500 text-white font-bold py-1.5 px-3 text-sm rounded-full hover:bg-slate-600"><i className="fas fa-plus"></i></button>
        </form>
    );
};

const LoanCard: React.FC<{ loan: Loan; onDelete: (id: number) => void; onAddRepayment: LoansViewProps['addRepayment']; isExpanded: boolean; onToggleExpand: () => void; }> = ({ loan, onDelete, onAddRepayment, isExpanded, onToggleExpand }) => {
    const { t, currencySettings } = useLanguage();
    const isLent = loan.type === LoanType.Lent;
    const isOverdue = new Date(loan.dueDate) < new Date() && loan.outstandingAmount > 0;
    const progress = loan.totalAmount > 0 ? ((loan.totalAmount - loan.outstandingAmount) / loan.totalAmount) * 100 : 0;
    
    const handleDelete = () => {
        if (window.confirm(t('loanDeleteConfirm'))) {
            onDelete(loan.id);
        }
    };

    return (
         <div className={`p-4 rounded-lg shadow-sm transition-all duration-300 ${isLent ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                     <div className="flex items-center gap-3 mb-2">
                        <i className={`fas ${isLent ? 'fa-arrow-up' : 'fa-arrow-down'} fa-lg p-3 rounded-full ${isLent ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'}`}></i>
                        <div>
                             <h3 className="font-bold text-gray-800 dark:text-gray-200">{loan.person}</h3>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{t('dueDate')}: {loan.dueDate} {isOverdue && <span className="text-red-500 font-semibold ml-2">({t('overdue')})</span>}</p>
                        </div>
                    </div>
                    
                    <div className="mt-3">
                         <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div className={`h-2 rounded-full ${isLent ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-600 dark:text-gray-400">
                             <span>{t('paid')}: {formatCurrency(loan.totalAmount - loan.outstandingAmount, currencySettings)}</span>
                             <span>{t('outstanding')}: {formatCurrency(loan.outstandingAmount, currencySettings)}</span>
                        </div>
                    </div>
                </div>
                 <div className="flex-shrink-0 flex flex-col items-end gap-2">
                     <span className={`text-xl font-bold ${isLent ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{formatCurrency(loan.totalAmount, currencySettings)}</span>
                     <div className="flex gap-2">
                        <button onClick={onToggleExpand} className="text-sm text-blue-600 dark:text-blue-400 hover:underline"><i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i></button>
                        <button onClick={handleDelete} className="text-sm text-red-500 dark:text-red-400 hover:underline"><i className="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 animate-fadeIn text-sm">
                    <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                        <p><strong>{t('interest')}:</strong> {loan.interestRate}% {loan.interestRate > 0 ? `(${t(loan.interestType)})` : ''}</p>
                        <p><strong>{t('schedule')}:</strong> {t(loan.repaymentSchedule)}</p>
                        <p><strong>{t('loanDate')}:</strong> {loan.date}</p>
                        {loan.notes && <p className="col-span-2"><strong>{t('notes')}:</strong> {loan.notes}</p>}
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">{t('repaymentHistory')}</h4>
                        {loan.repayments.length > 0 ? (
                            <ul className="space-y-1 max-h-32 overflow-y-auto">
                                {loan.repayments.map(rp => (
                                    <li key={rp.id} className="flex justify-between text-xs p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded">
                                        <span>{rp.date}</span>
                                        <span className="font-semibold">{formatCurrency(rp.amount, currencySettings)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-center text-gray-500 py-2">{t('noRepayments')}</p>
                        )}
                         <AddRepaymentForm loanId={loan.id} onAddRepayment={onAddRepayment} />
                    </div>
                </div>
            )}
         </div>
    );
};

const LoansView: React.FC<LoansViewProps> = ({ loans, addLoan, deleteLoan, addRepayment }) => {
    const { t, currencySettings } = useLanguage();
    const [activeTab, setActiveTab] = useState<LoanType>(LoanType.Lent);
    const [showForm, setShowForm] = useState(false);
    const [expandedLoanId, setExpandedLoanId] = useState<number | null>(null);

    const { lentLoans, borrowedLoans, totalLent, totalBorrowed } = useMemo(() => {
        const lent = loans.filter(l => l.type === LoanType.Lent);
        const borrowed = loans.filter(l => l.type === LoanType.Borrowed);
        return {
            lentLoans: lent,
            borrowedLoans: borrowed,
            totalLent: lent.reduce((sum, l) => sum + l.outstandingAmount, 0),
            totalBorrowed: borrowed.reduce((sum, l) => sum + l.outstandingAmount, 0),
        };
    }, [loans]);
    
    const displayedLoans = activeTab === LoanType.Lent ? lentLoans : borrowedLoans;

    const handleAddLoan = (loanData: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        addLoan(loanData);
        setShowForm(false);
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-400 flex items-center gap-3">
                    <i className="fas fa-hand-holding-usd"></i>
                    {t('loans')}
                </h2>
                <div className="mt-3 sm:mt-0">
                    <button onClick={() => setShowForm(!showForm)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i> {t('newLoan')}
                    </button>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                     <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">{t('assets')} ({t('lent')})</h3>
                     <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalLent, currencySettings)}</p>
                 </div>
                 <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                     <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">{t('liabilities')} ({t('borrowed')})</h3>
                     <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(totalBorrowed, currencySettings)}</p>
                 </div>
             </div>

            {showForm && <LoanForm onSave={handleAddLoan} onCancel={() => setShowForm(false)} />}
            
            <div className="mb-4">
                <div className="flex border-b border-gray-200 dark:border-gray-600">
                    <button onClick={() => setActiveTab(LoanType.Lent)} className={`py-2 px-4 font-semibold transition-colors ${activeTab === LoanType.Lent ? 'border-b-2 border-slate-500 text-slate-600 dark:text-slate-300' : 'text-gray-500 dark:text-gray-400'}`}>{t('lent')}</button>
                    <button onClick={() => setActiveTab(LoanType.Borrowed)} className={`py-2 px-4 font-semibold transition-colors ${activeTab === LoanType.Borrowed ? 'border-b-2 border-slate-500 text-slate-600 dark:text-slate-300' : 'text-gray-500 dark:text-gray-400'}`}>{t('borrowed')}</button>
                </div>
            </div>

            <div className="space-y-4">
                {displayedLoans.length > 0 ? (
                    displayedLoans.map(loan => (
                        <LoanCard 
                            key={loan.id} 
                            loan={loan} 
                            onDelete={deleteLoan} 
                            onAddRepayment={addRepayment}
                            isExpanded={expandedLoanId === loan.id}
                            onToggleExpand={() => setExpandedLoanId(expandedLoanId === loan.id ? null : loan.id)}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        {activeTab === LoanType.Lent ? t('noLentLoans') : t('noBorrowedLoans')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoansView;