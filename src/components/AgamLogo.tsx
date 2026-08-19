import React from 'react';

interface AgamLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'white';
  className?: string;
  showSubtitle?: boolean;
}

export const AgamLogo: React.FC<AgamLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSubtitle = true,
}) => {
  const isWhite = variant === 'white';
  const primaryColor = isWhite ? '#ffffff' : '#0a332c'; // Deep forest pine green
  const accentColor = '#ea580c'; // Warm orange roof
  const windowColor = '#f59e0b'; // Warm amber 4-pane window

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { height: 26, iconSize: 22, textClass: 'text-[18px]', subClass: 'text-[7px]' };
      case 'lg':
        return { height: 42, iconSize: 36, textClass: 'text-[28px]', subClass: 'text-[10px]' };
      case 'xl':
        return { height: 56, iconSize: 48, textClass: 'text-[36px]', subClass: 'text-[12px]' };
      case 'md':
      default:
        return { height: 32, iconSize: 28, textClass: 'text-[22px]', subClass: 'text-[8px]' };
    }
  };

  const dim = getDimensions();

  // If icon-only variant is requested (e.g. app icon, header badge)
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`shrink-0 ${className}`}
        style={{ width: dim.iconSize, height: dim.iconSize }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="22" fill={isWhite ? 'rgba(255,255,255,0.15)' : '#0a332c'} />
        {/* Letter 'g' with house roof and window */}
        <circle cx="50" cy="42" r="20" stroke={isWhite ? '#ffffff' : '#ffffff'} strokeWidth="8" />
        {/* House roof */}
        <path
          d="M38 42 L50 30 L62 42"
          stroke={accentColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 4-pane window */}
        <rect x="44.5" y="44" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
        <rect x="51" y="44" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
        <rect x="44.5" y="50.5" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
        <rect x="51" y="50.5" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
        {/* 'g' descending loop */}
        <path
          d="M70 42 V62 C70 73 60 80 48 80 C36 80 28 74 28 66"
          stroke={isWhite ? '#ffffff' : '#ffffff'}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Full clean in-app wordmark - using standard clean typography and emblem to prevent collapse & overlapping
  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center gap-1.5">
        {/* House Logo Emblem (Roof, Window, Letter 'g') */}
        <svg
          viewBox="0 0 100 100"
          className="shrink-0"
          style={{ width: dim.iconSize, height: dim.iconSize }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="42" r="20" stroke={primaryColor} strokeWidth="8" />
          <path
            d="M38 42 L50 30 L62 42"
            stroke={accentColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="44.5" y="44" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
          <rect x="51" y="44" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
          <rect x="44.5" y="50.5" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
          <rect x="51" y="50.5" width="4.5" height="4.5" rx="0.8" fill={windowColor} />
          <path
            d="M70 42 V62 C70 73 60 80 48 80 C36 80 28 74 28 66"
            stroke={primaryColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        {/* Clear, Spacious Brand Name */}
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight ${dim.textClass}`}
            style={{ color: primaryColor }}
          >
            agam
          </span>
          {showSubtitle && (
            <span
              className={`font-extrabold tracking-widest uppercase mt-0.5 ${dim.subClass}`}
              style={{ color: isWhite ? 'rgba(255,255,255,0.8)' : '#047857' }}
            >
              MEN'S PG & STAY
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
