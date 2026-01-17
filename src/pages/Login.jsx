import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaUser, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const Login = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.type === 'text' && e.target.placeholder === 'Full Name' ? 'fullName' : e.target.type]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                // Could save fullName to profile here, but let's do it in SetupProfile
                navigate('/setup-profile');
            } else {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            // Check if new user? determining redirect logic is harder with popup without custom claims, 
            // default to dashboard or handle in a global auth listener.
            // For simplicity:
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const InputField = ({ type, placeholder, icon: Icon, value }) => (
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Icon />
            </div>
            <input
                type={type}
                placeholder={placeholder}
                className="glass-input"
                style={{ paddingLeft: '3rem' }}
                required
                value={value}
                onChange={handleChange}
            />
        </div>
    );

    return (
        <div className="flex-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isSignup ? 'Start your skill intelligence journey' : 'Access your dashboard'}
                    </p>
                </div>

                {error && <div style={{ color: '#f43f5e', marginBottom: '1rem', textAlign: 'center', background: 'rgba(244,63,94,0.1)', padding: '0.5rem', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {isSignup && <InputField type="text" placeholder="Full Name" icon={FaUser} value={formData.fullName} />}
                    <InputField type="email" placeholder="Email" icon={FaEnvelope} value={formData.email} />
                    <InputField type="password" placeholder="Password" icon={FaLock} value={formData.password} />

                    <button
                        type="submit"
                        className="glass-button"
                        style={{ width: '100%', marginTop: '1rem', background: 'var(--primary)', borderColor: 'var(--primary)' }}
                    >
                        {isSignup ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR CONTINUE WITH</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                </div>

                <button onClick={handleGoogleSignIn} className="glass-button" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <FaGoogle /> Google
                </button>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                    </span>
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {isSignup ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
