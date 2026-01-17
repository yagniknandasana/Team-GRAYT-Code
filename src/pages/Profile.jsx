import React, { useState, useEffect } from 'react';
import { FaUser, FaCode, FaBook, FaBriefcase, FaProjectDiagram } from 'react-icons/fa';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: 'Alex Morgan', // Default/Mock
        email: 'alex.m@university.edu',
        role: 'Student',
        education: 'Undergraduate',
        skills: [{ name: 'React', level: 'Intermediate' }, { name: 'Urban Planning', level: 'Beginner' }],
        courses: [],
        projects: []
    });

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const unsubDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
                    if (doc.exists()) {
                        setProfile(prev => ({ ...prev, ...doc.data() }));
                    }
                });
                return () => unsubDoc();
            } else {
                // Fallback
                const savedData = localStorage.getItem('userProfile');
                if (savedData) {
                    setProfile(prev => ({ ...prev, ...JSON.parse(savedData) }));
                }
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <div className="container-custom animate-fade-in" style={{ maxWidth: '800px', paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>My Profile</h1>
            </header>

            {/* Main Info Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'var(--gradient-main)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '2.5rem', color: 'white'
                    }}>
                        <FaUser />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{profile.name}</h2>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBriefcase size={14} /> {profile.role || 'User'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaGraduationCap size={14} /> {profile.education || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Skills Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaCode className="text-primary" /> Skills
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                        {profile.skills.length > 0 ? profile.skills.map((skill, idx) => (
                            <span key={idx} style={{
                                background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc',
                                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem',
                                border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column'
                            }}>
                                <span style={{ fontWeight: '600' }}>{skill.name}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{skill.level}</span>
                            </span>
                        )) : <span style={{ color: 'var(--text-muted)' }}>No skills added.</span>}
                    </div>
                </div>

                {/* Courses Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaBook className="text-primary" /> Courses
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {profile.courses.length > 0 ? profile.courses.map((course, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{course.name}</div>
                                <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{course.platform}</div>
                            </div>
                        )) : <span style={{ color: 'var(--text-muted)' }}>No courses added.</span>}
                    </div>
                </div>

                {/* Projects Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaProjectDiagram className="text-primary" /> Projects
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {profile.projects.length > 0 ? profile.projects.map((proj, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{proj.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{proj.description}</div>
                            </div>
                        )) : <span style={{ color: 'var(--text-muted)' }}>No projects added.</span>}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Need access to icons defined in imports at top of file, so we re-import them correctly in the actual file write
import { FaGraduationCap } from 'react-icons/fa';

export default Profile;
