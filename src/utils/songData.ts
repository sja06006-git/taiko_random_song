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
    difficulties: Difficulty[];
    levels: number[];
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

        // 3. Deleted Filter
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
