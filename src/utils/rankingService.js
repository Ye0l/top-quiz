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
const rankingCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Add a new ranking entry.
 * @param {string} category - 'arrow', 'omega_normal', 'omega_unlimited'
 * @param {string} nickname 
 * @param {string} job 
 * @param {number} score - Time (ms) for Arrow/Normal, Stage Level for Unlimited
 */
export const addRankingEntry = async (category, nickname, job, score) => {
  try {
    // Basic validation
    if (!nickname || !job) return;

    await addDoc(collection(db, COLLECTION_NAME), {
      category,
      nickname: nickname.substring(0, 12), // Limit length
      job,
      score: Number(score), 
      timestamp: serverTimestamp()
    });
    
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
        // Return cached data if valid and fresh enough
        // Note: limitCount might differ, but usually we fetch 100 on page and 10 on sidebar.
        // If we cached 100, we can slice for 10. If we cached 10, and need 100, we must refetch.
        // For simplicity, if we have cache and it covers our need (length >= limit), return slice.
        // Or simplified: Just return cache if it exists. 
        // Since we usually fetch 10 or 100, let's just use the cached data even if it's 100 when we asked 10.
        // But if we asked 100 and have 10, we should refetch? 
        // Let's rely on the standard usage: Page loads 100. Sidebar loads 10.
        // If sidebar loads first, it catches 10. Page loads later, needs 100 -> Refetch.
        // If page loads first, catches 100. Sidebar loads later, needs 10 -> Return 100 (sliced).
        
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
    } else {
        // Low time is better (Arrow, Omega Normal)
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
