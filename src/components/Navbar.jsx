import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaUser, FaChartLine, FaBullseye, FaLightbulb } from 'react-icons/fa';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive(to)
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        background: isActive(to) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        color: isActive(to) ? '#a5b4fc' : '#94a3b8',
        padding: '0.6rem 1rem',
        borderRadius: '8px',
        fontWeight: isActive(to) ? '600' : '500',
        border: isActive(to) ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
      }}
    >
      <Icon size={16} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav
      className="glass-panel"
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)',
        maxWidth: '1200px',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        marginTop: 0
      }}
    >
      <Link
        to="/"
        className="text-gradient"
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <img src={logo} alt="Logo" style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px', // Optional: rounded corners like the app style
          objectFit: 'contain'
        }} />
        MedSkill Navigator
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <NavLink to="/dashboard" icon={FaChartLine}>Dashboard</NavLink>
        <NavLink to="/goals" icon={FaBullseye}>Goals</NavLink>
        <NavLink to="/assessment" icon={FaGraduationCap}>Assessment</NavLink>
        <NavLink to="/recommendations" icon={FaLightbulb}>Recommend</NavLink>
        <NavLink to="/profile" icon={FaUser}>Profile</NavLink>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
        <button
          className="glass-button"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer', border: 'none', color: 'inherit' }}
          onClick={() => {
            if (window.confirm("Do you really want to log out?")) {
              import('../firebase').then(({ auth }) => {
                auth.signOut().then(() => {
                  window.location.href = '/';
                });
              });
            }
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
