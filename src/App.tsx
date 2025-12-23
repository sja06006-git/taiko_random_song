import { useState, useMemo } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { SongCard } from './components/SongCard';
import { RandomPicker } from './components/RandomPicker';
import type { FilterCriteria } from './utils/songData';
import { filterSongs, pickRandomSong } from './utils/songData';

const INITIAL_FILTERS: FilterCriteria = {
  genres: [],
  difficulties: ['oni'],
  levels: [10],
  excludeNonNAC: true,
  excludeAsiaBanned: true,
  excludeKrBanned: true
};

function App() {
  const [filters, setFilters] = useState<FilterCriteria>(INITIAL_FILTERS);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [displayDifficulty, setDisplayDifficulty] = useState<any>('oni');

  // Derive filtered songs
  const filteredSongs = useMemo(() => {
    return filterSongs(filters);
  }, [filters]);

  const handlePick = () => {
    const song = pickRandomSong(filteredSongs);
    if (song) {
      // Determine which of the selected difficulties is valid for this song
      const validDifficulties = filters.difficulties.filter(diff => {
        const course = song.courses[diff];
        if (!course) return false;
        // Also check if this specific difficulty meets level requirements
        if (filters.levels.length > 0) {
          return filters.levels.includes(course.level);
        }
        return true;
      });

      // Randomly pick one valid difficulty to display
      if (validDifficulties.length > 0) {
        const randomDiff = validDifficulties[Math.floor(Math.random() * validDifficulties.length)];
        setDisplayDifficulty(randomDiff);
      }
    }
    setSelectedSong(song);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-4 text-center min-h-screen box-border">
      <header className="mb-8">
        <h1 className="text-4xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
          Taiko Random Song
        </h1>
      </header>

      <main>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="my-4 text-gray-400 text-sm">
          <p>{filteredSongs.length} songs found</p>
        </div>

        <RandomPicker
          onPick={handlePick}
          disabled={filteredSongs.length === 0}
        />

        {selectedSong && (
          <SongCard
            song={selectedSong}
            difficulty={displayDifficulty}
          />
        )}
      </main>
    </div>
  )
}

export default App
