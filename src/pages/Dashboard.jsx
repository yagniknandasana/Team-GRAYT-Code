import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend, RadialBarChart, RadialBar } from 'recharts';
import { FaTrophy, FaProjectDiagram, FaBookOpen, FaUserMd } from 'react-icons/fa';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { HEALTHCARE_CAREERS } from '../utils/skillData';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        readiness: 0,
        missingCount: 0,
        weakCount: 0,
        goodCount: 0,
        totalRequired: 0
    });
    const [radarData, setRadarData] = useState([]);
    const [barData, setBarData] = useState([]);

    // Helper: Normalize Levels for Charting
    const getLevelValue = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 30;
            case 'intermediate': return 65;
            case 'advanced': return 100;
            default: return 0;
        }
    };

    useEffect(() => {
        let unsubscribeSnapshot = null;
        const processData = (userProfile) => {
            if (!userProfile || !userProfile.goal) return;

            const storedGoal = userProfile.goal;
            const userSkills = userProfile.skills || [];

            // Determine Target Specialization
            const DOMAIN_TITLES = {
                'health': 'Healthcare Technology',
                'agri': 'Agricultural Technology',
                'city': 'Smart City & Urban Systems'
            };
            const targetTitle = storedGoal?.specialization || DOMAIN_TITLES[storedGoal?.domain] || 'Healthcare Technology';

            // Fetch Required Skills 
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
                // Fallback
                requiredSkills = [{ skill: "Data Analysis", requiredLevel: "Intermediate" }];
            }

            // Calculation
            let totalScore = 0;
            let missing = 0;
            let weak = 0;
            let good = 0;
            const radarChartData = [];

            requiredSkills.forEach(req => {
                const userSkill = userSkills.find(s => s.name.toLowerCase() === req.skill.toLowerCase());
                const reqVal = getLevelValue(req.requiredLevel);
                const userVal = userSkill ? getLevelValue(userSkill.level) : 0;

                // Stats breakdown
                if (!userSkill) missing++;
                else if (userVal < reqVal) weak++;
                else good++;

                // Score calculation (simple ratio)
                let skillScore = 0;
                if (userVal >= reqVal) skillScore = 100;
                else skillScore = (userVal / reqVal) * 100;
                totalScore += skillScore;

                // Radar Data (Top 6 skills only to avoid clutter)
                if (radarChartData.length < 6) {
                    radarChartData.push({
                        subject: req.skill.split(" ")[0], // Shorten name
                        A: userVal, // User
                        B: reqVal,  // Required
                        fullMark: 100
                    });
                }
            });

            const readiness = requiredSkills.length > 0 ? Math.round(totalScore / requiredSkills.length) : 0;

            setStats({
                readiness,
                missingCount: missing,
                weakCount: weak,
                goodCount: good,
                totalRequired: requiredSkills.length
            });

            setRadarData(radarChartData);

            // Bar Data for Status
            setBarData([
                { name: 'Status', Missing: missing, Weak: weak, Good: good }
            ]);

            setUserData({ ...userProfile, targetTitle });
            setLoading(false);
        };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Setup realtime listener
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                const userDocRef = doc(db, "users", user.uid);

                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        processData(docSnap.data());
                    } else {
                        // Document doesn't exist (new user)
                        setStats({ readiness: 0, missingCount: 0, weakCount: 0, goodCount: 0, totalRequired: 0 });
                        setRadarData([]);
                        setBarData([]);
                        setUserData({ name: user.displayName });
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("Error fetching realtime data:", error);
                    setLoading(false);
                });

            } else {
                if (unsubscribeSnapshot) unsubscribeSnapshot();

                // LocalStorage Fallback
                const storedGoal = JSON.parse(localStorage.getItem('userGoal'));
                const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
                if (storedGoal && storedProfile) {
                    processData({ goal: storedGoal, ...storedProfile });
                } else {
                    setLoading(false);
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
        <div className="stat-card">
            <div className="stat-glow" style={{ background: `rgb(${color})` }}></div>
            <div className="stat-icon" style={{ background: `rgba(${color}, 0.2)`, color: `rgb(${color})` }}>
                <Icon />
            </div>
            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <div className="stat-value">{value}</div>
                <div className="stat-subtext">{subtext}</div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            <div className="loading-text">Loading Dashboard...</div>
        </div>
    );

    const radialData = [
        { name: 'Readiness', uv: stats.readiness, fill: '#8884d8' }
    ];

    return (
        <div className="dashboard-container">
            {/* Animated Background */}
            <div className="background-grid"></div>
            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            {/* Header */}
            <header className="dashboard-header animate-slide-up">
                <div className="header-content">
                    <div className="user-info">
                        <div className="user-avatar">
                            {userData?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                            <h1 className="user-greeting">
                                Welcome back, <span className="user-name">{userData?.name || 'User'}</span>
                            </h1>
                            <div className="user-target">
                                <span className="target-icon"><FaTrophy /></span>
                                <span>Target: <strong className="highlight">{userData?.targetTitle}</strong></span>
                                <span className="role-badge">{userData?.role || 'Student'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <StatCard
                    icon={FaTrophy}
                    title="Readiness Score"
                    value={`${stats.readiness}%`}
                    subtext="Match to Role"
                    color="236, 72, 153"
                />
                <StatCard
                    icon={FaBookOpen}
                    title="Skills Assessed"
                    value={stats.totalRequired}
                    subtext="Core Competencies"
                    color="99, 102, 241"
                />
                <StatCard
                    icon={FaUserMd}
                    title="Role Fit"
                    value={stats.readiness > 80 ? 'High' : 'Moderate'}
                    subtext="Based on Gaps"
                    color="6, 182, 212"
                />
            </div>

            {/* Charts Grid */}
            <div className="charts-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>

                {/* 1. Skill Status Breakdown (Bar) */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <FaProjectDiagram className="chart-icon" />
                            <span>Proficiency Breakdown</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={50} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1b4b',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#f8fafc',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="Good" stackId="a" fill="#22c55e" name="On Track" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="Weak" stackId="a" fill="#eab308" name="Improve" />
                                <Bar dataKey="Missing" stackId="a" fill="#f43f5e" name="Missing" radius={[4, 0, 0, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Competency Radar */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <FaUserMd className="chart-icon" />
                            <span>Competency Gap</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My Level" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.4} />
                                <Radar name="Required" dataKey="B" stroke="#ec4899" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1b4b',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Overall Readiness Radial (Large Card) */}
                <div className="chart-card radial-card">
                    <div className="radial-content">
                        <div className="radial-text">
                            <h3 className="radial-title">Ready for your Career?</h3>
                            <p className="radial-description">
                                You are <strong className="highlight">{stats.readiness}%</strong> of the way to being job-ready for {userData?.targetTitle}.
                                Focus on the <strong className="highlight">{stats.missingCount} missing skills</strong> to boost your score efficiently.
                            </p>
                            <div className="radial-stats">
                                <div className="stat-item">
                                    <span className="stat-number success">{stats.goodCount}</span>
                                    <span className="stat-label">Strong</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number warning">{stats.weakCount}</span>
                                    <span className="stat-label">Weak</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number danger">{stats.missingCount}</span>
                                    <span className="stat-label">Missing</span>
                                </div>
                            </div>
                        </div>
                        <div className="radial-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={20} data={radialData} startAngle={90} endAngle={-270}>
                                    <RadialBar
                                        minAngle={15}
                                        background={{ fill: 'rgba(255,255,255,0.1)' }}
                                        clockWise
                                        dataKey="uv"
                                        cornerRadius={10}
                                        fill={stats.readiness > 75 ? '#22c55e' : stats.readiness > 40 ? '#eab308' : '#f43f5e'}
                                    />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="radial-value" style={{ fill: 'white' }}>
                                        {stats.readiness}%
                                    </text>
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
