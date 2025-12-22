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

    const handleGenreChange = (genre: string) => {
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre];
        onFilterChange({ ...filters, genres: newGenres });
    };

    const handleDifficultyChange = (difficulty: Difficulty) => {
        onFilterChange({ ...filters, difficulty });
    };

    const handleLevelChange = (type: 'min' | 'max', value: string) => {
        const numVal = parseInt(value) || 1;
        onFilterChange({
            ...filters,
            [type === 'min' ? 'levelMin' : 'levelMax']: numVal
        });
    };

    return (
        <div className="bg-zinc-800 p-6 rounded-xl mb-8 shadow-lg text-left md:p-4">
            <div className="mb-6 border-b border-zinc-700 pb-2">
                <h3 className="text-lg text-gray-200 mb-3 font-semibold">Difficulty</h3>
                <div className="flex flex-wrap gap-2 justify-start md:justify-center">
                    {DIFFICULTIES.map(diff => (
                        <button
                            key={diff}
                            className={`px-4 py-2 rounded-full font-bold text-white transition-all duration-200 
                                ${filters.difficulty === diff
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
                <h3 className="text-lg text-gray-200 mb-3 font-semibold">Level Range</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        max="10"
                        className="p-2 bg-zinc-700 border border-zinc-600 rounded text-white text-center w-20 md:w-full md:text-base"
                        value={filters.levelMin ?? 1}
                        onChange={(e) => handleLevelChange('min', e.target.value)}
                    />
                    <span className="text-gray-400">~</span>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        className="p-2 bg-zinc-700 border border-zinc-600 rounded text-white text-center w-20 md:w-full md:text-base"
                        value={filters.levelMax ?? 10}
                        onChange={(e) => handleLevelChange('max', e.target.value)}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg text-gray-200 mb-3 font-semibold">Genres</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {allGenres.map(genre => (
                        <label
                            key={genre}
                            className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors select-none text-sm
                                ${filters.genres.includes(genre) ? 'bg-zinc-700' : 'hover:bg-zinc-700/50'}
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
