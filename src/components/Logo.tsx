import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'dark', showTagline = true, className = '' }) => {
  const color = variant === 'dark' ? '#0A0A0A' : '#FFFFFF';
  return (
    <Link to="/" className={`group inline-flex items-center gap-3 ${className}`}>
      <svg
        width="42"
        height="42"
        viewBox="0 0 64 64"
        fill="none"
        className="transition-transform duration-500 group-hover:rotate-[20deg]"
      >
        <circle cx="32" cy="32" r="22" stroke={color} strokeWidth="2.5" />
        <circle cx="32" cy="32" r="16" stroke="#D4AF37" strokeWidth="1" />
        <path d="M32 18 L32 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M32 42 L32 46" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 32 L22 32" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M42 32 L46 32" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="32" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="32" x2="40" y2="36" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="32" r="1.8" fill={color} />
        <rect x="29" y="6" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
        <rect x="29" y="52" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      </svg>
      <div className="flex flex-col leading-none">
        <span
          className="font-serif text-[15px] sm:text-[17px] font-bold tracking-[0.15em]"
          style={{ color }}
        >
          ORIGINAL WATCHES
        </span>
        {showTagline && (
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.3em] mt-1 font-light"
            style={{ color: variant === 'dark' ? '#666' : '#bbb' }}
          >
            TIMELESS · UNMATCHED PRECISION
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
