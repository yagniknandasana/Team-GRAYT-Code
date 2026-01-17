import React, { useState } from 'react';
import { FaHeartbeat, FaLeaf, FaCity, FaCheckCircle, FaStethoscope, FaSpa } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Goals = () => {
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);
    const navigate = useNavigate();

    const domains = [
        {
            id: 'health',
            title: 'Healthcare Technology',
            description: 'Innovate in medical devices, health informatics, and patient care systems.',
            icon: FaHeartbeat,
            color: '#ec4899' // Pink
        },
        {
            id: 'agri',
            title: 'Agricultural Technology',
            description: 'Transform farming with IoT, precision agriculture, and sustainable food systems.',
            icon: FaLeaf,
            color: '#22c55e' // Green
        },
        {
            id: 'city',
            title: 'Smart City & Urban Systems',
            description: 'Design the future of urban living with intelligent infrastructure and data.',
            icon: FaCity,
            color: '#06b6d4' // Cyan
        }
    ];

    const medicalGroups = {
        modern: [
            'Gynecology & Obstetrics',
            'Orthopedics',
            'Pediatrics',
            'General Medicine',
            'General Surgery',
            'Cardiology',
            'Neurology',
            'Dermatology',
            'Psychiatry',
            'Anesthesiology'
        ],
        ayush: [
            'Ayurveda',
            'Homeopathy',
            'Unani Medicine',
            'Siddha Medicine',
            'Yoga & Naturopathy',
            'Ayurvedic Pharmacy & Herbal Technology',
            'Integrative Medicine (Allopathy + AYUSH)'
        ]
    };

    const handleSelect = (id) => {
        setSelectedGoal(id);
        setSelectedSpecialization(null); // Reset sub-selection when changing main goal
    };

    const handleContinue = async () => {
        if (selectedGoal) {
            const goalData = {
                domain: selectedGoal,
                specialization: selectedSpecialization
            };

            try {
                const user = auth.currentUser;
                if (user) {
                    await setDoc(doc(db, "users", user.uid), {
                        goal: goalData
                    }, { merge: true });
                    navigate('/assessment');
                } else {
                    localStorage.setItem('userGoal', JSON.stringify(goalData));
                    navigate('/assessment');
                }
            } catch (error) {
                console.error("Error saving goal:", error);
                navigate('/assessment'); // Continue anyway for demo
            }
        }
    };

    return (
        <div className="container-custom animate-fade-in" style={{ paddingBottom: '3rem', textAlign: 'center' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Path</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Select the emerging sector you want to master.</p>
            </header>

            {/* Main Domains */}
            <div className="grid-cols-auto" style={{ maxWidth: '1000px', margin: '0 auto 3rem auto' }}>
                {domains.map((domain) => (
                    <div
                        key={domain.id}
                        className="glass-panel"
                        onClick={() => handleSelect(domain.id)}
                        style={{
                            padding: '2rem',
                            cursor: 'pointer',
                            position: 'relative',
                            textAlign: 'left',
                            border: selectedGoal === domain.id ? `2px solid ${domain.color}` : '1px solid var(--glass-border)',
                            backgroundColor: selectedGoal === domain.id ? 'rgba(255,255,255,0.08)' : 'var(--bg-card)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {selectedGoal === domain.id && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: domain.color }}>
                                <FaCheckCircle size={24} />
                            </div>
                        )}

                        <div style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            background: `rgba(${parseInt(domain.color.slice(1, 3), 16)}, ${parseInt(domain.color.slice(3, 5), 16)}, ${parseInt(domain.color.slice(5, 7), 16)}, 0.2)`,
                            color: domain.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', marginBottom: '1.5rem'
                        }}>
                            <domain.icon />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>{domain.title}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{domain.description}</p>
                    </div>
                ))}
            </div>

            {/* Healthcare Specialization Section */}
            {selectedGoal === 'health' && (
                <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'left' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Select Your Specialization</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Modern Medicine */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899' }}>
                                <FaStethoscope /> Modern Medicine
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {medicalGroups.modern.map((spec) => (
                                    <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input
                                            type="radio"
                                            name="specialization"
                                            value={spec}
                                            checked={selectedSpecialization === spec}
                                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                                            style={{ accentColor: '#ec4899', width: '1.2rem', height: '1.2rem' }}
                                        />
                                        {spec}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* AYUSH */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
                                <FaSpa /> AYUSH & Alternative
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {medicalGroups.ayush.map((spec) => (
                                    <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input
                                            type="radio"
                                            name="specialization"
                                            value={spec}
                                            checked={selectedSpecialization === spec}
                                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                                            style={{ accentColor: '#22c55e', width: '1.2rem', height: '1.2rem' }}
                                        />
                                        {spec}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                className="glass-button"
                onClick={handleContinue}
                disabled={!selectedGoal || (selectedGoal === 'health' && !selectedSpecialization)}
                style={{
                    fontSize: '1.2rem', padding: '1rem 3rem',
                    background: (!selectedGoal || (selectedGoal === 'health' && !selectedSpecialization)) ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                    cursor: (!selectedGoal || (selectedGoal === 'health' && !selectedSpecialization)) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedGoal || (selectedGoal === 'health' && !selectedSpecialization)) ? 0.5 : 1
                }}
            >
                Continue to Assessment
            </button>
        </div>
    );
};

export default Goals;
