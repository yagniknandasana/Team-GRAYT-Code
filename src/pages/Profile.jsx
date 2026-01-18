import React, { useState, useEffect } from 'react';
import { FaUser, FaCode, FaBook, FaBriefcase, FaProjectDiagram, FaGraduationCap, FaEdit, FaSave, FaPlus, FaTrash, FaBullseye } from 'react-icons/fa';
import { db, auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { updateUserProfile } from '../services/userService';
import { HEALTHCARE_CAREERS } from '../utils/skillData';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: 'Alex Morgan',
        email: 'alex.m@university.edu',
        role: 'Student',
        education: 'Undergraduate',
        skills: [{ name: 'React', level: 'Intermediate' }],
        skills: [{ name: 'React', level: 'Intermediate' }],
        courses: [],
        projects: [],
        goal: { specialization: 'General Medicine' } // Default or loaded
    });
    const [isEditing, setIsEditing] = useState(false);
    const [userUid, setUserUid] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserUid(user.uid);
                const unsubDoc = onSnapshot(doc(db, "users", user.uid), (doc) => {
                    if (doc.exists()) {
                        setProfile(prev => ({ ...prev, ...doc.data() }));
                    }
                });
                return () => unsubDoc();
            } else {
                const savedData = localStorage.getItem('userProfile');
                if (savedData) {
                    setProfile(prev => ({ ...prev, ...JSON.parse(savedData) }));
                }
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const handleSave = async () => {
        await updateUserProfile(userUid, profile);
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    // Skills Helpers
    const handleSkillChange = (idx, field, val) => {
        const newSkills = [...profile.skills];
        newSkills[idx][field] = val;
        setProfile(prev => ({ ...prev, skills: newSkills }));
    };
    const addSkill = () => {
        setProfile(prev => ({ ...prev, skills: [...prev.skills, { name: 'New Skill', level: 'Beginner' }] }));
    };
    const removeSkill = (idx) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
    };

    // Courses Helpers
    const handleCourseChange = (idx, field, val) => {
        const newCourses = [...profile.courses];
        newCourses[idx][field] = val;
        setProfile(prev => ({ ...prev, courses: newCourses }));
    };
    const addCourse = () => {
        setProfile(prev => ({ ...prev, courses: [...prev.courses, { name: 'New Course', platform: 'Platform' }] }));
    };
    const removeCourse = (idx) => {
        setProfile(prev => ({ ...prev, courses: prev.courses.filter((_, i) => i !== idx) }));
    };

    // Projects Helpers
    const handleProjectChange = (idx, field, val) => {
        const newProjs = [...profile.projects];
        newProjs[idx][field] = val;
        setProfile(prev => ({ ...prev, projects: newProjs }));
    };
    const addProject = () => {
        setProfile(prev => ({ ...prev, projects: [...prev.projects, { title: 'New Project', description: 'Description' }] }));
    };
    const removeProject = (idx) => {
        setProfile(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }));
    };

    return (
        <div className="container-custom animate-fade-in" style={{ maxWidth: '800px', paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>My Profile</h1>
                <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className="glass-button"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isEditing ? 'rgba(16, 185, 129, 0.2)' : undefined }}
                >
                    {isEditing ? <><FaSave /> Save</> : <><FaEdit /> Edit</>}
                </button>
            </header>

            {/* Main Info Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'var(--gradient-main)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '2.5rem', color: 'white'
                    }}>
                        <FaUser />
                    </div>
                    <div style={{ flex: 1 }}>
                        {isEditing ? (
                            <input
                                value={profile.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                style={{ fontSize: '1.8rem', background: 'transparent', border: 'none', borderBottom: '1px solid white', color: 'white', marginBottom: '1rem', width: '100%' }}
                            />
                        ) : (
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{profile.name}</h2>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaBriefcase size={14} />
                                {isEditing ? (
                                    <input
                                        value={profile.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.2rem' }}
                                    />
                                ) : profile.role || 'User'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaGraduationCap size={14} />
                                {isEditing ? (
                                    <input
                                        value={profile.education}
                                        onChange={(e) => handleChange('education', e.target.value)}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.2rem' }}
                                    />
                                ) : profile.education || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Skills Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCode className="text-primary" /> Skills</span>
                        {isEditing && <button onClick={addSkill} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><FaPlus /></button>}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                        {profile.skills?.length > 0 ? profile.skills.map((skill, idx) => (
                            <span key={idx} style={{
                                background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc',
                                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem',
                                border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', position: 'relative'
                            }}>
                                {isEditing ? (
                                    <>
                                        <input
                                            value={skill.name}
                                            onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '600', width: '100px', marginBottom: '0.2rem' }}
                                        />
                                        <select
                                            value={skill.level}
                                            onChange={(e) => handleSkillChange(idx, 'level', e.target.value)}
                                            style={{ background: '#1e1b4b', border: 'none', color: '#a5b4fc', fontSize: '0.75rem' }}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                        <button onClick={() => removeSkill(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', borderRadius: '50%', border: 'none', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', cursor: 'pointer' }}>X</button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontWeight: '600' }}>{skill.name}</span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{skill.level}</span>
                                    </>
                                )}
                            </span>
                        )) : <span style={{ color: 'var(--text-muted)' }}>No skills added.</span>}
                    </div>
                </div>

                {/* Courses Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBook className="text-primary" /> Courses</span>
                        {isEditing && <button onClick={addCourse} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><FaPlus /></button>}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {profile.courses?.length > 0 ? profile.courses.map((course, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                        <>
                                            <input
                                                value={course.name}
                                                onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                                                placeholder="Course Name"
                                                style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}
                                            />
                                            <input
                                                value={course.platform}
                                                onChange={(e) => handleCourseChange(idx, 'platform', e.target.value)}
                                                placeholder="Platform"
                                                style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent)', fontSize: '0.9rem' }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{course.name}</div>
                                            <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{course.platform}</div>
                                        </>
                                    )}
                                </div>
                                {isEditing && <button onClick={() => removeCourse(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><FaTrash /></button>}
                            </div>
                        )) : <span style={{ color: 'var(--text-muted)' }}>No courses added.</span>}
                    </div>
                </div>

                {/* Projects Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaProjectDiagram className="text-primary" /> Projects</span>
                        {isEditing && <button onClick={addProject} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><FaPlus /></button>}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {profile.projects?.length > 0 ? profile.projects.map((proj, idx) => (
                            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                        <>
                                            <input
                                                value={proj.title}
                                                onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                                                placeholder="Project Title"
                                                style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '600', marginBottom: '0.5rem' }}
                                            />
                                            <textarea
                                                value={proj.description}
                                                onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                                                placeholder="Description"
                                                style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)', fontSize: '0.9rem' }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{proj.title}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{proj.description}</div>
                                        </>
                                    )}
                                </div>
                                {isEditing && <button onClick={() => removeProject(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><FaTrash /></button>}
                            </div>
                        )) : <span style={{ color: 'var(--text-muted)' }}>No projects added.</span>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
