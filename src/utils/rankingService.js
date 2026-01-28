import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

const COLLECTION_NAME = 'rankings';

/**
 * Add a new ranking entry.
 * @param {string} category - 'arrow', 'omega_normal', 'omega_unlimited'
 * @param {string} nickname 
 * @param {string} job 
 * @param {number} score - Time (ms) for Arrow/Normal, Stage Level for Unlimited
 */
// Simple in-memory cache
// Structure: { categoryName: { timestamp: number, data: Array } }
// Simple in-memory cache
// Structure: { categoryName: { timestamp: number, data: Array } }
const rankingCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Add a new ranking entry.
 * @param {string} category - 'arrow', 'omega_normal', 'omega_unlimited'
 * @param {string} nickname 
 * @param {string} job 
 * @param {number} score - Clears (Normal/Unlimited), Time (Arrow)
 * @param {number} subScore - Avg Time (Normal), null (others)
 */
export const addRankingEntry = async (category, nickname, job, score, subScore = null) => {
  try {
    // Basic validation
    if (!nickname || !job) return;

    const data = {
      category,
      nickname: nickname.substring(0, 12), // Limit length
      job,
      score: Number(score), 
      timestamp: serverTimestamp()
    };
    
    if (subScore !== null) {
        data.subScore = Number(subScore);
    }

    await addDoc(collection(db, COLLECTION_NAME), data);
    
    // Invalidate cache for this category so next fetch gets fresh data
    delete rankingCache[category];
    
    return true;
  } catch (e) {
    console.error("Error adding ranking: ", e);
    return false;
  }
};

/**
 * Get top rankings for a category.
 * @param {string} category 
 * @param {number} limitCount 
 * @param {boolean} forceRefresh - If true, bypass cache
 * @returns {Promise<Array>}
 */
export const getRankings = async (category, limitCount = 100, forceRefresh = false) => {
  try {
    // Check Cache
    const cached = rankingCache[category];
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_DURATION)) {
        if (cached.data.length >= limitCount || cached.data.length < limitCount && cached.limitUsed >= limitCount) {
             return cached.data.slice(0, limitCount);
        }
    }
  
    const rankingsRef = collection(db, COLLECTION_NAME);
    let q;
    
    // Different sorting strategies
    if (category === 'omega_unlimited') {
        // High score (Level) is better
        q = query(
            rankingsRef, 
            where("category", "==", category), 
            orderBy("score", "desc"), 
            limit(limitCount)
        );
    } else if (category === 'omega_quiz') {
        // Normal Mode: High Clears (score) > Low Avg Time (subScore)
        try {
             q = query(
                rankingsRef, 
                where("category", "==", category), 
                orderBy("score", "desc"), 
                orderBy("subScore", "asc"),
                limit(limitCount)
            );
        } catch(e) {
             // Fallback if index missing (initially)
             console.warn("Composite Index missing, falling back to simple sort");
             q = query(
                rankingsRef, 
                where("category", "==", category), 
                orderBy("score", "desc"), 
                limit(limitCount)
            );
        }
    } else {
        // Low time is better (Arrow)
        q = query(
            rankingsRef, 
            where("category", "==", category), 
            orderBy("score", "asc"),
            limit(limitCount)
        );
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc, index) => ({ 
        rank: index + 1, 
        id: doc.id, 
        ...doc.data() 
    }));
    
    // Update Cache
    rankingCache[category] = {
        timestamp: Date.now(),
        data: data,
        limitUsed: limitCount
    };

    return data;
  } catch (e) {
    console.error("Error getting rankings: ", e);
    return [];
  }
};
