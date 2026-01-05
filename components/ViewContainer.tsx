import React from 'react';

interface ViewContainerProps {
    title?: string;
    icon?: string;
    actionButton?: React.ReactNode;
    leftAction?: React.ReactNode;
    children: React.ReactNode;
}

const ViewContainer: React.FC<ViewContainerProps> = ({ title, icon, actionButton, leftAction, children }) => {
    const hasHeader = (title && title.trim().length > 0) || (icon && icon.trim().length > 0) || actionButton || leftAction;

    return (
        <div className="bg-black p-4 sm:p-6 mb-6 animate-fadeIn">
            {hasHeader && (
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-800 gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {leftAction}
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3 truncate">
                            {icon && <i className={icon}></i>}
                            {title && <span className="truncate">{title}</span>}
                        </h2>
                    </div>
                    {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default ViewContainer;