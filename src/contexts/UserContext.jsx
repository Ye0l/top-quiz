import React, { createContext, useContext, useState, useEffect } from 'react';

const JOB_MAP = {
    '나이트': 'PLD', '전사': 'WAR', '암흑기사': 'DRK', '건브레이커': 'GNB',
    '백마도사': 'WHM', '학자': 'SCH', '점성술사': 'AST', '현자': 'SGE',
    '몽크': 'MNK', '용기사': 'DRG', '닌자': 'NIN', '사무라이': 'SAM', '리퍼': 'RPR',
    '음유시인': 'BRD', '기공사': 'MCH', '무도가': 'DNC',
    '흑마도사': 'BLM', '소환사': 'SMN', '적마도사': 'RDM', '청마도사': 'BLU'
};

const JOBS = Object.keys(JOB_MAP);

// Lalafell Naming Syllables
const SYLLABLES_A = ['타', '토', '파', '피', '푸', '쿠', '키', '코', '나', '니', '루', '라', '리', '무', '메', '모'];
const SYLLABLES_B = ['타', '루', '라', '리', '키', '코', '포', '푸', '비', '바'];

export const generateNickname = (job) => {
    // 10% chance for special prefix
    if (Math.random() < 0.1) {
        const prefixes = ['빛의', '어둠의', '익명의', '전설의', '새싹'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return `${prefix} ${job}`;
    }

    // 90% chance for "Job + Lalafell Name"
    // Simple Rhythm: A-B-B (e.g., Ta-ta-ru) or A-B-A-B (e.g. Pi-pin)
    // Let's mix it up simply:
    const a = SYLLABLES_A[Math.floor(Math.random() * SYLLABLES_A.length)];
    const b = SYLLABLES_B[Math.floor(Math.random() * SYLLABLES_B.length)];
    const c = SYLLABLES_B[Math.floor(Math.random() * SYLLABLES_B.length)];
    
    // Formats: A-B-B, A-A-B, A-B
    const format = Math.floor(Math.random() * 3);
    let name = "";
    if (format === 0) name = `${a}${b}${b}`; // Tataru
    else if (format === 1) name = `${a}${a}${b}`; // Momodi
    else name = `${a}${b}${a}${b}`; // Pipin (Doubled) - actually Pipin is A-A. Let's do A-B-A-B pattern like Nanamo

    // Correction for natural names
    if (Math.random() < 0.5) name = `${a}${b}${c}`; // Generic 3 char
    else name = `${a}${b}${a}${b}`; // Repetitive

    return `${job} ${name}`;
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('top_quiz_profile');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        }
        
        const randomJob = JOBS[Math.floor(Math.random() * JOBS.length)];
        return {
            job: randomJob,
            nickname: generateNickname(randomJob)
        };
    });

    useEffect(() => {
        localStorage.setItem('top_quiz_profile', JSON.stringify(userProfile));
    }, [userProfile]);

    const updateProfile = (updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    return (
        <UserContext.Provider value={{ userProfile, updateProfile, jobs: JOBS }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

export const getJobIconUrl = (job) => {
    if (!job) return null;
    
    // If input is Korean name, map to English code
    const code = JOB_MAP[job];
    if (code) {
        return `./assets/fficons/${code.toLowerCase()}.png`;
    }
    
    // Fallback: If it's already English code (legacy data)
    return `./assets/fficons/${job.toLowerCase()}.png`;
};
