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

// Cast the raw data to the Song array interface
export const songs: Song[] = songDataRaw as unknown as Song[];

/**
 * Get all unique genres from the song list
 */
export const getAllGenres = (): string[] => {
    const genreSet = new Set<string>();
    songs.forEach(song => {
        song.genre.forEach(g => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
};

/**
 * Filter songs based on criteria
 */
export const filterSongs = (criteria: FilterCriteria): Song[] => {
    return songs.filter(song => {
        // 1. Genre Filter (if selected)
        if (criteria.genres.length > 0) {
            const hasGenre = song.genre.some(g => criteria.genres.includes(g));
            if (!hasGenre) return false;
        }

        // 2. Difficulty Existence & Level Filter Combined
        // Check if ANY of the selected difficulties exist AND match the level criteria
        const hasValidDifficulty = criteria.difficulties.some(diff => {
            const course = song.courses[diff];
            if (!course) return false;

            // Check level
            if (criteria.levels.length > 0) {
                if (!criteria.levels.includes(course.level)) return false;
            }

            return true;
        });

        if (!hasValidDifficulty) return false;

        // 3. Advanced Filters (Exclusion Logic)
        if (criteria.excludeNonNAC && !song.version.includes('NAC')) return false;
        if (criteria.excludeAsiaBanned && song.isAsiaBanned === 1) return false;
        if (criteria.excludeKrBanned && song.isKrBanned === 1) return false;

        // 4. Deleted Filter
        if (song.isDeleted === 1) return false;

        return true;
    });
};

/**
 * Pick a random song from a filtered list
 */
export const pickRandomSong = (filteredSongs: Song[]): Song | null => {
    if (filteredSongs.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    return filteredSongs[randomIndex];
};

// --- Quiz Helper Types & Functions ---

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
 * Parses all songs to build a structured list of Dani (Class) courses.
 * Grouped by Version and Dan.
 */
export const getDaniCourses = (): DaniData[] => {
    const daniMap = new Map<string, DaniData>();

    songs.forEach(song => {
        // Iterate through all difficulties to find Dani info
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

    // Sort songs within each dan by order
    const result: DaniData[] = [];
    daniMap.forEach(value => {
        value.songs.sort((a, b) => a.order - b.order);
        result.push(value);
    });

    return result;
};

const DANI_VERSION_ORDER = [
  'katsudon', 'sorairo', 'momoiro', 'kimidori', 'Murasaki', 
  'white', 'red', 'yellow', 'blue', 'green'
];

export const getAvailableDaniVersions = (daniList: DaniData[]): string[] => {
    const versions = Array.from(new Set(daniList.map(d => d.version)));
    
    return versions.sort((a, b) => {
        const indexA = DANI_VERSION_ORDER.indexOf(a);
        const indexB = DANI_VERSION_ORDER.indexOf(b);

        // 1. Both are named versions -> Sort by defined order
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        // 2. Only A is named -> A comes first
        if (indexA !== -1) return -1;
        
        // 3. Only B is named -> B comes first
        if (indexB !== -1) return 1;

        // 4. Both are not in the list (likely numeric strings like "2020", "25", etc. or other names)
        // Try to sort numerically if possible, otherwise alphabetically
        const numA = parseInt(a);
        const numB = parseInt(b);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        return a.localeCompare(b);
    });
};

const DAN_ORDER = [
  '5kyu', '4kyu', '3kyu', '2kyu', '1kyu',
  '1dan', '2dan', '3dan', '4dan', '5dan', '6dan', '7dan', '8dan', '9dan', '10dan',
  'kuroto', 'mejin', 'chojin', 'tatsujin'
];

export const getAvailableDans = (daniList: DaniData[], version: string): string[] => {
    const dans = Array.from(new Set(daniList.filter(d => d.version === version).map(d => d.dan)));
    return dans.sort((a, b) => {
        const indexA = DAN_ORDER.indexOf(a);
        const indexB = DAN_ORDER.indexOf(b);
        
        // If both in list, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        
        // If only A is in list, A comes first
        if (indexA !== -1) return -1;
        // If only B is in list, B comes first
        if (indexB !== -1) return 1;
        
        // If neither, alphabetical
        return a.localeCompare(b);
    });
};

/**
 * Get a random set of generic songs for standard quizzes
 */
export const getRandomSongs = (count: number): Song[] => {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
