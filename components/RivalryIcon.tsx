import React from 'react';
import { Skull, Zap, Scale } from 'lucide-react';
import { RivalryType } from '../types';

interface RivalryIconProps {
  type: RivalryType;
  side: 'left' | 'right';
  className?: string;
}

export const RivalryIcon: React.FC<RivalryIconProps> = ({ type, side, className = '' }) => {
    if (!type) return null;

    const config = {
        nemesis: { 
            icon: Skull, 
            color: 'text-red-500', 
            bg: 'bg-white dark:bg-red-950', 
            border: 'border-red-200 dark:border-red-800', 
            label: 'Nemesis' 
        },
        ez: { 
            icon: Zap, 
            color: 'text-yellow-500', 
            bg: 'bg-white dark:bg-yellow-950', 
            border: 'border-yellow-200 dark:border-yellow-800', 
            label: 'EZ Win' 
        },
        rival: { 
            icon: Scale, 
            color: 'text-gray-500 dark:text-gray-300', 
            bg: 'bg-white dark:bg-gray-800', 
            border: 'border-gray-200 dark:border-gray-600', 
            label: 'Fierce Rival' 
        },
    };

    const { icon: Icon, color, bg, border, label } = config[type];
    const positionClass = side === 'left' ? '-top-1 -right-1' : '-top-1 -left-1';

    return (
        <div className={`absolute ${positionClass} w-5 h-5 rounded-full flex items-center justify-center ${bg} border ${border} shadow-sm z-20 group/icon ${className}`}>
            <Icon size={12} className={color} />
            {/* Tooltip */}
            <div className={`absolute bottom-full mb-2 ${side === 'left' ? 'left-0' : 'right-0'} w-max px-2 py-1 bg-gray-900 text-[10px] text-white rounded-md shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none z-30 font-medium`}>
                {label}
            </div>
        </div>
    );
};