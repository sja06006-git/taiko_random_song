import { useState, useMemo, useEffect } from 'react';
import { getAllGenres, getDaniCourses, getAvailableDaniVersions, getAvailableDans } from '../../utils/songData';
import type { QuizMode } from './QuizGame';

interface QuizSetupProps {
  mode: QuizMode;
  onStart: (filters: QuizFilters) => void;
  onCancel: () => void;
}

export interface QuizFilters {
  // Standard
  genres: string[];
  levelRange: { min: number; max: number };
  
  // Dani
  daniVersion: string | null;
  daniDans: string[];
}

export function QuizSetup({ mode, onStart, onCancel }: QuizSetupProps) {
  const isDani = mode === 'dani_order' || mode === 'dani_year';
  const allGenres = useMemo(() => getAllGenres(), []);
  
  // Dani Data
  const daniList = useMemo(() => getDaniCourses(), []);
  const daniVersions = useMemo(() => getAvailableDaniVersions(daniList), [daniList]);
  
  // Form State
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [levelMin, setLevelMin] = useState(1);
  const [levelMax, setLevelMax] = useState(10);
  
  const [selectedDaniVersion, setSelectedDaniVersion] = useState<string | null>(null);
  const [availableDans, setAvailableDans] = useState<string[]>([]);
  const [selectedDans, setSelectedDans] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDaniVersion) {
        setAvailableDans(getAvailableDans(daniList, selectedDaniVersion));
        setSelectedDans([]); // Reset dans when version changes
    } else {
        setAvailableDans([]);
    }
  }, [selectedDaniVersion, daniList]);

  const handleStart = () => {
    onStart({
      genres: selectedGenres,
      levelRange: { min: levelMin, max: levelMax },
      daniVersion: selectedDaniVersion,
      daniDans: selectedDans
    });
  };

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleDan = (d: string) => {
    setSelectedDans(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const selectAllDans = () => {
    if (selectedDans.length === availableDans.length) setSelectedDans([]);
    else setSelectedDans([...availableDans]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-800 rounded-3xl border border-zinc-700 shadow-2xl animate-fade-in relative">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">퀴즈 설정</h2>
      
      {!isDani && (
        <div className="space-y-8">
            {/* Difficulty Information */}
            <div className="bg-zinc-700/50 p-4 rounded-xl text-center border border-zinc-600">
                <span className="text-gray-300 font-bold">⚠️ 난이도는 <span className="text-pink-500">오니(Oni)</span>와 <span className="text-purple-500">우라(Ura)</span>로 고정됩니다.</span>
            </div>

            {/* Level Range */}
            <div>
                <h3 className="text-xl text-gray-200 font-bold mb-4">레벨 범위 설정</h3>
                <div className="flex items-center gap-4 justify-center bg-zinc-900 p-6 rounded-xl border border-zinc-700">
                    <select 
                        value={levelMin} 
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setLevelMin(v);
                            if (v > levelMax) setLevelMax(v);
                        }}
                        className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-600 text-xl font-bold outline-none focus:border-purple-500"
                    >
                        {Array.from({length: 10}, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>★ {n}</option>
                        ))}
                    </select>
                    <span className="text-gray-400 font-bold text-xl">~</span>
                    <select 
                        value={levelMax} 
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setLevelMax(v);
                            if (v < levelMin) setLevelMin(v);
                        }}
                        className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-600 text-xl font-bold outline-none focus:border-purple-500"
                    >
                        {Array.from({length: 10}, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>★ {n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Genre Selection */}
            <div>
                <h3 className="text-xl text-gray-200 font-bold mb-4">장르 선택 (선택 안 하면 전체)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allGenres.map(g => (
                        <button
                            key={g}
                            onClick={() => toggleGenre(g)}
                            className={`p-3 rounded-xl font-bold text-sm transition-all border
                                ${selectedGenres.includes(g) 
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg scale-105' 
                                    : 'bg-zinc-700 border-zinc-600 text-gray-400 hover:bg-zinc-600'}`
                            }
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {isDani && (
        <div className="space-y-8">
            {/* Version Selection */}
            <div>
                <h3 className="text-xl text-gray-200 font-bold mb-4">버전 선택</h3>
                <div className="grid grid-cols-3 gap-3">
                    {daniVersions.map(v => (
                        <button
                            key={v}
                            onClick={() => setSelectedDaniVersion(v)}
                            className={`p-3 rounded-xl font-bold text-lg transition-all border
                                ${selectedDaniVersion === v 
                                    ? 'bg-green-600 border-green-500 text-white shadow-lg ring-2 ring-green-400/30' 
                                    : 'bg-zinc-700 border-zinc-600 text-gray-400 hover:bg-zinc-600'}`
                            }
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dan Selection - Only if version selected */}
            {selectedDaniVersion && (
                <div className="animate-slide-down">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl text-gray-200 font-bold">단위 선택</h3>
                        <button 
                            onClick={selectAllDans}
                            className="text-sm text-purple-400 hover:text-purple-300 underline"
                        >
                            {selectedDans.length === availableDans.length ? '전체 해제' : '전체 선택'}
                        </button>
                     </div>
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {availableDans.map(d => (
                            <button
                                key={d}
                                onClick={() => toggleDan(d)}
                                className={`p-2 rounded-lg font-bold text-sm transition-all border
                                    ${selectedDans.includes(d) 
                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                        : 'bg-zinc-700 border-zinc-600 text-gray-400 hover:bg-zinc-600'}`
                                }
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

      <div className="flex gap-4 mt-10">
        <button 
            onClick={onCancel}
            className="flex-1 py-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition-colors"
        >
            취소
        </button>
        <button 
            onClick={handleStart}
            disabled={isDani && (!selectedDaniVersion || selectedDans.length === 0)}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            퀴즈 시작!
        </button>
      </div>
    </div>
  );
}
