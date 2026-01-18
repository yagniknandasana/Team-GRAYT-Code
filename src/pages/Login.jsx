import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaUser, FaGoogle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const InputField = ({ type, placeholder, icon: Icon, value, onChange, name }) => (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Icon />
        </div>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            className="glass-input"
            style={{ paddingLeft: '3rem' }}
            required
            value={value}
            onChange={onChange}
            autoComplete="off"
        />
    </div>
);

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine if we are in "Signup" mode based on URL
    const isSignupRoute = location.pathname === '/signup';
    const [isSignup, setIsSignup] = useState(isSignupRoute);

    // Sync state if URL changes (though usually component remounts)
    React.useEffect(() => {
        setIsSignup(location.pathname === '/signup');
    }, [location.pathname]);

    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignup) {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Save name to Auth Profile
                await updateProfile(user, { displayName: formData.fullName });

                // Save name to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: formData.fullName,
                    email: formData.email,
                    createdAt: new Date().toISOString()
                }, { merge: true });

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
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleMode = () => {
        // Instead of just setting state, navigate to the other route
        if (isSignup) {
            navigate('/login');
        } else {
            navigate('/signup');
        }
    };

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

                <form onSubmit={handleSubmit} autoComplete="off">
                    {/* Only show Full Name in Signup Mode */}
                    {isSignup && <InputField type="text" name="fullName" placeholder="Full Name" icon={FaUser} value={formData.fullName} onChange={handleChange} />}

                    <InputField type="email" name="email" placeholder="Email" icon={FaEnvelope} value={formData.email} onChange={handleChange} />
                    <InputField type="password" name="password" placeholder="Password" icon={FaLock} value={formData.password} onChange={handleChange} />

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
                        onClick={toggleMode}
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
