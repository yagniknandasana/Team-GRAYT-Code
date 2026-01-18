import React from 'react';
import { FaHeart, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--glass-border)',
            padding: '3rem 2rem',
            marginTop: 'auto',
            textAlign: 'center',
            color: 'var(--text-muted)'
        }}>
            <div className="container-custom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                {/* Logo & Name */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>MedSkill Navigator</h3>
                    <p style={{ fontSize: '0.9rem' }}>Holistic Academic and Professional Skill Intelligence System in Healthcare</p>
                </div>

                {/* Social Links */}
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '1.2rem' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} className="hover:text-primary"><FaGithub /></a>
                    <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} className="hover:text-primary"><FaLinkedin /></a>
                    <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} className="hover:text-primary"><FaTwitter /></a>
                </div>

                {/* Copyright */}
                <div style={{ fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', width: '100%', maxWidth: '600px' }}>
                    <p>
                        © {new Date().getFullYear()} Team GRAYT. Built with <FaHeart style={{ color: '#ef4444', display: 'inline', fontSize: '0.8rem' }} /> for the Future.
                    </p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Privacy Policy</a>
                        <a href="#" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
