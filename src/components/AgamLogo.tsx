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
  const accentColor = '#ea580c'; // Warm orange/amber
  const windowColor = '#f59e0b'; // Warm amber

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { height: 26, iconSize: 22, fontSize: 16, subSize: 6 };
      case 'lg':
        return { height: 42, iconSize: 36, fontSize: 28, subSize: 9 };
      case 'xl':
        return { height: 56, iconSize: 48, fontSize: 36, subSize: 11 };
      case 'md':
      default:
        return { height: 32, iconSize: 28, fontSize: 22, subSize: 7 };
    }
  };

  const dim = getDimensions();

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
        {/* Letter 'g' with roof and window */}
        <circle cx="50" cy="42" r="22" stroke={isWhite ? '#ffffff' : '#ffffff'} strokeWidth="9" />
        {/* House roof inside 'g' */}
        <path
          d="M38 43 L50 31 L62 43"
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
          d="M72 42 V64 C72 75 62 82 50 82 C38 82 30 76 30 68"
          stroke={isWhite ? '#ffffff' : '#ffffff'}
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center gap-1">
        {/* Full vector wordmark: agam with stylized 'g' and underline */}
        <svg
          viewBox="0 0 365 100"
          className="h-auto max-w-full"
          style={{ height: dim.height, width: 'auto' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* First 'a' */}
          <g>
            <circle cx="48" cy="52" r="24" stroke={primaryColor} strokeWidth="12" />
            <path d="M72 28 V76" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
            {/* Orange bar under first 'a' */}
            <path d="M12 90 L68 90" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Stylized 'g' with roof & window */}
          <g>
            {/* Upper circle */}
            <circle cx="125" cy="46" r="26" stroke={primaryColor} strokeWidth="12" />
            
            {/* House roof chevron */}
            <path
              d="M109 46 L125 31 L141 46"
              stroke={primaryColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 4-pane window */}
            <rect x="119" y="48" width="5" height="5" rx="0.8" fill={windowColor} />
            <rect x="126" y="48" width="5" height="5" rx="0.8" fill={windowColor} />
            <rect x="119" y="55" width="5" height="5" rx="0.8" fill={windowColor} />
            <rect x="126" y="55" width="5" height="5" rx="0.8" fill={windowColor} />

            {/* Descending loop */}
            <path
              d="M151 46 V66 C151 79 140 89 125 89 C110 89 100 81 100 72"
              stroke={primaryColor}
              strokeWidth="12"
              strokeLinecap="round"
            />
          </g>

          {/* Second 'a' */}
          <g>
            <circle cx="204" cy="52" r="24" stroke={primaryColor} strokeWidth="12" />
            <path d="M228 28 V76" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
          </g>

          {/* Letter 'm' */}
          <g>
            <path d="M252 28 V76" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
            <path
              d="M252 44 C257 33 269 28 280 28 C291 28 297 34 300 43 C304 33 316 28 327 28 C339 28 346 36 346 50 V76"
              stroke={primaryColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M299 45 V76" stroke={primaryColor} strokeWidth="12" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {showSubtitle && (
        <div
          className={`font-extrabold tracking-[0.2em] uppercase text-[8px] sm:text-[9px] pl-12 sm:pl-14 -mt-1 ${
            isWhite ? 'text-emerald-200' : 'text-slate-700'
          }`}
        >
          MEN'S PG & STAY
        </div>
      )}
    </div>
  );
};
