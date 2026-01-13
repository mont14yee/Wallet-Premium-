import React, { useState, useEffect } from 'react';
import { Transaction, MealPlan } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

interface NutritionViewProps {
    shoppingList: Transaction[];
}

interface PantryItem {
    id: number;
    name: string;
    category: 'proteins' | 'veg' | 'grains' | 'fruits' | 'dairy' | 'misc';
}

const PANTRY_CATEGORIES = [
    { id: 'proteins', icon: 'fas fa-drumstick-bite', color: 'bg-rose-500', labelKey: 'categoryProteins' },
    { id: 'veg', icon: 'fas fa-carrot', color: 'bg-emerald-500', labelKey: 'categoryVeg' },
    { id: 'grains', icon: 'fas fa-wheat-awn', color: 'bg-amber-600', labelKey: 'categoryGrains' },
    { id: 'fruits', icon: 'fas fa-apple-whole', color: 'bg-orange-500', labelKey: 'categoryFruits' },
    { id: 'dairy', icon: 'fas fa-cheese', color: 'bg-blue-500', labelKey: 'categoryDairy' },
    { id: 'misc', icon: 'fas fa-pepper-hot', color: 'bg-purple-500', labelKey: 'categoryMisc' },
];

const NutritionView: React.FC<NutritionViewProps> = ({ shoppingList }) => {
    const { t } = useLanguage();
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    
    // Pantry State
    const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
        const saved = localStorage.getItem('nutrition-pantry');
        return saved ? JSON.parse(saved) : [];
    });
    const [newItemName, setNewItemName] = useState('');
    const [activeCategory, setActiveCategory] = useState<PantryItem['category']>('proteins');

    useEffect(() => {
        localStorage.setItem('nutrition-pantry', JSON.stringify(pantryItems));
    }, [pantryItems]);

    const handleAddIngredient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        const item: PantryItem = {
            id: Date.now(),
            name: newItemName.trim(),
            category: activeCategory
        };
        setPantryItems(prev => [item, ...prev]);
        setNewItemName('');
    };

    const removeIngredient = (id: number) => {
        setPantryItems(prev => prev.filter(i => i.id !== id));
    };

    const clearPantry = () => {
        if (window.confirm(t('clearPantry') + '?')) {
            setPantryItems([]);
        }
    };

    const generatePromptText = () => {
        const ingredientsString = pantryItems.map(i => `${i.name} (${i.category})`).join(', ');
        return `I have the following ingredients in my pantry: ${ingredientsString}. 
        
You are a world-class nutritionist. Create a balanced, high-fidelity 1-day meal plan (Breakfast, Lunch, Dinner, and 1 Snack) using these ingredients primarily. You may assume common pantry staples are available (oil, salt, basic spices, water).

For each meal, please provide:
- A creative recipe name.
- A list of ingredients needed (clearly stating amounts).
- Clear, professional preparation instructions.
- Estimated calorie count.

Please format the response nicely.`;
    };

    const handleOpenGeminiWeb = () => {
        const promptText = generatePromptText();
        navigator.clipboard.writeText(promptText).then(() => {
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 3000);
            window.open('https://gemini.google.com/app', '_blank');
        });
    };

    const handleGenerateMealPlan = async () => {
        setIsLoading(true);
        setError(null);
        setMealPlan(null);

        if (pantryItems.length === 0) {
            setError(t('mealPlanErrorEmptyList'));
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = generatePromptText() + "\n\nPlease return the response in JSON format according to a specific schema including mealPlan array and totalCalories.";

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            mealPlan: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        mealType: { type: Type.STRING },
                                        recipeName: { type: Type.STRING },
                                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        instructions: { type: Type.STRING },
                                        calories: { type: Type.NUMBER }
                                    }
                                }
                            },
                            totalCalories: { type: Type.NUMBER }
                        }
                    }
                }
            });

            const parsedPlan = JSON.parse(response.text) as MealPlan;
            setMealPlan(parsedPlan);

        } catch (e) {
            console.error("Error generating meal plan:", e);
            setError(t('mealPlanErrorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 min-h-full transition-colors duration-300">
            {showCopiedToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-fadeIn flex items-center gap-3">
                    <i className="fas fa-check-circle"></i>
                    {t('promptCopied')}
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-10">
                
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 text-white shadow-xl mb-4">
                        <i className="fas fa-utensils fa-2x"></i>
                    </div>
                    <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
                        {t('healthAndNutritionGoal')}
                    </h2>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                        {t('mealPlannerDescription')}
                    </p>
                </div>

                {/* Pantry Management Section */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                                    <i className="fas fa-boxes-stacked text-indigo-500"></i>
                                    {t('pantryManager')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('pantryDescription')}</p>
                            </div>
                            {pantryItems.length > 0 && (
                                <button onClick={clearPantry} className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2">
                                    <i className="fas fa-trash-can"></i> {t('clearPantry')}
                                </button>
                            )}
                        </div>

                        {/* Add Ingredient Form */}
                        <form onSubmit={handleAddIngredient} className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {PANTRY_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCategory(cat.id as any)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 gap-2 border-2
                                            ${activeCategory === cat.id 
                                                ? `${cat.color} border-transparent text-white shadow-lg scale-105` 
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <i className={`${cat.icon} text-lg`}></i>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-center">{t(cat.labelKey as any)}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    placeholder="Enter ingredient (e.g. Salmon, Spinach...)"
                                    className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold transition-all shadow-sm"
                                />
                                <button type="submit" className="bg-indigo-600 text-white font-black uppercase tracking-widest px-8 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm">
                                    {t('add')}
                                </button>
                            </div>
                        </form>

                        {/* Ingredient List */}
                        <div className="mt-8">
                            <div className="flex flex-wrap gap-2">
                                {pantryItems.length > 0 ? pantryItems.map(item => {
                                    const catConfig = PANTRY_CATEGORIES.find(c => c.id === item.category);
                                    return (
                                        <div key={item.id} className={`${catConfig?.color} text-white px-4 py-2 rounded-xl flex items-center gap-3 animate-fadeIn shadow-md group`}>
                                            <i className={`${catConfig?.icon} text-xs opacity-70`}></i>
                                            <span className="text-sm font-bold">{item.name}</span>
                                            <button onClick={() => removeIngredient(item.id)} className="hover:text-black transition-colors">
                                                <i className="fas fa-times-circle"></i>
                                            </button>
                                        </div>
                                    );
                                }) : (
                                    <div className="w-full text-center py-10 opacity-30">
                                        <i className="fas fa-basket-shopping text-6xl mb-4 block"></i>
                                        <p className="font-bold uppercase tracking-[0.2em]">{t('noItemsFound')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={handleGenerateMealPlan}
                                disabled={isLoading || pantryItems.length === 0}
                                className="relative group overflow-hidden w-full sm:w-80 py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <i className="fas fa-circle-notch fa-spin"></i>
                                            <span>{t('generating')}...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-wand-magic-sparkles"></i>
                                            <span>{t('generateMealPlan')}</span>
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            </button>

                            {/* External Backup Option */}
                            <button 
                                onClick={handleOpenGeminiWeb}
                                disabled={pantryItems.length === 0}
                                className="w-full sm:w-80 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale group"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <i className="fab fa-google text-lg group-hover:rotate-12 transition-transform"></i>
                                    <span>{t('openGeminiWeb')}</span>
                                </div>
                            </button>
                        </div>
                        {pantryItems.length > 0 && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-4 font-bold uppercase tracking-widest">
                                {t('geminiWebHint')}
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-6 rounded-3xl text-center flex flex-col items-center gap-4">
                        <p className="font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{error}</p>
                        <button 
                            onClick={handleOpenGeminiWeb}
                            className="text-xs font-black text-indigo-500 hover:text-indigo-600 uppercase underline tracking-widest"
                        >
                            Try Official Gemini Website Instead
                        </button>
                    </div>
                )}

                {/* Meal Plan Results */}
                {mealPlan && (
                    <div className="space-y-8 animate-fadeIn pb-20">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {mealPlan.mealPlan.map((meal, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <i className="fas fa-plate-wheat fa-6x"></i>
                                    </div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                {meal.mealType}
                                            </span>
                                            <span className="text-rose-500 font-black text-sm">
                                                {meal.calories} {t('calories')}
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-2xl font-black text-gray-800 dark:text-white mb-6 leading-tight">
                                            {meal.recipeName}
                                        </h4>

                                        <div className="space-y-6">
                                            <div>
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{t('ingredients')}</h5>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {meal.ingredients.map((ing, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                            {ing}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            <div>
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{t('instructions')}</h5>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                                    {meal.instructions}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.5em] mb-4 opacity-80">{t('totalDailyCalories')}</h3>
                            <div className="text-6xl font-black tracking-tighter">
                                {mealPlan.totalCalories.toLocaleString()} <span className="text-2xl opacity-60 uppercase">{t('calories')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionView;