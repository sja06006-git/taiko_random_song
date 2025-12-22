import React from 'react';
import type { Song, Difficulty } from '../utils/songData';

interface SongCardProps {
    song: Song;
    difficulty: Difficulty;
}

export const SongCard: React.FC<SongCardProps> = ({ song, difficulty }) => {
    const [isChartOpen, setIsChartOpen] = React.useState(false);
    const course = song.courses[difficulty];

    if (!course) return null;

    const difficultyColors = {
        easy: 'border-red-400',
        normal: 'border-green-500',
        hard: 'border-blue-500',
        oni: 'border-pink-500',
        ura: 'border-purple-500 bg-purple-50'
    };

    const isUra = difficulty === 'ura';

    return (
        <div className={`
            bg-white text-black rounded-2xl p-8 max-w-sm mx-auto my-8 relative overflow-hidden border-4 animate-pop-in shadow-2xl w-full md:p-6 md:my-6
            ${difficultyColors[difficulty]}
            ${isUra ? 'bg-purple-50' : 'bg-white'}
        `}>
            <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-black text-gray-700">
                    ★ {course.level}
                </div>
                <div className="bg-zinc-800 text-white px-2 py-1 rounded text-sm font-bold">
                    {difficulty.toUpperCase()}
                </div>
            </div>

            <h2 className="text-3xl font-bold leading-tight mb-2 text-zinc-900 break-keep" title={song.title}>
                {song.title}
            </h2>

            {song.titleKo && song.title !== song.titleKo && (
                <div className="text-sm text-gray-500 mb-4">{song.titleKo}</div>
            )}

            <div className="flex flex-col gap-1 text-sm text-gray-600 mb-6">
                <span className="bg-gray-200 self-start px-2 py-1 rounded text-xs">
                    {song.genre.join(', ')}
                </span>
                <span className="font-medium">
                    {song.artists.join(', ')}
                </span>
            </div>

            {course.images && course.images.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <button
                        className="w-full text-left text-lg font-bold text-gray-800 flex justify-between items-center py-2 hover:bg-black/5 rounded px-2 -mx-2 transition-colors"
                        onClick={() => setIsChartOpen(!isChartOpen)}
                    >
                        보면 확인 {isChartOpen ? '▲' : '▼'}
                    </button>

                    {isChartOpen && (
                        <div className="mt-2 overflow-hidden animate-slide-down">
                            <a href={course.images[0]} target="_blank" rel="noopener noreferrer" title="Click to open image in new tab" className="block cursor-pointer group">
                                <img
                                    src={course.images[0]}
                                    alt={song.title}
                                    loading="lazy"
                                    className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105"
                                />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
