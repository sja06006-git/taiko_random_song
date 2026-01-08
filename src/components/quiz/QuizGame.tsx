import { useState, useEffect, useMemo } from 'react';
import { type Difficulty, type DaniData, getDaniCourses, songs as allSongs } from '../../utils/songData';

export type QuizMode = 
  | 'title'       // 힌트 -> 제목
  | 'combo'       // 제목 -> 콤보
  | 'bpm'         // 제목 -> BPM
  | 'level'       // 제목 + 난이도 -> 레벨
  | 'dani_order'  // 단위 -> 3곡 순서
  | 'dani_year';  // 노래 -> 단위 + 연도

import { type QuizFilters } from './QuizSetup';

interface QuizGameProps {
  mode: QuizMode;
  filters: QuizFilters;
  onExit: () => void;
}

interface Question {
  questionText: React.ReactNode;
  hint?: React.ReactNode;
  options: string[]; // 버튼에 표시될 텍스트
  correctIndex: number;
  explanation?: string; // 정답 확인 후 표시됨
}

const QUESTIONS_PER_ROUND = 10;

export function QuizGame({ mode, filters, onExit }: QuizGameProps) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // 렌더링마다 재계산하는 것을 방지하기 위해 단위 데이터 메모이제이션
  const daniData = useMemo(() => {
    let data = getDaniCourses();
    // 단위 데이터 필터링
    if (filters.daniVersions.length > 0) {
        data = data.filter(d => filters.daniVersions.includes(d.version));
    }
    if (filters.daniDans.length > 0) {
        data = data.filter(d => filters.daniDans.includes(d.dan));
    }
    return data;
  }, [filters.daniVersions, filters.daniDans]);

  // 일반 모드를 위한 필터링된 노래
  // 요구사항에 따라 오니/우라만 허용됨
  const filteredStandardSongs = useMemo(() => {
      return allSongs.filter(song => {
            // 장르 필터
            if (filters.genres.length > 0) {
                if (!song.genre.some(g => filters.genres.includes(g))) return false;
            }
            
            // 레벨 필터 (범위 내에 오니/우라 코스가 적어도 하나 있어야 함)
            const oni = song.courses['oni'];
            const ura = song.courses['ura'];
            
            let hasValidCourse = false;
            if (oni && oni.level >= filters.levelRange.min && oni.level <= filters.levelRange.max) hasValidCourse = true;
            if (ura && ura.level >= filters.levelRange.min && ura.level <= filters.levelRange.max) hasValidCourse = true;

            return hasValidCourse;
      });
  }, [filters.genres, filters.levelRange]);


  const generateQuestion = (): Question => {
    switch (mode) {
      case 'title': return generateTitleQuiz();
      case 'combo': return generateComboQuiz();
      case 'bpm': return generateBpmQuiz();
      case 'level': return generateLevelQuiz();
      case 'dani_order': return generateDaniOrderQuiz(daniData);
      case 'dani_year': return generateDaniYearQuiz(daniData);
      default: return generateTitleQuiz();
    }
  };

  // --- 퀴즈 생성기 ---

  // 필터링된 목록에서 무작위 노래를 가져오는 도우미 함수
  const getFilteredRandomSongs = (count: number): any[] => {
      const candidates = [...filteredStandardSongs].sort(() => Math.random() - 0.5);
      // 노래가 충분하지 않은 경우 대비: 가진 것만 가져오거나 무작위로 채움 (하지만 필터 규칙을 위반함)
      // 이상적으로는 0곡일 때 경고해야 함. 현재는 0곡이면 충돌하거나 우아하게 처리.
      if (candidates.length === 0) return []; 
      return candidates.slice(0, count);
  };

  const generateTitleQuiz = (): Question => {
    const candidates = getFilteredRandomSongs(4);
    if (candidates.length === 0) return { questionText: "조건에 맞는 곡이 없습니다.", options: [], correctIndex: -1 };

    const correct = candidates[0];
    const options = candidates.sort(() => Math.random() - 0.5).map(s => s.title);
    
    // 섞인 옵션에서 정답 제목의 인덱스 찾기
    const correctIndex = options.indexOf(correct.title);

    // 힌트 생성 (장르, 아티스트 등)
    const hint = (
      <div className="flex flex-col gap-2 text-gray-200">
        <div><span className="text-gray-400">장르:</span> {correct.genre.join(', ')}</div>
        <div><span className="text-gray-400">아티스트:</span> {correct.artists.join(', ')}</div>
        {correct.bpm.min === correct.bpm.max ? (
          <div><span className="text-gray-400">BPM:</span> {correct.bpm.min}</div>
        ) : (
          <div><span className="text-gray-400">BPM:</span> {correct.bpm.min}-{correct.bpm.max}</div>
        )}
      </div>
    );

    return {
      questionText: "다음 곡의 제목은 무엇인가요?",
      hint,
      options,
      correctIndex,
      explanation: `${correct.title} by ${correct.artists[0]}`
    };
  };

  const generateComboQuiz = (): Question => {
    const pool = getFilteredRandomSongs(1);
    if (pool.length === 0) return { questionText: "조건에 맞는 곡이 없습니다.", options: [], correctIndex: -1 };
    const song = pool[0];

    // 오니 또는 우라 선택 (필터에서 이것들만 허용됨)
    const diffs: Difficulty[] = ['oni', 'ura'];
    const validDiffs = diffs.filter(d => {
        const c = song.courses[d];
        // 레벨 범위도 일치해야 함
        if (!c) return false;
        return c.level >= filters.levelRange.min && c.level <= filters.levelRange.max;
    });

    if (validDiffs.length === 0) return generateComboQuiz(); // 재시도 또는 실패

    const targetDiff = validDiffs[Math.floor(Math.random() * validDiffs.length)];
    const targetCourse = song.courses[targetDiff]!;

    const correctCombo = targetCourse.maxCombo;
    
    // Generate wrong options
    const wrongOptions = new Set<number>();
    while (wrongOptions.size < 3) {
        const offset = Math.floor(Math.random() * 100) - 50;
        const val = correctCombo + offset;
        if (val > 0 && val !== correctCombo) wrongOptions.add(val);
    }
    
    const optionsEnv = [correctCombo, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);
    const correctIndex = optionsEnv.indexOf(correctCombo);

    return {
      questionText: `"${song.title}" (${targetDiff.toUpperCase()})의 최대 콤보 수는?`,
      options: optionsEnv.map(String),
      correctIndex,
      explanation: `정답 콤보: ${correctCombo}`
    };
  };

  const generateBpmQuiz = (): Question => {
      const pool = getFilteredRandomSongs(1);
      if (pool.length === 0) return { questionText: "조건에 맞는 곡이 없습니다.", options: [], correctIndex: -1 };
      const song = pool[0];

      const displayCorrect = song.bpm.min === song.bpm.max ? `${song.bpm.min}` : `${song.bpm.min}-${song.bpm.max}`;

      const optionsArr = [displayCorrect];
      while (optionsArr.length < 4) {
          const base = song.bpm.max;
          const offset = Math.floor(Math.random() * 60) - 30;
          const val = base + offset;
          if (!optionsArr.includes(`${val}`)) optionsArr.push(`${val}`);
      }

      const shuffled = optionsArr.sort(() => Math.random() - 0.5);

      return {
          questionText: `"${song.title}"의 BPM은?`,
          options: shuffled,
          correctIndex: shuffled.indexOf(displayCorrect),
          explanation: `BPM: ${displayCorrect}`
      };
  };

  const generateLevelQuiz = (): Question => {
      const pool = getFilteredRandomSongs(1);
      if (pool.length === 0) return { questionText: "조건에 맞는 곡이 없습니다.", options: [], correctIndex: -1 };
      const song = pool[0];

      // 유효한 난이도 선택 (오니/우라 + 레벨 범위)
      const diffs: Difficulty[] = ['oni', 'ura'];
      const validDiffs = diffs.filter(d => {
          const c = song.courses[d];
          if (!c) return false;
          return c.level >= filters.levelRange.min && c.level <= filters.levelRange.max;
      });

      if (validDiffs.length === 0) return generateLevelQuiz();

      const targetDiff = validDiffs[Math.floor(Math.random() * validDiffs.length)];
      const correctLevel = song.courses[targetDiff]!.level;

      // 오답 옵션 생성
      const optionsNum = [correctLevel];
      while (optionsNum.length < 4) {
          const l = Math.floor(Math.random() * 10) + 1;
          if (!optionsNum.includes(l)) optionsNum.push(l);
      }
      
      const shuffledRandom = optionsNum.sort(() => Math.random() - 0.5);

      return {
          questionText: `"${song.title}" (${targetDiff.toUpperCase()})의 레벨은?`,
          options: shuffledRandom.map(l => `★ ${l}`),
          correctIndex: shuffledRandom.indexOf(correctLevel),
          explanation: `레벨: ★ ${correctLevel}`
      };
  };

  const generateDaniOrderQuiz = (daniList: DaniData[]): Question => {
      if (daniList.length < 4) return generateTitleQuiz(); // 대체
      
      const correctDani = daniList[Math.floor(Math.random() * daniList.length)];
      
      // 정답 순서 문자열
      const correctOrderStr = correctDani.songs.map(s => s.song.title).join(' → ');

      // 오답 옵션: 
      // 1. 같은 노래 섞기
      // 2. 다른 단위 코스
      const wrongOptions = new Set<string>();
      
      // 정답 노래의 섞인 버전 추가
      const shuffledSongs = [...correctDani.songs].sort(() => Math.random() - 0.5);
      const shuffledStr = shuffledSongs.map(s => s.song.title).join(' → ');
      if (shuffledStr !== correctOrderStr) wrongOptions.add(shuffledStr);

      // 다른 무작위 단위 코스 추가
      while (wrongOptions.size < 3) {
          const other = daniList[Math.floor(Math.random() * daniList.length)];
          if (other !== correctDani) {
              wrongOptions.add(other.songs.map(s => s.song.title).join(' → '));
          } else {
             // 같은 것을 다시 선택한 경우, 다르게 섞기
             const reshuffle = [...correctDani.songs].sort(() => Math.random() - 0.5);
             const sStr = reshuffle.map(s => s.song.title).join(' → ');
             if (sStr !== correctOrderStr) wrongOptions.add(sStr);
          }
      }
      
      const optionsArr = [correctOrderStr, ...Array.from(wrongOptions)].slice(0, 4).sort(() => Math.random() - 0.5);
      
      return {
          questionText: `[${correctDani.version} ${correctDani.dan}]에 수록된 곡들의 순서는?`,
          options: optionsArr,
          correctIndex: optionsArr.indexOf(correctOrderStr),
          explanation: `정답 순서: ${correctOrderStr}`
      };
  };

  const generateDaniYearQuiz = (daniList: DaniData[]): Question => {
      if (daniList.length === 0) return generateTitleQuiz();

      const correctDani = daniList[Math.floor(Math.random() * daniList.length)];
      const targetSong = correctDani.songs[Math.floor(Math.random() * correctDani.songs.length)];

      const correctAns = `${correctDani.version} ${correctDani.dan}`;

      // 오답 옵션
      const optionsArr = [correctAns];
      while (optionsArr.length < 4) {
          const other = daniList[Math.floor(Math.random() * daniList.length)];
          const s = `${other.version} ${other.dan}`;
          if (!optionsArr.includes(s)) optionsArr.push(s);
      }
      const shuffled = optionsArr.sort(() => Math.random() - 0.5);

      return {
          questionText: `"${targetSong.song.title}"은(는) 어느 단위도장에 수록되었나요?`,
          options: shuffled,
          correctIndex: shuffled.indexOf(correctAns),
          explanation: `정답: ${correctAns}`
      };
  };


  // --- 컴포넌트 로직 ---

  useEffect(() => {
    // 게임 시작
    startNewRound();
  }, [mode]);

  const startNewRound = () => {
    setRound(1);
    setScore(0);
    setIsGameOver(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    const q = generateQuestion();
    setCurrentQuestion(q);
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return; // 이미 답변함

    setSelectedOption(idx);
    const correct = idx === currentQuestion?.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 100);
    }

    // 지연 후 자동 다음으로 이동
    setTimeout(() => {
      if (round >= QUESTIONS_PER_ROUND) {
        setIsGameOver(true);
      } else {
        setRound(r => r + 1);
        nextQuestion();
      }
    }, 1500);
  };

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-3xl border border-zinc-700 w-full max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-4xl font-bold text-white mb-4">게임 종료!</h2>
        <div className="text-6xl font-black text-amber-500 mb-8">{score}</div>
        <div className="flex gap-4">
          <button 
            onClick={startNewRound}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-colors"
          >
            다시 하기
          </button>
          <button 
            onClick={onExit}
            className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white font-bold transition-colors"
          >
            메뉴로 나가기
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="text-white">로딩 중...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
     <div className="flex justify-between items-center mb-6 text-xl font-bold text-gray-400">
        <div>라운드 {round}/{QUESTIONS_PER_ROUND}</div>
        <div>점수: <span className="text-amber-500">{score}</span></div>
     </div>

     <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 shadow-xl mb-6 min-h-[200px] flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl text-white font-bold mb-4">{currentQuestion.questionText}</h3>
        {currentQuestion.hint}
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {currentQuestion.options.map((opt, idx) => {
         let btnClass = "p-4 rounded-xl text-lg font-bold transition-all duration-200 border-2 ";
         
         if (selectedOption === null) {
           btnClass += "bg-zinc-700 border-zinc-600 hover:bg-zinc-600 hover:border-zinc-500 text-gray-200";
         } else {
           if (idx === currentQuestion.correctIndex) {
              btnClass += "bg-green-600 border-green-500 text-white";
           } else if (idx === selectedOption) {
              btnClass += "bg-red-600 border-red-500 text-white";
           } else {
              btnClass += "bg-zinc-800 border-zinc-700 text-gray-500 opacity-50";
           }
         }

         return (
           <button
             key={idx}
             onClick={() => handleAnswer(idx)}
             disabled={selectedOption !== null}
             className={btnClass}
           >
             {opt}
           </button>
         );
       })}
     </div>

     {selectedOption !== null && (
        <div className={`mt-6 text-center text-xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? '정답!' : '오답!'}
            {!isCorrect && <div className="text-sm text-gray-400 mt-1">{currentQuestion.explanation}</div>}
        </div>
     )}
    </div>
  );
}
