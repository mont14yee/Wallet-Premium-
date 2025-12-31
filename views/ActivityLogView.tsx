import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Removed 'Shopping' from import as it is not a type.
import { AllTransaction, Transaction, TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../constants';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const MOOD_OPTIONS = ['😊', '🎉', '😥', '💡', '🛍️', '💼', '💪'];

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('ምግብ')) return 'fas fa-utensils';
    if (cat.includes('transport') || cat.includes('ትራንስፖርት')) return 'fas fa-car';
    if (cat.includes('shopping') || cat.includes('ግዢዎች')) return 'fas fa-shopping-bag';
    if (cat.includes('bills') || cat.includes('የቤት ክፍያዎች')) return 'fas fa-file-invoice';
    if (cat.includes('entertainment') || cat.includes('መዝናኛ')) return 'fas fa-film';
    if (cat.includes('health') || cat.includes('የጤና ክፍያ')) return 'fas fa-heartbeat';
    if (cat.includes('education') || cat.includes('ትምህርት')) return 'fas fa-book';
    if (cat.includes('salary') || cat.includes('ደመወዝ')) return 'fas fa-briefcase';
    if (cat.includes('business') || cat.includes('ቢዝነስ')) return 'fas fa-store';
    if (cat.includes('investment') || cat.includes('ኢንቨስትመንት')) return 'fas fa-chart-line';
    return 'fas fa-question-circle';
};

const TransactionFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: TransactionType, item: Omit<Transaction, 'id'>) => void;
    incomeCategories: string[];
    expenseCategories: string[];
    initialName: string;
}> = ({ isOpen, onClose, onSave, incomeCategories, expenseCategories, initialName }) => {
    const { t } = useLanguage();
    const [type, setType] = useState<TransactionType>(TransactionType.Expense);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [mood, setMood] = useState<string>('');
    
    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(type, {
            name,
            amount: parseFloat(amount),
            date,
            category,
            mood,
        });
        onClose();
    };

    const categories = type === TransactionType.Income ? incomeCategories : expenseCategories;
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="p-4 border-b dark:border-gray-700">
                    <h2 className="font-bold text-lg">{t('addActivity')}</h2>
                </header>
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    <div>
                        <div className="flex gap-4 p-1 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <button type="button" onClick={() => setType(TransactionType.Expense)} className={`flex-1 py-1 rounded-full text-sm font-semibold ${type === TransactionType.Expense ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 shadow' : ''}`}>{t('expense')}</button>
                            <button type="button" onClick={() => setType(TransactionType.Income)} className={`flex-1 py-1 rounded-full text-sm font-semibold ${type === TransactionType.Income ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 shadow' : ''}`}>{t('income')}</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm">{t('expenseName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm">{t('amount')}</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label className="text-sm">{t('date')}</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm">{t('category')}</label>
                        <input list="category-options" value={category} onChange={e => setCategory(e.target.value)} className={inputClasses} required />
                        <datalist id="category-options">{categories.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                    <div>
                        <label className="text-sm">{t('mood')}</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {MOOD_OPTIONS.map(m => (
                                <button key={m} type="button" onClick={() => setMood(m)} className={`text-2xl p-2 rounded-full transition-transform transform hover:scale-125 ${mood === m ? 'bg-blue-200 dark:bg-blue-800' : ''}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                </form>
                <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 font-bold py-2 px-4 rounded-full">{t('cancel')}</button>
                    <button type="submit" onClick={handleSubmit} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full">{t('save')}</button>
                </footer>
            </div>
        </div>
    );
};

const ActivityItem: React.FC<{ item: AllTransaction }> = ({ item }) => {
    const { t, currencySettings } = useLanguage();
    const isIncome = item.type === TransactionType.Income;
    const color = isIncome ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${isIncome ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-red-100 dark:bg-red-900/50 text-red-600'}`}>
                <i className={getCategoryIcon(item.category)}></i>
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    {item.name} {item.mood && <span className="ml-2">{item.mood}</span>}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} • {item.date}</p>
            </div>
            <div className={`text-lg font-bold ${color}`}>{formatCurrency(item.amount, currencySettings)}</div>
        </div>
    );
};

interface ActivityLogViewProps {
    transactions: AllTransaction[];
    addTransaction: (type: TransactionType, item: Omit<Transaction, 'id'>) => void;
    incomeCategories: string[];
    expenseCategories: string[];
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ transactions, addTransaction, incomeCategories, expenseCategories }) => {
    const { t, language } = useLanguage();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [quickAddInput, setQuickAddInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const handleQuickAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFormOpen(true);
    };

    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (permissionError) {
            const timer = setTimeout(() => setPermissionError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [permissionError]);

    const handleMicClick = async () => {
        if (!window.confirm(t('micPermissionRequest'))) {
            return;
        }
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setPermissionError("Speech recognition is not supported in this browser.");
                return;
            }
            if (isListening) {
                recognitionRef.current?.stop();
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = language === 'am' ? 'am-ET' : 'en-US';
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results).map((result: any) => result[0]).map(result => result.transcript).join('');
                setQuickAddInput(transcript);
            };
            recognition.start();
            recognitionRef.current = recognition;
        } catch (err) {
            console.error("Microphone permission denied:", err);
            setPermissionError("Microphone access was denied. Please enable it in your browser settings.");
        }
    };

    const handleCameraClick = async () => {
        if (!window.confirm(t('cameraPermissionRequest'))) {
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Camera permission denied:", err);
            setPermissionError("Camera access was denied. Please enable it in your browser settings.");
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    useEffect(() => {
        if (isCameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCameraOpen]);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
                {sortedTransactions.length > 0 ? (
                    sortedTransactions.map(tx => <ActivityItem key={`${tx.type}-${tx.id}`} item={tx} />)
                ) : (
                    <div className="text-center pt-20">
                        <i className="fas fa-feather-alt text-6xl text-gray-300 dark:text-gray-600"></i>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noActivities')}</p>
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleQuickAddSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={quickAddInput}
                        onChange={e => setQuickAddInput(e.target.value)}
                        placeholder={t('quickAddActivityPlaceholder')}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                    />
                    <button type="button" onClick={handleMicClick} className={`text-xl p-3 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-100 dark:bg-red-900/50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
                        <i className="fas fa-microphone"></i>
                    </button>
                    <button type="button" onClick={handleCameraClick} className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-xl p-3 rounded-full transition-colors" aria-label="Open camera">
                        <i className="fas fa-camera"></i>
                    </button>
                    <button type="submit" className="bg-slate-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors" aria-label={t('addActivity')}>
                        <i className="fas fa-plus"></i>
                    </button>
                </form>
            </div>
            <TransactionFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setQuickAddInput('');
                }}
                onSave={addTransaction}
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                initialName={quickAddInput}
            />
             {isCameraOpen && (
                <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-t-lg"></video>
                        <button onClick={closeCamera} className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors" aria-label="Close camera view">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            {permissionError && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[130] animate-fadeIn w-11/12 max-w-md" role="alert">
                  <span className="block sm:inline">{permissionError}</span>
                </div>
            )}
        </div>
    );
};

export default ActivityLogView;
