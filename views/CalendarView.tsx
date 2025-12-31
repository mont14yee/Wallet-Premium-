import React, { useState, useMemo } from 'react';
import { ScheduledTransaction, Loan, Subscription, TransactionType, LoanType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';

interface CalendarViewProps {
    scheduled: ScheduledTransaction[];
    loans: Loan[];
    subscriptions: Subscription[];
}

type CalendarEvent = {
    type: 'scheduled-income' | 'scheduled-expense' | 'loan-lent' | 'loan-borrowed' | 'subscription';
    name: string;
    amount: number;
    date: string;
};

const EventItem: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const { t, currencySettings } = useLanguage();
    
    const details = useMemo(() => {
        switch (event.type) {
            case 'scheduled-income':
                return { icon: 'fas fa-arrow-down', color: 'text-green-500', label: t('income') };
            case 'scheduled-expense':
                return { icon: 'fas fa-arrow-up', color: 'text-red-500', label: t('expense') };
            case 'loan-lent':
            case 'loan-borrowed':
                 return { icon: 'fas fa-hand-holding-usd', color: 'text-yellow-500', label: t('loanDue') };
            case 'subscription':
                return { icon: 'fas fa-sync-alt', color: 'text-purple-500', label: t('subscriptionRenewal') };
            default:
                return { icon: 'fas fa-question-circle', color: 'text-gray-500', label: '' };
        }
    }, [event.type, t]);

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <i className={`${details.icon} ${details.color} fa-lg w-6 text-center`}></i>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{event.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{details.label}</p>
            </div>
            <span className={`font-bold ${details.color}`}>{formatCurrency(event.amount, currencySettings)}</span>
        </div>
    );
};


const CalendarView: React.FC<CalendarViewProps> = ({ scheduled, loans, subscriptions }) => {
    const { t, language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const eventsByDate = useMemo(() => {
        const events: Record<string, CalendarEvent[]> = {};

        const addEvent = (dateStr: string, event: CalendarEvent) => {
            const dateKey = new Date(dateStr).toISOString().split('T')[0];
            if (!events[dateKey]) {
                events[dateKey] = [];
            }
            events[dateKey].push(event);
        };
        
        scheduled.forEach(item => addEvent(item.nextDueDate, {
            type: item.type === TransactionType.Income ? 'scheduled-income' : 'scheduled-expense',
            name: item.name,
            amount: item.amount,
            date: item.nextDueDate,
        }));

        loans.forEach(item => addEvent(item.dueDate, {
            type: item.type === LoanType.Lent ? 'loan-lent' : 'loan-borrowed',
            name: item.person,
            amount: item.outstandingAmount,
            date: item.dueDate,
        }));
        
        subscriptions.forEach(item => addEvent(item.renewalDate, {
            type: 'subscription',
            name: item.name,
            amount: item.amount,
            date: item.renewalDate,
        }));

        return events;
    }, [scheduled, loans, subscriptions]);


    const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    }
    
    const monthFormatter = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' });
    const dayFormatter = new Intl.DateTimeFormat(language, { weekday: 'short' });

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        const dateKey = selectedDate.toISOString().split('T')[0];
        return eventsByDate[dateKey] || [];
    }, [selectedDate, eventsByDate]);

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 h-full flex flex-col lg:flex-row gap-6">
            <div className="flex-grow bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <header className="flex items-center justify-between mb-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month"><i className="fas fa-chevron-left"></i></button>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{monthFormatter.format(currentDate)}</h2>
                        <button onClick={goToToday} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t('today')}</button>
                    </div>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Next month"><i className="fas fa-chevron-right"></i></button>
                </header>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                    {[...Array(7)].map((_, i) => <div key={i}>{dayFormatter.format(new Date(2023, 0, i + 1))}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map(d => {
                        const dateKey = d.toISOString().split('T')[0];
                        const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                        const isToday = d.getTime() === today.getTime();
                        const isSelected = selectedDate && d.getTime() === selectedDate.getTime();
                        const hasEvents = eventsByDate[dateKey]?.length > 0;
                        
                        return (
                            <button key={dateKey} onClick={() => setSelectedDate(d)} className={`relative h-12 rounded-lg transition-colors text-sm ${isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'} ${isSelected ? 'bg-blue-600 text-white' : (isToday ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700')}`}>
                                <span>{d.getDate()}</span>
                                {hasEvents && <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="lg:w-96 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
                    {selectedDate ? new Intl.DateTimeFormat(language, { dateStyle: 'full' }).format(selectedDate) : 'Select a date'}
                </h3>
                <div className="space-y-3 h-96 overflow-y-auto pr-2">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map((event, index) => <EventItem key={index} event={event} />)
                    ) : (
                        <div className="text-center pt-16">
                            <i className="fas fa-calendar-check text-5xl text-gray-300 dark:text-gray-600"></i>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noEventsForThisDay')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
