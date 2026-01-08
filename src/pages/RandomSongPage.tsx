import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FilterPanel } from '../components/FilterPanel';
import { SongCard } from '../components/SongCard';
import { RandomPicker } from '../components/RandomPicker';
import type { FilterCriteria } from '../utils/songData';
import { filterSongs, pickRandomSong } from '../utils/songData';

const INITIAL_FILTERS: FilterCriteria = {
  genres: [],
  difficulties: ['oni'],
  levels: [10],
  excludeNonNAC: true,
  excludeAsiaBanned: true,
  excludeKrBanned: true
};

export function RandomSongPage() {
  const [filters, setFilters] = useState<FilterCriteria>(INITIAL_FILTERS);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [displayDifficulty, setDisplayDifficulty] = useState<any>('oni');

  // 필터링된 노래 도출
  const filteredSongs = useMemo(() => {
    return filterSongs(filters);
  }, [filters]);

  const handlePick = () => {
    const song = pickRandomSong(filteredSongs);
    if (song) {
      // 선택된 난이도 중 이 노래에 유효한 난이도 결정
      const validDifficulties = filters.difficulties.filter(diff => {
        const course = song.courses[diff];
        if (!course) return false;
        // 이 특정 난이도가 레벨 요구사항을 충족하는지도 확인
        if (filters.levels.length > 0) {
          return filters.levels.includes(course.level);
        }
        return true;
      });

      // 표시할 유효한 난이도 중 하나를 무작위로 선택
      if (validDifficulties.length > 0) {
        const randomDiff = validDifficulties[Math.floor(Math.random() * validDifficulties.length)];
        setDisplayDifficulty(randomDiff);
      }
    }
    setSelectedSong(song);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-4 text-center min-h-screen box-border">
      <div className="text-left mb-4">
        <Link to="/" className="text-gray-500 hover:text-white flex items-center gap-2">
           ← 홈으로 돌아가기
        </Link>
      </div>
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
