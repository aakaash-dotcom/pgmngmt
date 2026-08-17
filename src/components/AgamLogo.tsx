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
  const primaryColor = isWhite ? '#ffffff' : '#073B32'; // Deep forest pine green
  const accentColor = '#E8821B'; // Warm orange/amber

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { height: 26, iconSize: 24 };
      case 'lg':
        return { height: 42, iconSize: 36 };
      case 'xl':
        return { height: 56, iconSize: 48 };
      case 'md':
      default:
        return { height: 32, iconSize: 28 };
    }
  };

  const dim = getDimensions();

  if (variant === 'icon') {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 ${className}`}
        style={{ width: dim.iconSize, height: dim.iconSize }}
      >
        <img
          src="/agam-icon.svg"
          alt="Agam Gents PG"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="140 330 730 420"
        className="h-auto max-w-full"
        style={{ height: dim.height, width: 'auto' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* First letter 'a' */}
        <g transform="translate(162, 360)">
          {/* Orange horizontal underline bar under first 'a' */}
          <rect x="18" y="200" width="165" height="14" rx="7" fill={accentColor} />

          {/* Outer circle of 'a' */}
          <path
            d="M 130,0 C 58.2,0 0,58.2 0,130 C 0,201.8 58.2,260 130,260 C 178,260 219.6,234 242.4,195.2 L 242.4,254 L 272,254 L 272,0 L 242.4,0 L 242.4,64.8 C 219.6,26 178,0 130,0 Z M 136,36 C 187.9,36 230,78.1 230,130 C 230,181.9 187.9,224 136,224 C 84.1,224 42,181.9 42,130 C 42,78.1 84.1,36 136,36 Z"
            fill={primaryColor}
          />

          {/* Stylized 'g' with House Gable Roof and 4-Pane Amber Window */}
          <g transform="translate(170, 0)">
            {/* House Roof Gable Chevron inside 'g' */}
            <path
              d="M 160,82 L 98,124 L 112,142 L 160,109 L 208,142 L 222,124 Z"
              fill={primaryColor}
            />

            {/* 4-Pane Amber / Orange Glowing Window */}
            <g transform="translate(142, 142)">
              <rect x="0" y="0" width="15" height="15" rx="2" fill={accentColor} />
              <rect x="21" y="0" width="15" height="15" rx="2" fill={accentColor} />
              <rect x="0" y="21" width="15" height="15" rx="2" fill={accentColor} />
              <rect x="21" y="21" width="15" height="15" rx="2" fill={accentColor} />
            </g>

            {/* Letter 'g' outline with circular upper bowl and smooth bottom hook */}
            <path
              d="M 160,0 C 88.2,0 30,58.2 30,130 C 30,201.8 88.2,260 160,260 C 208,260 249.6,234 272.4,195.2 L 272.4,248 C 272.4,306 230,344 165,344 C 115,344 76,318 64,286 L 30,298 C 48,348 100,380 165,380 C 255,380 308,328 308,242 L 308,0 L 272.4,0 L 272.4,64.8 C 249.6,26 208,0 160,0 Z M 166,36 C 217.9,36 260,78.1 260,130 C 260,181.9 217.9,224 166,224 C 114.1,224 72,181.9 72,130 C 72,78.1 114.1,36 166,36 Z"
              fill={primaryColor}
            />
          </g>

          {/* Second letter 'a' */}
          <g transform="translate(333, 0)">
            <path
              d="M 130,0 C 58.2,0 0,58.2 0,130 C 0,201.8 58.2,260 130,260 C 178,260 219.6,234 242.4,195.2 L 242.4,254 L 272,254 L 272,0 L 242.4,0 L 242.4,64.8 C 219.6,26 178,0 130,0 Z M 136,36 C 187.9,36 230,78.1 230,130 C 230,181.9 187.9,224 136,224 C 84.1,224 42,181.9 42,130 C 42,78.1 84.1,36 136,36 Z"
              fill={primaryColor}
            />
          </g>

          {/* Letter 'm' with double rounded arch */}
          <g transform="translate(584, 0)">
            <path
              d="M 0,0 L 36,0 L 36,52 C 54,18 84,0 120,0 C 158,0 185,18 198,54 C 216,18 248,0 286,0 C 334,0 360,32 360,88 L 360,254 L 324,254 L 324,96 C 324,58 308,36 272,36 C 236,36 216,62 216,102 L 216,254 L 180,254 L 180,96 C 180,58 164,36 128,36 C 92,36 72,62 72,102 L 72,254 L 36,254 L 0,254 Z"
              fill={primaryColor}
              transform="scale(0.88 1)"
            />
          </g>

          {/* Tagline: MEN'S PG & STAY */}
          {showSubtitle && (
            <g transform="translate(325, 308)" fill={primaryColor}>
              {/* M */}
              <path d="M 0,0 L 5.5,0 L 15.5,25.5 L 25.5,0 L 31,0 L 31,34 L 25.5,34 L 25.5,9.5 L 17.5,29.5 L 13.5,29.5 L 5.5,9.5 L 5.5,34 L 0,34 Z"/>
              {/* E */}
              <path d="M 43,0 L 66,0 L 66,5.5 L 49,5.5 L 49,14.5 L 63.5,14.5 L 63.5,20 L 49,20 L 49,28.5 L 66.5,28.5 L 66.5,34 L 43,34 Z"/>
              {/* N */}
              <path d="M 77,0 L 83,0 L 101,24.5 L 101,0 L 106.5,0 L 106.5,34 L 101,34 L 83,9.5 L 83,34 L 77,34 Z"/>
              {/* ' (Apostrophe) */}
              <path d="M 112,0 L 117,0 L 115,10 L 110,10 Z"/>
              {/* S */}
              <path d="M 136,7 C 133,3.5 128.5,2 123.5,2 C 117.5,2 114,5 114,8.5 C 114,12.5 117.5,14.5 123.5,16 L 128,17 C 136.5,19 141.5,22.5 141.5,28 C 141.5,34.5 135,38 126,38 C 118,38 112,34.5 108.5,29.5 L 113.5,25.5 C 116.5,29.5 121,32 126,32 C 131.5,32 135,29.5 135,26.5 C 135,23.5 132,21.5 126.5,20.2 L 122,19 C 115,17.2 110,14 110,8.5 C 110,3.5 116,0 123.5,0 C 130,0 135.5,2.5 139.5,7 Z" transform="translate(10, -2)"/>

              {/* PG */}
              <g transform="translate(175, 0)">
                {/* P */}
                <path d="M 0,0 L 16,0 C 23.5,0 28.5,4 28.5,11.5 C 28.5,19 23.5,23 16,23 L 6,23 L 6,34 L 0,34 Z M 6,5.5 L 6,17.5 L 15.5,17.5 C 20,17.5 22.5,15.5 22.5,11.5 C 22.5,7.5 20,5.5 15.5,5.5 Z"/>
                {/* G */}
                <path d="M 64,10 L 59,13.5 C 56.5,8.8 52,5.5 45.5,5.5 C 36.5,5.5 29.5,12.5 29.5,22.5 C 29.5,32.5 36.5,39.5 46,39.5 C 53.5,39.5 58.5,35.5 61,30 L 47,30 L 47,25 L 66.5,25 L 66.5,34 C 62,39.8 55,44 46,44 C 33,44 24,34.5 24,22.5 C 24,10.5 33,1 46,1 C 54.5,1 61,4.5 64,10 Z" transform="translate(5, -5)"/>
              </g>

              {/* & */}
              <g transform="translate(262, 0)">
                <path d="M 23,26.5 C 21,29 18,31 14.5,31 C 9,31 5,27 5,21.5 C 5,17.5 7.5,14.5 11,12 C 9.5,9.5 8.5,7.5 8.5,5.5 C 8.5,2.5 11,0 14.5,0 C 18,0 20.5,2.5 20.5,5.5 C 20.5,8.5 18.5,11 15.5,13.5 C 18.5,16.5 22,19.5 25,22 L 27.5,19.5 L 30.5,22.5 L 27,25.5 L 31.5,30.5 L 28,32 L 23,26.5 Z M 13.5,16 C 11,18 9.5,20 9.5,22 C 9.5,24.5 11.5,26.5 14.5,26.5 C 17,26.5 19.5,24.5 21.5,22 C 18.5,19.5 15.5,17.5 13.5,16 Z M 13,5.5 C 13,7 13.5,8.5 15,10 C 16,8.5 17,7 17,5.5 C 17,4 16,3 15,3 C 14,3 13,4 13,5.5 Z"/>
              </g>

              {/* STAY */}
              <g transform="translate(310, 0)">
                {/* S */}
                <path d="M 21,6 C 19,3 16,2 13,2 C 9,2 6.5,4 6.5,7 C 6.5,10 9,11.5 13,12.5 L 16,13.2 C 22,14.5 25.5,17 25.5,22 C 25.5,28 20,31.5 13,31.5 C 7.5,31.5 3.5,29 1,25 L 5,22 C 7,25 10,27 13.5,27 C 17.5,27 20.5,25 20.5,22.5 C 20.5,19.5 18,18 14,17 L 11,16.5 C 6,15.2 2,12.5 2,7.5 C 2,3 6.5,0 12.5,0 C 17,0 21,2 23.5,5.5 Z" transform="translate(0, 1.5)"/>
                {/* T */}
                <path d="M 32,0 L 54,0 L 54,5 L 45.5,5 L 45.5,32 L 40.5,32 L 40.5,5 L 32,5 Z"/>
                {/* A */}
                <path d="M 68,0 L 74.5,0 L 88,32 L 82.5,32 L 79,24 L 64,24 L 60.5,32 L 55,32 Z M 71.5,6.5 L 66,19 L 77,19 Z"/>
                {/* Y */}
                <path d="M 92,0 L 98,0 L 106,15 L 114,0 L 120,0 L 109,19.5 L 109,32 L 103.5,32 L 103.5,19.5 Z"/>
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
