import songDataRaw from '../data/2025-9-8.json';

export interface CourseInfo {
    level: number;
    isBranched: number;
    maxCombo: number;
    playTime: number;
    balloon: number[];
    rollTime: number[];
    maxDensity: number;
    daniUsed: number;
    dani: string[];
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
    difficulty: Difficulty;
    levelMin?: number;
    levelMax?: number;
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

        // 2. Difficulty Existence Filter
        // The song MUST have the selected difficulty
        const course = song.courses[criteria.difficulty];
        if (!course) return false;

        // 3. Level Range Filter
        if (criteria.levelMin !== undefined && course.level < criteria.levelMin) return false;
        if (criteria.levelMax !== undefined && course.level > criteria.levelMax) return false;

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
