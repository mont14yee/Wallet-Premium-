import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Initialize chat when component opens
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-3-flash-preview',
                    config: {
                        systemInstruction: `You are a helpful financial assistant for a budget management app called 'Wallet' (ዋሌት). Your goal is to answer user questions about personal finance, budgeting, saving, and how to use the app's features. Be friendly, clear, and concise. Do not ask for personal financial data. You can explain concepts like income, expenses, targets, and reports. Keep your answers relatively short and easy to understand.`,
                    },
                });
                setMessages([
                    {
                        id: Date.now(),
                        text: t('chatbotWelcome'),
                        sender: 'bot'
                    }
                ]);
            } catch (err) {
                console.error("Failed to initialize chatbot:", err);
                setError(t('chatbotErrorInit'));
            }
        } else {
            // Reset when closed
            setMessages([]);
            setInput('');
            setIsLoading(false);
            setError(null);
            chatRef.current = null;
        }
    }, [isOpen, t]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleOpenGeminiWeb = () => {
        const textToCopy = input.trim() || (messages.length > 1 ? messages[messages.length - 2].text : '');
        const promptText = `Wallet App Context: User has a financial question. 
Query: ${textToCopy || "Give me some budgeting tips."}`;
        
        navigator.clipboard.writeText(promptText).then(() => {
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 3000);
            window.open('https://gemini.google.com/app', '_blank');
        });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatRef.current.sendMessage({ message: input });
            const botMessage: Message = { id: Date.now() + 1, text: response.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("Gemini API error:", err);
            setError(t('chatbotErrorApi'));
            const errorMessage: Message = { id: Date.now() + 1, text: t('chatbotErrorApi'), sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 w-[90vw] max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-fadeIn overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
            {showCopiedToast && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce">
                    {t('chatbotCopied')}
                </div>
            )}
            
            <header className="flex items-center justify-between p-4 bg-slate-700 dark:bg-gray-900 text-white flex-shrink-0 shadow-lg relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-gray-800 flex items-center justify-center text-white shadow-inner">
                        <i className="fas fa-robot"></i>
                    </div>
                    <h2 id="chatbot-title" className="font-bold text-lg">{t('financialAssistant')}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleOpenGeminiWeb}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group relative"
                        title={t('chatbotOpenGemini')}
                    >
                        <i className="fab fa-google text-xs"></i>
                        <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                            {t('chatbotOpenGemini')}
                        </span>
                    </button>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center" aria-label="Close chat">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </header>
            
            <main className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/40">
                <div className="space-y-4 pb-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0 shadow-sm">
                                    <i className="fas fa-robot text-xs"></i>
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm border ${msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none border-indigo-500' 
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border-gray-100 dark:border-gray-700'}`}>
                                <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                                <i className="fas fa-robot text-xs"></i>
                            </div>
                            <div className="max-w-[80%] p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm">
                                <div className="flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-0"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-center space-y-3 animate-fadeIn">
                            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">{error}</p>
                            <button 
                                onClick={handleOpenGeminiWeb}
                                className="w-full py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-900 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                            >
                                <i className="fab fa-google"></i>
                                {t('chatbotOpenGemini')}
                            </button>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={t('typeYourMessage')}
                            className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm pr-12"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button 
                            type="button"
                            onClick={handleOpenGeminiWeb}
                            className={`absolute right-1 top-1 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all ${input.trim() ? 'opacity-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                            title="Ask Gemini Web"
                        >
                            <i className="fab fa-google-plus-g text-lg"></i>
                        </button>
                    </div>
                    <button 
                        type="submit" 
                        className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all transform active:scale-95" 
                        disabled={isLoading || !input.trim()} 
                        aria-label="Send message"
                    >
                        <i className="fas fa-paper-plane text-sm"></i>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbot;