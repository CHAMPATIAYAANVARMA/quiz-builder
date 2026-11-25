import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  onClick,
}) => {
  const iconSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-10 w-10' : 'h-9 w-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 text-left ${
        onClick ? 'cursor-pointer focus:outline-none group' : ''
      }`}
    >
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-sm ring-1 ring-indigo-500/20 transition-transform duration-200 ${
          onClick ? 'group-hover:scale-105' : ''
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 3.5 3.5" />
          <path d="m8.5 11.2 1.8 1.8 3.6-3.8" />
        </svg>
      </div>
      <div>
        <span
          className={`font-display font-extrabold tracking-tight text-slate-900 ${textSize} block leading-none`}
        >
          QUIZ<span className="text-indigo-600">ORA</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 tracking-wide">
            Learning Studio
          </span>
        )}
      </div>
    </Wrapper>
  );
};
