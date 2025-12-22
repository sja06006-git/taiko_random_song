import React from 'react';

interface RandomPickerProps {
    onPick: () => void;
    disabled?: boolean;
}

export const RandomPicker: React.FC<RandomPickerProps> = ({ onPick, disabled }) => {
    return (
        <div className="my-8">
            <button
                className={`
                    bg-gradient-to-br from-red-500 to-pink-500 text-white border-none py-4 px-12 text-2xl font-black rounded-full cursor-pointer shadow-lg
                    transition-all duration-300 uppercase tracking-widest
                    hover:scale-105 hover:shadow-red-500/50 hover:translate-y-[-2px]
                    active:scale-95 active:translate-y-0
                    disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none
                `}
                onClick={onPick}
                disabled={disabled}
            >
                PICK RANDOM
            </button>
        </div>
    );
};
