
import React from 'react';

interface ViewContainerProps {
    title: string;
    icon: string;
    actionButton?: React.ReactNode;
    children: React.ReactNode;
}

const ViewContainer: React.FC<ViewContainerProps> = ({ title, icon, actionButton, children }) => {
    return (
        <div className="bg-black p-4 sm:p-6 mb-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b-2 border-gray-800">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <i className={icon}></i>
                    {title}
                </h2>
                {actionButton && <div className="mt-3 sm:mt-0">{actionButton}</div>}
            </div>
            {children}
        </div>
    );
};

export default ViewContainer;
