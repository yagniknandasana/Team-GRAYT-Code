import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaCode, FaBook, FaProjectDiagram, FaPlus, FaTrash } from 'react-icons/fa';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const SetupProfile = () => {
    const navigate = useNavigate();

    // State for all sections
    const [formData, setFormData] = useState({
        education: 'Undergraduate',
        role: '',
        skills: [{ name: '', level: 'Intermediate' }], // Initial empty skill
        courses: [],
        projects: []
    });

    // Handlers
    const handleBasicChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Skill Handlers
    const handleSkillChange = (index, field, value) => {
        const newSkills = [...formData.skills];
        newSkills[index][field] = value;
        setFormData({ ...formData, skills: newSkills });
    };
    const addSkill = () => {
        setFormData({ ...formData, skills: [...formData.skills, { name: '', level: 'Beginner' }] });
    };
    const removeSkill = (index) => {
        const newSkills = formData.skills.filter((_, i) => i !== index);
        setFormData({ ...formData, skills: newSkills });
    };

    // Course Handlers
    const addCourse = () => {
        setFormData({ ...formData, courses: [...formData.courses, { name: '', platform: '' }] });
    };
    const handleCourseChange = (index, field, value) => {
        const newCourses = [...formData.courses];
        newCourses[index][field] = value;
        setFormData({ ...formData, courses: newCourses });
    };
    const removeCourse = (index) => {
        const newCourses = formData.courses.filter((_, i) => i !== index);
        setFormData({ ...formData, courses: newCourses });
    };

    // Project Handlers
    const addProject = () => {
        setFormData({ ...formData, projects: [...formData.projects, { title: '', description: '' }] });
    };
    const handleProjectChange = (index, field, value) => {
        const newProjects = [...formData.projects];
        newProjects[index][field] = value;
        setFormData({ ...formData, projects: newProjects });
    };
    const removeProject = (index) => {
        const newProjects = formData.projects.filter((_, i) => i !== index);
        setFormData({ ...formData, projects: newProjects });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                await setDoc(doc(db, "users", user.uid), {
                    ...formData,
                    email: user.email,
                    name: user.displayName || 'User',
                    updatedAt: new Date()
                }, { merge: true });
                console.log('Profile Saved to Firestore');
                navigate('/goals');
            } else {
                // Fallback for dev/demo if auth fails or skipped
                localStorage.setItem('userProfile', JSON.stringify(formData));
                navigate('/goals');
            }
        } catch (error) {
            console.error("Error writing document: ", error);
            alert("Failed to save profile. Check console.");
        }
    };

    return (
        <div className="container-custom animate-fade-in" style={{ paddingBottom: '3rem', maxWidth: '800px' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Setup Your Profile</h1>
                <p style={{ color: 'var(--text-muted)' }}>Tell us about you so we can personalize your intelligence system.</p>
            </header>

            <form onSubmit={handleSubmit}>
                {/* Section A: Context */}
                <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaGraduationCap className="text-primary" /> Academic & Professional Context
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Education Level *</label>
                            <select
                                name="education"
                                value={formData.education}
                                onChange={handleBasicChange}
                                className="glass-input"
                                style={{ background: 'rgba(0,0,0,0.4)' }}
                            >
                                <option value="Diploma">Diploma</option>
                                <option value="Undergraduate">Undergraduate</option>
                                <option value="Postgraduate">Postgraduate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Role</label>
                            <input
                                type="text"
                                name="role"
                                placeholder="e.g. Student, Intern"
                                value={formData.role}
                                onChange={handleBasicChange}
                                className="glass-input"
                            />
                        </div>
                    </div>
                </section>

                {/* Section B: Skills */}
                <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCode className="text-primary" /> Skills (Core Input)
                        </h3>
                        <button type="button" onClick={addSkill} className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <FaPlus /> Add Skill
                        </button>
                    </div>

                    {formData.skills.map((skill, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Skill Name (e.g. Python)"
                                className="glass-input"
                                value={skill.name}
                                onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                required
                            />
                            <select
                                className="glass-input"
                                style={{ background: 'rgba(0,0,0,0.4)' }}
                                value={skill.level}
                                onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                    {formData.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>At least one skill is recommended.</p>}
                </section>

                {/* Section C: Courses */}
                <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaBook className="text-primary" /> Courses Completed
                        </h3>
                        <button type="button" onClick={addCourse} className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <FaPlus /> Add Course
                        </button>
                    </div>

                    {formData.courses.map((course, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Course Name"
                                className="glass-input"
                                value={course.name}
                                onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Platform (e.g. Coursera)"
                                className="glass-input"
                                value={course.platform}
                                onChange={(e) => handleCourseChange(index, 'platform', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeCourse(index)}
                                style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </section>

                {/* Section D: Projects */}
                <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaProjectDiagram className="text-primary" /> Projects
                        </h3>
                        <button type="button" onClick={addProject} className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <FaPlus /> Add Project
                        </button>
                    </div>

                    {formData.projects.map((project, index) => (
                        <div key={index} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Project Title"
                                    className="glass-input"
                                    value={project.title}
                                    onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeProject(index)}
                                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            <textarea
                                placeholder="Short Description (1-2 lines)"
                                className="glass-input"
                                rows="2"
                                value={project.description}
                                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                            ></textarea>
                        </div>
                    ))}
                </section>

                {/* Section E: Save */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        type="submit"
                        className="glass-button"
                        style={{
                            background: 'var(--primary)',
                            borderColor: 'var(--primary)',
                            padding: '1rem 3rem',
                            fontSize: '1.2rem',
                            boxShadow: '0 0 20px var(--primary-glow)'
                        }}
                    >
                        Save & Continue
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SetupProfile;
