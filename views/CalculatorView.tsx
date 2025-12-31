import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureType } from '../types';
import ViewContainer from '../components/ViewContainer';

interface MoreViewProps {
    onSelectFeature: (feature: FeatureType, origin?: { x: number, y: number }) => void;
}

const FeatureCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    onClick: (e: React.MouseEvent) => void;
    color: string;
}> = ({ icon, title, description, onClick, color }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative text-left w-full p-6 bg-slate-100 dark:bg-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-t-4 ${color}`}
        >
            <div className="flex items-start gap-4">
                 <div className={`text-3xl p-4 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-').replace('dark:border-', 'dark:bg-')} ${color.replace('border-', 'text-').replace('dark:border-', 'dark:text-')}`}>
                    <i className={icon}></i>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                </div>
            </div>
             <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-500 transition-colors">
                <i className="fas fa-arrow-right"></i>
            </div>
        </button>
    );
};

const MoreView: React.FC<MoreViewProps> = ({ onSelectFeature }) => {
    const { t } = useLanguage();

    // Reordered as per user request for simplified interaction.
    const features = [
        {
            type: FeatureType.Settings,
            icon: 'fas fa-user-cog',
            title: t('about'),
            description: t('aboutDescription'),
            color: 'border-gray-500'
        },
        {
            type: FeatureType.ActivityLog,
            icon: 'fas fa-book-open',
            title: t('activityLog'),
            description: t('activityLogDescription'),
            color: 'border-cyan-500'
        },
        {
            type: FeatureType.Scheduled,
            icon: 'fas fa-calendar-alt',
            title: t('scheduled'),
            description: t('scheduledDescription'),
            color: 'border-orange-500'
        },
        {
            type: FeatureType.Savings,
            icon: 'fas fa-piggy-bank',
            title: t('savings'),
            description: t('savingsDescription'),
            color: 'border-green-500'
        },
        {
            type: FeatureType.Loans,
            icon: 'fas fa-hand-holding-usd',
            title: t('loans'),
            description: t('loansDescription'),
            color: 'border-yellow-500'
        },
        {
            type: FeatureType.Investments,
            icon: 'fas fa-chart-line',
            title: t('investments'),
            description: t('investmentsDescription'),
            color: 'border-blue-500'
        },
        {
            type: FeatureType.Calculator,
            icon: 'fas fa-calculator',
            title: t('calculator'),
            description: t('calculatorDescription'),
            color: 'border-slate-500'
        },
        {
            type: FeatureType.Converter,
            icon: 'fas fa-exchange-alt',
            title: t('converter'),
            description: t('converterDescription'),
            color: 'border-blue-500'
        },
        {
            type: FeatureType.Nutrition,
            icon: 'fas fa-heartbeat',
            title: t('nutrition'),
            description: t('nutritionDescription'),
            color: 'border-pink-500'
        },
        {
            type: FeatureType.Calendar,
            icon: 'fas fa-calendar-day',
            title: t('calendar'),
            description: t('calendarDescription'),
            color: 'border-purple-500'
        },
        {
            type: FeatureType.Subscriptions,
            icon: 'fas fa-sync-alt',
            title: t('subscriptions'),
            description: t('subscriptionsDescription'),
            color: 'border-indigo-500'
        },
        {
            type: FeatureType.Reports,
            icon: 'fas fa-file-invoice-dollar',
            title: t('reports'),
            description: t('reportsDescription'),
            color: 'border-teal-500'
        },
    ];

    return (
        <ViewContainer title={t('more')} icon="fas fa-layer-group">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(feature => (
                    <FeatureCard
                        key={feature.type}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        color={feature.color}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onSelectFeature(feature.type, {
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2
                            });
                        }}
                    />
                ))}
            </div>
        </ViewContainer>
    );
};

export default MoreView;