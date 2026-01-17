import { db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Updates the user's skill profile when they complete a recommendation.
 * @param {Object} user - The current user object (firebase auth user).
 * @param {string} skillName - The name of the skill related to the course/project.
 * @param {string} type - 'course' (adds/improves to Intermediate) or 'project' (improves to Advanced).
 */
export const completeRecommendation = async (user, skillName, type) => {
    if (!skillName) return;
    // Robust cleaning: remove common prefixes, case insensitive
    const cleanSkillName = skillName
        .replace(/^(Improve|Learn|Build a|Master|Intro to|Basics of)\s+/i, '')
        .replace(/-focused healthcare project$/i, '')
        .replace(/\s+Course$/i, '')
        .replace(/\s+Project$/i, '')
        .trim();

    // Determine new level based on type
    // If it's a "Course", we assume they reached "Intermediate" (or Beginner -> Intermediate)
    // If it's a "Project", we assume they reached "Advanced" (or Intermediate -> Advanced)
    let newLevel = "Intermediate";
    if (type === 'project') newLevel = "Advanced";

    try {
        let currentSkills = [];

        // 1. Get Current Skills (Async Source needed if we want atomic updates, 
        // but for now we read from localStorage for instant feedback or fetch if online)

        if (user) {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                currentSkills = docSnap.data().skills || [];
            }
        } else {
            const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
            if (storedProfile) currentSkills = storedProfile.skills || [];
        }

        // 2. Update Logic
        const existingSkillIndex = currentSkills.findIndex(s => s.name.toLowerCase() === cleanSkillName.toLowerCase());

        let updatedSkills = [...currentSkills];

        if (existingSkillIndex >= 0) {
            // Skill exists, upgrade it if new level is higher
            const currentLevel = updatedSkills[existingSkillIndex].level;

            // Simple hierarchy check: Beginner < Intermediate < Advanced
            const levels = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };

            if (levels[newLevel] > levels[currentLevel]) {
                updatedSkills[existingSkillIndex] = { ...updatedSkills[existingSkillIndex], level: newLevel };
            }
        } else {
            // Skill missing, add it
            updatedSkills.push({ name: cleanSkillName, level: newLevel });
        }

        // 3. Save Back
        if (user) {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { skills: updatedSkills });
        } else {
            const storedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            storedProfile.skills = updatedSkills;
            localStorage.setItem('userProfile', JSON.stringify(storedProfile));

            // Dispatch storage event to force re-render in listeners
            window.dispatchEvent(new Event("storage"));
        }

        return true;
    } catch (error) {
        console.error("Error updating skills:", error);
        return false;
    }
};

/**
 * Update entire user profile data
 */
export const updateUserProfile = async (uid, profileData) => {
    try {
        // Update LocalStorage
        const existingLocal = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedLocal = { ...existingLocal, ...profileData };
        localStorage.setItem('userProfile', JSON.stringify(updatedLocal));

        // Update Firestore
        if (uid) {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, profileData, { merge: true });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
