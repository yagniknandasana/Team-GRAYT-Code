import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // We might modify Navbar or use a simplified one, but reusing is safely efficient
import Footer from '../components/Footer';
import { FaUserGraduate, FaChartLine, FaRobot, FaBriefcase, FaArrowRight } from 'react-icons/fa';
import logo from '../assets/logo.jpg';

const Home = () => {
    return (
        <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Custom Navbar for Home if needed, or we can assume MainLayout handles it. 
                However, usually Home is outside MainLayout if MainLayout requires Auth.
                For now, let's include a simple Header manually or rely on MainLayout? 
                Actually, putting Home outside MainLayout gives us full control.
             */}
            <nav style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                width: '100%',
                top: 0,
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                background: 'rgba(15, 23, 42, 0.7)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={logo} alt="M" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        MedSkill Navigator
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" className="glass-button" style={{ border: 'none', background: 'transparent' }}>Sign In</Link>
                    <Link to="/signup" className="glass-button" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>Get Started</Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header style={{
                marginTop: '80px',
                padding: '8rem 2rem 6rem',
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 50%)'
            }}>
                <div className="container-custom">
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '50px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        marginBottom: '2rem',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        🚀  Bridging Healthcare Education to Industry
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: '1.1', marginBottom: '1.5rem', fontWeight: '800' }}>
                        Unlock Your Potential with <br />
                        <span className="text-gradient">Intelligent Skill Tracking</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                        MedSkill Navigator helps students and professionals in Healthcare analyze skill gaps, get AI-powered learning paths, and achieve career mastery.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/signup" className="glass-button" style={{
                            fontSize: '1.2rem',
                            padding: '1rem 3rem',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            Start Your Journey <FaArrowRight />
                        </Link>
                        <a href="#features" className="glass-button" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                            Learn More
                        </a>
                    </div>
                </div>
            </header>

            {/* FEATURES */}
            <section id="features" style={{ padding: '6rem 2rem' }}>
                <div className="container-custom">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why Choose MedSkill Navigator?</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Everything you need to bridge the gap between where you are and where you want to be.</p>
                    </div>

                    <div className="grid-cols-3" style={{ gap: '2rem' }}>
                        <FeatureCard
                            icon={<FaChartLine />}
                            title="Skill Gap Analysis"
                            desc="Visualize your strengths and weaknesses against real-world industry standards."
                        />
                        <FeatureCard
                            icon={<FaRobot />}
                            title="AI Recommendations"
                            desc="Get personalized course and project suggestions powered by advanced AI."
                        />
                        <FeatureCard
                            icon={<FaBriefcase />}
                            title="Career Roadmaps"
                            desc="Follow a step-by-step timeline from foundational skills to job readiness."
                        />
                    </div>
                </div>
            </section>

            {/* STATS / TRUST (Micro section) */}
            <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container-custom" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Healthcare</div>
                        <div style={{ color: 'var(--text-muted)' }}>Specialized Domain</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>AI-Driven</div>
                        <div style={{ color: 'var(--text-muted)' }}>Personalized Learning</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80' }}>100%</div>
                        <div style={{ color: 'var(--text-muted)' }}>Skill Transparency</div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-panel hover-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

export default Home;
