import React from 'react';

const MoodSlider = ({ label, leftLabel, rightLabel, value, onChange, icon }) => {
    return (
        <div className="mood-slider-container mb-8">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    {icon && <span className="text-2xl">{icon}</span>}
                    {label}
                </h3>
                <span className="text-sm text-gray-400">
                    {value === 50 ? 'Neutral' : value < 50 ? leftLabel : rightLabel}
                </span>
            </div>

            <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{leftLabel}</span>
                    <span>{rightLabel}</span>
                </div>

                <div className="relative h-2 bg-gray-700 rounded-full">
                    {/* Track gradient */}
                    <div
                        className="absolute h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${value}%`,
                            background: `linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)`
                        }}
                    />

                    {/* Slider thumb */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer z-10"
                    />

                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 pointer-events-none"
                        style={{ left: `calc(${value}% - 12px)` }}
                    >
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoodSlider;
