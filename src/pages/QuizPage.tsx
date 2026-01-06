import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuizGame, type QuizMode } from '../components/quiz/QuizGame';
import { QuizSetup, type QuizFilters } from '../components/quiz/QuizSetup';

export function QuizPage() {
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null);
  const [filters, setFilters] = useState<QuizFilters | null>(null);
  const [inSetup, setInSetup] = useState(false);

  const handleModeSelect = (mode: QuizMode) => {
      setSelectedMode(mode);
      setInSetup(true);
  };

  const handleSetupStart = (selectedFilters: QuizFilters) => {
      setFilters(selectedFilters);
      setInSetup(false);
  };

  const handleExit = () => {
      setSelectedMode(null);
      setFilters(null);
      setInSetup(false);
  };

  const menu = (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-center min-h-screen box-border flex flex-col items-center">
      <header className="mb-12">
        <h1 className="text-5xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
          Taiko Quiz
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          지식을 테스트해보세요!
        </p>
        <Link to="/" className="text-gray-500 hover:text-white underline underline-offset-4">
          홈으로 돌아가기
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl px-4">
        <MenuButton 
            title="제목 맞추기" 
            desc="장르, 아티스트 힌트 제공" 
            emoji="🎵"
            onClick={() => handleModeSelect('title')} 
        />
        <MenuButton 
            title="최대 콤보 수 맞추기" 
            desc="노트 수를 맞춰보세요" 
            emoji="💯"
            onClick={() => handleModeSelect('combo')} 
        />
        <MenuButton 
            title="BPM 맞추기" 
            desc="곡의 빠르기를 맞춰보세요" 
            emoji="⚡"
            onClick={() => handleModeSelect('bpm')} 
        />
        <MenuButton 
            title="레벨 맞추기" 
            desc="난이도 별 개수 맞추기" 
            emoji="aa"
            onClick={() => handleModeSelect('level')} 
        />
        <MenuButton 
            title="단위도장 곡 순서" 
            desc="3곡의 순서를 맞춰보세요" 
            emoji="📜"
            onClick={() => handleModeSelect('dani_order')} 
        />
        <MenuButton 
            title="단위도장 수록 시기" 
            desc="어느 단위에 수록되었을까요?" 
            emoji="🗓️"
            onClick={() => handleModeSelect('dani_year')} 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {selectedMode ? (
        <div className="animate-fade-in pt-8">
             <div className="text-left px-8 mb-4">
                <button 
                  onClick={handleExit}
                  className="text-gray-500 hover:text-white flex items-center gap-2"
                >
                  ← 메뉴로 돌아가기
                </button>
             </div>
             {inSetup ? (
                 <QuizSetup 
                    mode={selectedMode} 
                    onStart={handleSetupStart} 
                    onCancel={() => setSelectedMode(null)} 
                 />
             ) : (
                <QuizGame mode={selectedMode} filters={filters!} onExit={handleExit} />
             )}
        </div>
      ) : (
        menu
      )}
    </div>
  );
}

function MenuButton({ title, desc, emoji, onClick }: { title: string, desc: string, emoji: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="group relative p-6 bg-zinc-800 rounded-2xl border border-zinc-700 hover:border-purple-500 hover:scale-[1.02] transition-all duration-300 text-left overflow-hidden"
        >
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10">
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
             </div>
        </button>
    )
}
