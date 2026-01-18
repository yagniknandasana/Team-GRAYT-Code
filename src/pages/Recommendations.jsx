import React, { useState, useEffect } from 'react';
import { FaPlayCircle, FaCodeBranch, FaClock, FaStar, FaLightbulb, FaCheckCircle, FaFlagCheckered, FaArrowDown } from 'react-icons/fa';
import AIChatBot from '../components/AIChatBot';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { HEALTHCARE_CAREERS, SKILL_RECOMMENDATIONS } from '../utils/skillData';
import { fetchAIRecommendations } from '../services/aiService';
import { completeRecommendation } from '../services/userService';

const Recommendations = () => {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [aiExplanation, setAiExplanation] = useState('');
    const [careerGoal, setCareerGoal] = useState('');
    const [weakSkills, setWeakSkills] = useState([]);
    const [missingSkills, setMissingSkills] = useState([]);

    // --- REUSED LOGIC FROM ASSESSMENT (Ideally could be a hook, but keeping simple) ---
    const getLevelValue = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 1;
            case 'intermediate': return 2;
            case 'advanced': return 3;
            default: return 0;
        }
    };

    const generateRecommendations = (career, missingSkills, weakSkills) => {
        const courses = new Set();
        const projects = new Set();
        const learningPath = [];

        // Step 1: Weak skills first (priority)
        weakSkills.forEach(skill => {
            learningPath.push(`Improve ${skill}`);
            if (SKILL_RECOMMENDATIONS[skill]) {
                SKILL_RECOMMENDATIONS[skill].courses.forEach(c => courses.add(c));
                SKILL_RECOMMENDATIONS[skill].projects.forEach(p => projects.add(p));
            }
        });

        // Step 2: Missing skills
        missingSkills.forEach(skill => {
            learningPath.push(`Learn ${skill}`);
            if (SKILL_RECOMMENDATIONS[skill]) {
                SKILL_RECOMMENDATIONS[skill].courses.forEach(c => courses.add(c));
                SKILL_RECOMMENDATIONS[skill].projects.forEach(p => projects.add(p));
            }
        });

        // Step 3: Career-focused project
        learningPath.push(`Build a ${career}-focused healthcare project`);

        return {
            courses: Array.from(courses),
            projects: Array.from(projects),
            learningPath
        };
    };

    const handleComplete = async (item) => {
        if (!confirm(`Mark "${item.title}" as complete? This will update your skill profile.`)) return;

        // Extract skill name from purpose or intelligent guess
        let skillName = "";
        if (item.purpose) {
            skillName = item.purpose.replace('Improve ', '').replace('Learn ', '');
        } else {
            // Fallback: This would ideally be passed from the AI explicitly as a 'skill' field, 
            // but for now we try to map it or default to something generic if unknown.
            // In a real app, we'd ensure the AI response includes "relatedSkill".
            skillName = item.tags?.[0] || "General Healthcare";
        }

        setLoading(true);
        const user = auth.currentUser;
        const success = await completeRecommendation(user, skillName, item.type);

        if (success) {
            // Remove from local list
            setRecommendations(prev => prev.filter(r => r.title !== item.title));

            // UPDATE CACHE MANUALLY to prevent reappearance on reload
            try {
                const userUid = auth.currentUser ? auth.currentUser.uid : 'guest';
                const cacheKey = `rec_cache_v4_${userUid}`; // v4 matches the refined update
                const cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    parsed.data = parsed.data.filter(r => r.title !== item.title);
                    localStorage.setItem(cacheKey, JSON.stringify(parsed));
                }

                // ADD TO BLOCKLIST
                const blocklist = JSON.parse(localStorage.getItem('completed_recommendations_blocklist') || '[]');
                blocklist.push(item.title);
                localStorage.setItem('completed_recommendations_blocklist', JSON.stringify(blocklist));

            } catch (e) {
                console.error("Cache update failed", e);
            }

            alert("Great job! Your skills have been updated. Check your Dashboard.");
        } else {
            alert("Failed to update profile. Please try again.");
        }
        setLoading(false);
    };

    const generateAIExplanation = (career, missingSkills, weakSkills) => {
        if (missingSkills.length === 0 && weakSkills.length === 0) {
            return `Excellent work! You are well-prepared for a career in ${career}. Consider exploring advanced specialization projects to stand out further.`;
        }
        return `You have chosen ${career} as your healthcare career goal. To succeed in this field, it is important to strengthen ${weakSkills.join(", ") || "core areas"} first, as these form the foundation. Learning ${missingSkills.join(", ") || "specific technical skills"} next will help you meet professional requirements. Finally, building a ${career}-focused project will allow you to apply your knowledge practically.`;
    };

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const processUser = (userData) => {
            // 2. Identify Target Goal & Skills
            const storedGoal = userData.goal;
            const userSkills = userData.skills || [];

            const DOMAIN_TITLES = {
                'health': 'Healthcare Technology',
                'agri': 'Agricultural Technology',
                'city': 'Smart City & Urban Systems'
            };
            const targetTitle = storedGoal?.specialization || DOMAIN_TITLES[storedGoal?.domain] || 'Healthcare Technology';
            setCareerGoal(targetTitle);

            // 3. Get Required Skills
            let requiredSkillsData = null;
            if (HEALTHCARE_CAREERS[targetTitle]) {
                requiredSkillsData = HEALTHCARE_CAREERS[targetTitle];
            } else if (['Ayurveda', 'Homeopathy', 'Unani Medicine', 'Siddha Medicine', 'Yoga & Naturopathy', 'Ayurvedic Pharmacy & Herbal Technology', 'Integrative Medicine (Allopathy + AYUSH)'].includes(targetTitle)) {
                requiredSkillsData = HEALTHCARE_CAREERS["AYUSH"];
            }

            let requiredSkills = [];
            if (requiredSkillsData) {
                requiredSkills = [
                    ...requiredSkillsData.skills.core,
                    ...requiredSkillsData.skills.technical,
                    ...requiredSkillsData.skills.supporting
                ].map(s => ({ skill: s.name, requiredLevel: s.requiredLevel }));
            } else {
                // Fallback logic for demo if outside mapped careers
                requiredSkills = [{ skill: "Data Analysis", requiredLevel: "Intermediate" }];
            }

            // 4. Calculate Gaps
            let missing = [];
            let weak = [];

            requiredSkills.forEach(req => {
                const userSkill = userSkills.find(s => s.name.toLowerCase() === req.skill.toLowerCase());
                const reqValue = getLevelValue(req.requiredLevel);
                const userValue = userSkill ? getLevelValue(userSkill.level) : 0;

                if (!userSkill) {
                    missing.push(req.skill);
                } else if (userValue < reqValue) {
                    weak.push(req.skill);
                }
            });

            // 5. Generate Recommendations
            setWeakSkills(weak);
            setMissingSkills(missing);

            // --- CACHING STRATEGY ---
            const userUid = auth.currentUser ? auth.currentUser.uid : 'guest';
            // Include 'userSkills' in signature to invalidate cache if a skill level changes (fixes "reappearing" issue)
            const gapSignature = JSON.stringify({
                goal: targetTitle,
                weak: weak.sort(),
                missing: missing.sort(),
                // skillCount: userSkills.length // Simple check for changes
            });
            const cacheKey = `rec_cache_v4_${userUid}`;

            const cachedData = localStorage.getItem(cacheKey);
            let parsedCache = null;
            if (cachedData) {
                try {
                    parsedCache = JSON.parse(cachedData);
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            if (parsedCache && parsedCache.signature === gapSignature) {
                setRecommendations(parsedCache.data);
                setAiExplanation(parsedCache.aiText);
                setLoading(false);
                return;
            }

            (async () => {
                let recData = null;
                let aiText = '';
                let uiItems = [];

                try {
                    const aiResult = await fetchAIRecommendations(targetTitle, weak, missing);
                    if (aiResult && aiResult.recommendations) {
                        recData = {
                            courses: aiResult.recommendations.filter(r => r.type === 'course'),
                            projects: aiResult.recommendations.filter(r => r.type === 'project'),
                            fullList: aiResult.recommendations
                        };
                        aiText = aiResult.explanation;
                    }
                } catch (e) {
                    console.log("AI Service unavailable, falling back to local logic");
                }

                if (!recData) {
                    const localData = generateRecommendations(targetTitle, missing, weak);
                    recData = localData;
                    aiText = generateAIExplanation(targetTitle, missing, weak);
                }

                setAiExplanation(aiText);

                // --- SMART FILTERING & LIMITING ---
                const processItems = (list) => {
                    const processed = [];
                    const seenSkills = new Set();

                    // Priority: Weak Skills first, then Missing
                    const targetSkills = [...weak, ...missing];

                    list.forEach((item, idx) => {
                        // 1. Identify which skill this item is for
                        let relatedSkill = item.purpose ? item.purpose.replace(/^(Improve|Learn|Build a|Master|Intro to)\s+/i, '') : item.tags?.[0];

                        // Clean loosely
                        if (relatedSkill) {
                            const match = targetSkills.find(ts => relatedSkill.toLowerCase().includes(ts.toLowerCase()) || ts.toLowerCase().includes(relatedSkill.toLowerCase()));
                            if (match) relatedSkill = match;
                        }

                        // 2. Strict Filter: If this item is NOT for a current weak/missing skill, SKIP IT.
                        // check if the related skill is actually in our target list
                        const isRelevant = targetSkills.some(ts =>
                            (item.purpose && item.purpose.toLowerCase().includes(ts.toLowerCase())) ||
                            (item.title.toLowerCase().includes(ts.toLowerCase())) ||
                            (item.tags && item.tags.some(t => t.toLowerCase().includes(ts.toLowerCase())))
                        );

                        // Allows projects nicely, but strict on courses
                        if (item.type === 'course' && !isRelevant) return;

                        // 3. Limit: Only 1 resource per skill
                        if (processed.filter(p => p.relatedSkill === relatedSkill).length >= 1) return;

                        processed.push({
                            ...item,
                            relatedSkill: relatedSkill || "General",
                            image: item.image || `https://source.unsplash.com/random/300x200?${item.tags?.[0] || 'technology'},${idx}`
                        });
                    });
                    return processed;
                };

                if (recData.fullList) {
                    uiItems = processItems(recData.fullList);
                } else {
                    // Fallback manual processing
                    uiItems = processItems([...recData.courses.map(c => ({ ...c, type: 'course' })), ...recData.projects.map(p => ({ ...p, type: 'project' }))]);
                }

                // Hard Limit Removed
                // if (uiItems.length > 6) {
                //     uiItems = uiItems.slice(0, 6);
                // }

                if (uiItems.length === 0) {
                    // Only show fallback if we genuinely have gaps but no items found
                    if (weak.length > 0 || missing.length > 0) {
                        uiItems.push({
                            type: 'course',
                            title: `Essentials of ${careerGoal}`,
                            provider: "MedSkill Navigator Recommended",
                            duration: "4 Weeks",
                            rating: 4.8,
                            tags: ["Core Skill"],
                            relatedSkill: missing[0] || weak[0] || "Foundations",
                            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300&h=200"
                        });
                    }
                }

                // SAVE TO CACHE
                const newCache = {
                    signature: gapSignature,
                    data: uiItems,
                    aiText: aiText
                };
                localStorage.setItem(cacheKey, JSON.stringify(newCache));

                setRecommendations(uiItems);
                setLoading(false);
            })();
        };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                const userDocRef = doc(db, "users", user.uid);
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        processUser(docSnap.data());
                    }
                });
            } else {
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                const storedGoal = JSON.parse(localStorage.getItem('userGoal'));
                const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
                if (storedGoal && storedProfile) {
                    processUser({ goal: storedGoal, ...storedProfile });
                } else {
                    setLoading(false);
                }

                const handleStorageChange = () => {
                    const updatedProfile = JSON.parse(localStorage.getItem('userProfile'));
                    if (updatedProfile) processUser({ goal: storedGoal, ...updatedProfile });
                };
                window.addEventListener('storage', handleStorageChange);
                return () => window.removeEventListener('storage', handleStorageChange);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    // --- TIMELINE HELPERS ---
    const getGroupedRecommendations = () => {
        // Use robustness check
        if (!recommendations || recommendations.length === 0) return null;

        const foundation = recommendations.filter(r => r.type === 'course' && (r.tags?.includes('Basics') || r.purpose?.includes('Improve') || weakSkills.some(ws => r.title.includes(ws))));
        const mastery = recommendations.filter(r => r.type === 'project');
        const acquisition = recommendations.filter(r => !foundation.includes(r) && !mastery.includes(r));

        return { foundation, acquisition, mastery };
    };

    const TimelineSection = ({ title, icon, items, colorClass, number }) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="timeline-section animate-fade-in" style={{
                borderLeft: `3px solid var(--${colorClass})`,
                paddingLeft: '2rem',
                position: 'relative',
                marginBottom: '3rem'
            }}>
                <div style={{
                    position: 'absolute', left: '-1rem', top: '0',
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: `var(--${colorClass})`, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', zIndex: 10
                }}>
                    {number}
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: `var(--${colorClass}-light)`, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {icon} {title}
                </h3>

                <div className="grid-cols-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {items.map((item, idx) => (
                        <div key={idx} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                            <div style={{ height: '140px', overflow: 'hidden', backgroundColor: '#333', position: 'relative' }}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.style.backgroundColor = '#1e293b'; }}
                                />
                                {item.relatedSkill && (
                                    <div style={{
                                        position: 'absolute', bottom: '10px', left: '10px',
                                        background: 'rgba(0,0,0,0.7)', color: '#fff',
                                        padding: '0.2rem 0.6rem', borderRadius: '20px',
                                        fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        Target: {item.relatedSkill}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    alignSelf: 'start', fontSize: '0.7rem',
                                    background: item.type === 'course' ? 'rgba(99,102,241,0.2)' : 'rgba(6,182,212,0.2)',
                                    color: item.type === 'course' ? '#a5b4fc' : '#67e8f9',
                                    padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.8rem', textTransform: 'uppercase', fontWeight: 700
                                }}>
                                    {item.type}
                                </div>
                                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: '1.4', fontWeight: 600 }}>{item.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>by {item.provider}</p>

                                {item.relatedSkill && !item.type === 'project' && (
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        For: <span style={{ color: '#e2e8f0' }}>{item.relatedSkill}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent(item.searchQuery || (item.title + " " + item.provider + " " + item.type))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-button"
                                        style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem' }}
                                    >
                                        Start
                                    </a>
                                    <button
                                        onClick={() => handleComplete(item)}
                                        className="glass-button"
                                        style={{ flex: 1, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.8rem', padding: '0.6rem' }}
                                    >
                                        Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <div className="text-center p-10">Generating your Career Roadmap...</div>;

    const phases = getGroupedRecommendations() || { foundation: [], acquisition: [], mastery: [] };

    const isAllComplete = !loading && recommendations.length === 0;

    return (
        <div className="container-custom animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Career Roadmap</h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    A personalized step-by-step pathway to becoming a job-ready <strong>{careerGoal}</strong>.
                </p>
            </header>

            {/* AI Insight Box */}
            {!isAllComplete && (
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '4rem', borderLeft: '4px solid var(--primary)', display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary)' }}><FaLightbulb /></div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Mentor Insight</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem' }}>{aiExplanation}</p>
                    </div>
                </div>
            )}

            {isAllComplete ? (
                <div className="glass-panel" style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    background: 'linear-gradient(145deg, rgba(74, 222, 128, 0.05) 0%, rgba(0,0,0,0) 100%)'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(74, 222, 128, 0.5))' }}>🎉</div>
                    <h2 style={{ fontSize: '2.5rem', color: '#4ade80', marginBottom: '1rem' }}>Syllabus Completed!</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
                        Congratulations! You have mastered all the recommended skills and projects for <strong>{careerGoal}</strong>. Your profile is now highly competitive for this role.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="glass-button"
                            style={{ fontSize: '1.1rem', padding: '0.8rem 2.5rem', background: 'var(--primary)', border: 'none' }}
                        >
                            View Final Profile
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <TimelineSection
                        number="1"
                        title="Strengthening Foundations"
                        icon={<FaCheckCircle />}
                        items={phases.foundation}
                        colorClass="warning"
                    />
                    <TimelineSection
                        number="2"
                        title="Skill Acquisition"
                        icon={<FaArrowDown />}
                        items={phases.acquisition}
                        colorClass="primary"
                    />
                    <TimelineSection
                        number="3"
                        title="Real-World Mastery"
                        icon={<FaFlagCheckered />}
                        items={phases.mastery}
                        colorClass="success"
                    />
                </div>
            )}

            <AIChatBot careerGoal={careerGoal} weakSkills={weakSkills} missingSkills={missingSkills} />
        </div>
    );
};

export default Recommendations;
