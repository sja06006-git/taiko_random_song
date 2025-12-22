import React from 'react';
import type { Difficulty, FilterCriteria } from '../utils/songData';
import { getAllGenres } from '../utils/songData';

interface FilterPanelProps {
    filters: FilterCriteria;
    onFilterChange: (newFilters: FilterCriteria) => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'oni', 'ura'];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
    const allGenres = getAllGenres();
    const [isLevelOpen, setIsLevelOpen] = React.useState(true); // Default open to show selection

    const handleGenreChange = (genre: string) => {
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre];
        onFilterChange({ ...filters, genres: newGenres });
    };

    const handleDifficultyChange = (diff: Difficulty) => {
        let newDifficulties: Difficulty[] = [];
        const current = filters.difficulties || [];

        if (['oni', 'ura'].includes(diff)) {
            // Check if we are currently in "Oni/Ura mode" (only oni or ura selected)
            const isMultiMode = current.every(d => ['oni', 'ura'].includes(d));

            if (isMultiMode) {
                if (current.includes(diff)) {
                    // Toggle off, but prevent empty if desired (optional, currently allowing empty)
                    newDifficulties = current.filter(d => d !== diff);
                } else {
                    // Add
                    newDifficulties = [...current, diff];
                }
            } else {
                // Switch from other mode to this
                newDifficulties = [diff];
            }
        } else {
            // Strict single select for others
            newDifficulties = [diff];
        }

        onFilterChange({ ...filters, difficulties: newDifficulties });
    };

    const handleLevelToggle = (level: number) => {
        const currentLevels = filters.levels || [];
        const newLevels = currentLevels.includes(level)
            ? currentLevels.filter(l => l !== level)
            : [...currentLevels, level].sort((a, b) => a - b);

        onFilterChange({ ...filters, levels: newLevels });
    };

    return (
        <div className="bg-zinc-800 p-6 rounded-xl mb-8 shadow-lg text-center md:p-4">
            <div className="mb-6 border-b border-zinc-700 pb-2">
                <h3 className="text-lg text-gray-200 mb-3 font-semibold">난이도</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {DIFFICULTIES.map(diff => (
                        <button
                            key={diff}
                            className={`px-4 py-2 rounded-full font-bold text-white transition-all duration-200
                                ${(filters.difficulties || []).includes(diff)
                                    ? 'opacity-100 transform scale-105 ring-2 ring-white/30'
                                    : 'opacity-60 hover:opacity-80'}
                                ${diff === 'easy' ? 'bg-red-400' : ''}
                                ${diff === 'normal' ? 'bg-green-500' : ''}
                                ${diff === 'hard' ? 'bg-blue-500' : ''}
                                ${diff === 'oni' ? 'bg-pink-500' : ''}
                                ${diff === 'ura' ? 'bg-purple-500' : ''}
                            `}
                            onClick={() => handleDifficultyChange(diff)}
                        >
                            {diff.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6 border-b border-zinc-700 pb-2">
                <button
                    onClick={() => setIsLevelOpen(!isLevelOpen)}
                    className="w-full flex items-center justify-between text-lg text-gray-200 mb-3 font-semibold focus:outline-none"
                >
                    <span>레벨 ({filters.levels.length > 0 ? filters.levels.join(', ') : '선택 안함'})</span>
                    <span className="text-sm text-gray-400">{isLevelOpen ? '▲' : '▼'}</span>
                </button>

                {isLevelOpen && (
                    <div className="grid grid-cols-5 gap-2 justify-items-center mb-4 animate-slide-down">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                            <label
                                key={num}
                                className={`
                                    flex items-center justify-center cursor-pointer w-full py-2 rounded-lg font-bold text-sm transition-colors border
                                    ${filters.levels.includes(num)
                                        ? 'bg-zinc-600 border-zinc-500 text-white shadow-inner'
                                        : 'bg-zinc-800 border-zinc-700 text-gray-500 hover:bg-zinc-700'}
                                `}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.levels.includes(num)}
                                    onChange={() => handleLevelToggle(num)}
                                />
                                {num}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-lg text-gray-200 mb-3 font-semibold">장르</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
                    {allGenres.map(genre => (
                        <label
                            key={genre}
                            className={`flex items-center justify-center cursor-pointer p-2 rounded-lg transition-colors select-none text-sm w-full font-bold
                                ${filters.genres.includes(genre) ? 'bg-zinc-600 text-white' : 'bg-zinc-700/50 text-gray-200 hover:bg-zinc-700 hover:text-white'}
                            `}
                        >
                            <input
                                type="checkbox"
                                className="mr-2 w-4 h-4 accent-red-500"
                                checked={filters.genres.includes(genre)}
                                onChange={() => handleGenreChange(genre)}
                            />
                            {genre}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};
