import songDataRaw from '../data/songs.json';

export interface CourseInfo {
    level: number;
    isBranched: number;
    maxCombo: number;
    playTime: number;
    balloon: number[];
    rollTime: number[];
    maxDensity: number;
    daniUsed: number;
    dani: Array<{
        version: string;
        dan: string;
        order: number;
    }>;
    images: string[];
}

export interface SongCourses {
    easy: CourseInfo | null;
    normal: CourseInfo | null;
    hard: CourseInfo | null;
    oni: CourseInfo | null;
    ura: CourseInfo | null;
}

export interface Song {
    songNo: string;
    order: number;
    title: string;
    titleKo: string | null;
    aliasKo: string | null;
    titleEn: string | null;
    aliasEn: string | null;
    romaji: string | null;
    bpm: {
        min: number;
        max: number;
    };
    bpmShiver: number;
    version: string[];
    isAsiaBanned: number;
    isKrBanned: number;
    genre: string[];
    artists: string[];
    addedDate: number;
    courses: SongCourses;
    isDeleted: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'oni' | 'ura';

export interface FilterCriteria {
    genres: string[];
    difficulties: Difficulty[];
    levels: number[];
    excludeNonNAC: boolean;
    excludeAsiaBanned: boolean;
    excludeKrBanned: boolean;
}

// 원본 데이터를 Song 배열 인터페이스로 변환
export const songs: Song[] = songDataRaw as unknown as Song[];

/**
 * 노래 목록에서 중복되지 않은 모든 장르 가져오기
 */
export const getAllGenres = (): string[] => {
    const genreSet = new Set<string>();
    songs.forEach(song => {
        song.genre.forEach(g => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
};

/**
 * 기준에 따라 노래 필터링
 */
export const filterSongs = (criteria: FilterCriteria): Song[] => {
    return songs.filter(song => {
        // 1. 장르 필터 (선택된 경우)
        if (criteria.genres.length > 0) {
            const hasGenre = song.genre.some(g => criteria.genres.includes(g));
            if (!hasGenre) return false;
        }

        // 2. 난이도 존재 여부 및 레벨 필터 결합
        // 선택된 난이도 중 하나라도 존재하고 레벨 기준에 맞는지 확인
        const hasValidDifficulty = criteria.difficulties.some(diff => {
            const course = song.courses[diff];
            if (!course) return false;

            // 레벨 확인
            if (criteria.levels.length > 0) {
                if (!criteria.levels.includes(course.level)) return false;
            }

            return true;
        });

        if (!hasValidDifficulty) return false;

        // 3. 고급 필터 (제외 로직)
        if (criteria.excludeNonNAC && !song.version.includes('NAC')) return false;
        if (criteria.excludeAsiaBanned && song.isAsiaBanned === 1) return false;
        if (criteria.excludeKrBanned && song.isKrBanned === 1) return false;

        // 4. 삭제된 곡 필터
        if (song.isDeleted === 1) return false;

        return true;
    });
};

/**
 * 필터링된 목록에서 무작위 노래 선택
 */
export const pickRandomSong = (filteredSongs: Song[]): Song | null => {
    if (filteredSongs.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    return filteredSongs[randomIndex];
};

// --- 퀴즈 도우미 타입 및 함수 ---

export interface DaniData {
    version: string;
    dan: string;
    songs: Array<{
        song: Song;
        order: number;
        difficulty: Difficulty;
    }>;
}

/**
 * 모든 노래를 파싱하여 단위(Class) 코스 구조화된 목록 생성.
 * 버전 및 단위별 그룹화.
 */
export const getDaniCourses = (): DaniData[] => {
    const daniMap = new Map<string, DaniData>();

    songs.forEach(song => {
        // 모든 난이도를 순회하며 단위 정보 찾기
        (['easy', 'normal', 'hard', 'oni', 'ura'] as Difficulty[]).forEach(diff => {
            const course = song.courses[diff];
            if (course && course.daniUsed === 1 && course.dani && course.dani.length > 0) {
                course.dani.forEach(d => {
                    const key = `${d.version}-${d.dan}`;
                    if (!daniMap.has(key)) {
                        daniMap.set(key, {
                            version: d.version,
                            dan: d.dan,
                            songs: []
                        });
                    }
                    daniMap.get(key)!.songs.push({
                        song: song,
                        order: d.order,
                        difficulty: diff
                    });
                });
            }
        });
    });

    // 각 단위 내 노래를 순서대로 정렬
    const result: DaniData[] = [];
    daniMap.forEach(value => {
        value.songs.sort((a, b) => a.order - b.order);
        result.push(value);
    });

    return result;
};

const DANI_VERSION_ORDER = [
  'katsudon', 'sorairo', 'momoiro', 'kimidori', 'murasaki', 
  'white', 'red', 'yellow', 'blue', 'green'
];

export const getAvailableDaniVersions = (daniList: DaniData[]): string[] => {
    const versions = Array.from(new Set(daniList.map(d => d.version)));
    
    return versions.sort((a, b) => {
        const indexA = DANI_VERSION_ORDER.indexOf(a);
        const indexB = DANI_VERSION_ORDER.indexOf(b);

        // 1. 둘 다 명명된 버전인 경우 -> 정의된 순서대로 정렬
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        // 2. A만 명명된 경우 -> A 우선
        if (indexA !== -1) return -1;
        
        // 3. B만 명명된 경우 -> B 우선
        if (indexB !== -1) return 1;

        // 4. 둘 다 목록에 없는 경우 (대부분 "2020", "25" 등 숫자 문자열이거나 다른 이름)
        // 가능하면 숫자순으로, 그렇지 않으면 알파벳순으로 정렬
        const numA = parseInt(a);
        const numB = parseInt(b);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        return a.localeCompare(b);
    });
};

const DAN_ORDER = [
  'beginner', '10kyu', '9kyu', '8kyu', '7kyu', '6kyu', '5kyu', '4kyu', '3kyu', '2kyu', '1kyu',
  '1dan', '2dan', '3dan', '4dan', '5dan', '6dan', '7dan', '8dan', '9dan', '10dan',
  'kuroto', 'mejin', 'chojin', 'tatsujin'
];

const DAN_DISPLAY_MAP: Record<string, string> = {
  'beginner': '初級',
  '10kyu': '十級', '9kyu': '九級', '8kyu': '八級', '7kyu': '七級', '6kyu': '六級',
  '5kyu': '五級', '4kyu': '四級', '3kyu': '三級', '2kyu': '二級', '1kyu': '一級',
  '1dan': '初段', '2dan': '二段', '3dan': '三段', '4dan': '四段', '5dan': '五段',
  '6dan': '六段', '7dan': '七段', '8dan': '八段', '9dan': '九段', '10dan': '十段',
  'kuroto': '玄人', 'mejin': '名人', 'chojin': '超人', 'tatsujin': '達人'
};

export const getDanDisplayName = (dan: string): string => {
    return DAN_DISPLAY_MAP[dan] || dan;
};

const VERSION_DISPLAY_MAP: Record<string, string> = {
  'katsudon': 'KATSU-DON',
  'sorairo': 'ソライロ',
  'momoiro': 'モモイロ',
  'kimidori': 'キミドリ',
  'murasaki': 'ムラサキ',
  'white': 'ホワイト',
  'red': 'レッド',
  'yellow': 'イエロー',
  'blue': 'ブルー',
  'green': 'グリーン'
};

export const getVersionDisplayName = (version: string): string => {
    // 1. 엄격한 매핑 확인
    if (VERSION_DISPLAY_MAP[version]) return VERSION_DISPLAY_MAP[version];

    // 2. 숫자가 20 이상인지 확인 (니지이로)
    const num = parseInt(version);
    if (!isNaN(num) && num >= 20) {
        return `ニジイロ${version}`;
    }

    // 3. 대체값
    return version;
};

export const getAvailableDans = (daniList: DaniData[], versions?: string[]): string[] => {
    let targetList = daniList;
    if (versions && versions.length > 0) {
        targetList = daniList.filter(d => versions.includes(d.version));
    }
    
    const dans = Array.from(new Set(targetList.map(d => d.dan)));
    return dans.sort((a, b) => {
        const indexA = DAN_ORDER.indexOf(a);
        const indexB = DAN_ORDER.indexOf(b);
        
        // 둘 다 목록에 있는 경우, 인덱스순 정렬
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        
        // A만 목록에 있는 경우 -> A 우선
        if (indexA !== -1) return -1;
        // B만 목록에 있는 경우 -> B 우선
        if (indexB !== -1) return 1;
        
        // 둘 다 없으면 알파벳순
        return a.localeCompare(b);
    });
};

/**
 * 일반 퀴즈를 위한 무작위 노래 세트 가져오기
 */
export const getRandomSongs = (count: number): Song[] => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
