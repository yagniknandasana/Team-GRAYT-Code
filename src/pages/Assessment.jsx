import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Assessment = () => {
    const [readinessScore, setReadinessScore] = useState(0);
    const [skillAnalysis, setSkillAnalysis] = useState([]);
    const [missingSkills, setMissingSkills] = useState([]);
    const [weakSkills, setWeakSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userGoal, setUserGoal] = useState(null);

    // STEP 1: Load Required Skills (Static Map for Demo)
    const REQUIRED_SKILLS_MAP = {
        'Cardiology': [
            { skill: "Cardiac Anatomy", requiredLevel: "Intermediate" },
            { skill: "ECG Interpretation", requiredLevel: "Intermediate" },
            { skill: "Clinical Diagnosis", requiredLevel: "Advanced" },
            { skill: "Patient Counseling", requiredLevel: "Intermediate" }
        ],
        'Neurology': [
            { skill: "Neuroanatomy", requiredLevel: "Intermediate" },
            { skill: "EEG Analysis", requiredLevel: "Advanced" },
            { skill: "Clinical Diagnosis", requiredLevel: "Advanced" }
        ],
        // Fallback for generic Healthcare if no specific specialization matches or found
        'Healthcare Technology': [
            { skill: "Medical Terminology", requiredLevel: "Intermediate" },
            { skill: "Patient Care Systems", requiredLevel: "Intermediate" },
            { skill: "Biomedical Basics", requiredLevel: "Beginner" }
        ],
        'Agricultural Technology': [
            { skill: "IoT Sensors", requiredLevel: "Intermediate" },
            { skill: "Soil Science", requiredLevel: "Intermediate" }
        ],
        'Smart City & Urban Systems': [
            { skill: "Data Analysis", requiredLevel: "Intermediate" },
            { skill: "Urban Planning", requiredLevel: "Intermediate" },
            { skill: "GIS Mapping", requiredLevel: "Advanced" }
        ]
    };

    // Helper: Normalize Levels
    const getLevelValue = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 1;
            case 'intermediate': return 2;
            case 'advanced': return 3;
            default: return 0;
        }
    };

    useEffect(() => {
        const calculateAssessment = (userData) => {
            const storedGoal = userData.goal || JSON.parse(localStorage.getItem('userGoal'));
            // User skills might be directly in userData or nested
            const userSkills = userData.skills || [];

            // Determine Target Specialization
            const DOMAIN_TITLES = {
                'health': 'Healthcare Technology',
                'agri': 'Agricultural Technology',
                'city': 'Smart City & Urban Systems'
            };
            const targetTitle = storedGoal?.specialization || DOMAIN_TITLES[storedGoal?.domain] || 'Healthcare Technology';
            setUserGoal(targetTitle);

            // Get Required Skills (Fallback to generic if specific not found)
            const requiredSkills = REQUIRED_SKILLS_MAP[targetTitle] || REQUIRED_SKILLS_MAP['Healthcare Technology'];

            // Analysis Arrays
            let totalScore = 0;
            let analysisResults = [];
            let missing = [];
            let weak = [];

            // Compare Each Required Skill
            requiredSkills.forEach(req => {
                const userSkill = userSkills.find(s => s.name.toLowerCase() === req.skill.toLowerCase());
                const reqValue = getLevelValue(req.requiredLevel);
                const userValue = userSkill ? getLevelValue(userSkill.level) : 0;

                let status = '';
                let score = 0;

                if (!userSkill) {
                    status = 'MISSING';
                    score = 0;
                    missing.push(req.skill);
                } else if (userValue < reqValue) {
                    status = 'WEAK';
                    score = (userValue / reqValue) * 100;
                    weak.push(req.skill);
                } else {
                    status = 'GOOD';
                    score = 100;
                }

                totalScore += score;

                analysisResults.push({
                    skill: req.skill,
                    requiredLevel: req.requiredLevel,
                    userLevel: userSkill ? userSkill.level : 'Not Present',
                    status: status
                });
            });

            // Overall Readiness Percentage
            const finalReadiness = requiredSkills.length > 0 ? Math.round(totalScore / requiredSkills.length) : 0;

            setReadinessScore(finalReadiness);
            setSkillAnalysis(analysisResults);
            setMissingSkills(missing);
            setWeakSkills(weak);
            setLoading(false);
        };

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docSnap = await getDoc(doc(db, "users", user.uid));
                    if (docSnap.exists()) {
                        calculateAssessment(docSnap.data());
                    } else {
                        setLoading(false);
                    }
                } catch (e) {
                    console.error("Error fetching data:", e);
                    setLoading(false);
                }
            } else {
                // Fallback to LocalStorage for offline/demo
                const storedGoal = JSON.parse(localStorage.getItem('userGoal'));
                const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
                if (storedGoal && storedProfile) {
                    calculateAssessment({ goal: storedGoal, ...storedProfile });
                } else {
                    setLoading(false);
                }
            }
        });

        return () => unsubscribeAuth();

    }, []);

    if (loading) return <div className="text-center p-10">Running Intelligence Analysis...</div>;

    const pieData = [
        { name: 'Ready', value: readinessScore },
        { name: 'Gap', value: 100 - readinessScore }
    ];

    return (
        <div className="container-custom animate-fade-in" style={{ paddingBottom: '3rem', maxWidth: '1000px' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Intelligence Assessment</h1>
                <p style={{ color: 'var(--text-muted)' }}>Analyzed for target role: <strong>{userGoal}</strong></p>
            </header>

            {/* A. Skill Readiness Score */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>OVERALL READINESS SCORE</h2>
                <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                            >
                                <Cell key="ready" fill="var(--primary)" />
                                <Cell key="gap" fill="rgba(255,255,255,0.1)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{readinessScore}%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Match</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* B. Skill Comparison Table */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Skill Breakdown</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem 0' }}>Required Skill</th>
                                <th style={{ padding: '1rem 0' }}>Your Level</th>
                                <th style={{ padding: '1rem 0', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skillAnalysis.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem 0', fontWeight: '500' }}>{item.skill} <br /> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Req: {item.requiredLevel}</span></td>
                                    <td style={{ padding: '1rem 0', color: item.status === 'MISSING' ? '#f43f5e' : 'inherit' }}>{item.userLevel}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                                        {item.status === 'GOOD' && <FaCheckCircle style={{ color: '#22c55e', fontSize: '1.2rem' }} />}
                                        {item.status === 'WEAK' && <FaExclamationTriangle style={{ color: '#eab308', fontSize: '1.2rem' }} />}
                                        {item.status === 'MISSING' && <FaTimesCircle style={{ color: '#f43f5e', fontSize: '1.2rem' }} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* C. Missing / Weak Skills List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f43f5e' }}>
                        <h4 style={{ color: '#f43f5e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTimesCircle /> Missing Skills
                        </h4>
                        {missingSkills.length > 0 ? (
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                {missingSkills.map(s => <li key={s} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                            </ul>
                        ) : <p style={{ fontSize: '0.9rem' }}>No critical skills missing!</p>}
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #eab308' }}>
                        <h4 style={{ color: '#eab308', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaExclamationTriangle /> Weak Areas
                        </h4>
                        {weakSkills.length > 0 ? (
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                {weakSkills.map(s => <li key={s} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                            </ul>
                        ) : <p style={{ fontSize: '0.9rem' }}>Proficiency levels look good!</p>}
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.1)' }}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Based on this analysis, we have curated a learning path for you.</p>
                        <button className="glass-button" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>View Recommendations</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Assessment;
