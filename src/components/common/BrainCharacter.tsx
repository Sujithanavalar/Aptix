import { useEffect, useState } from 'react';

interface BrainCharacterProps {
  className?: string;
  animate?: boolean;
}

export default function BrainCharacter({ className = '', animate = true }: BrainCharacterProps) {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animate]);

  return (
    <div className={`inline-block ${animate ? 'transition-transform duration-500' : ''} ${bounce ? 'animate-bounce' : ''} ${className}`}>
      <svg
        width="80"
        height="100"
        viewBox="0 0 80 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Brain body */}
        <g className="brain-body">
          {/* Main brain shape */}
          <ellipse cx="40" cy="35" rx="28" ry="30" className="fill-primary/90" />
          
          {/* Brain wrinkles/texture */}
          <path
            d="M 20 25 Q 25 20 30 25 Q 35 30 40 25 Q 45 20 50 25 Q 55 30 60 25"
            className="stroke-primary stroke-2 fill-none"
            strokeLinecap="round"
          />
          <path
            d="M 22 35 Q 27 30 32 35 Q 37 40 42 35 Q 47 30 52 35 Q 57 40 58 35"
            className="stroke-primary stroke-2 fill-none"
            strokeLinecap="round"
          />
          <path
            d="M 24 45 Q 29 40 34 45 Q 39 50 44 45 Q 49 40 54 45"
            className="stroke-primary stroke-2 fill-none"
            strokeLinecap="round"
          />
          
          {/* Brain hemispheres division */}
          <line
            x1="40"
            y1="10"
            x2="40"
            y2="60"
            className="stroke-primary/50 stroke-1"
            strokeLinecap="round"
          />
        </g>

        {/* Eyes */}
        <g className="eyes">
          {/* Left eye white */}
          <ellipse cx="30" cy="32" rx="5" ry="6" fill="white" />
          {/* Left eye pupil */}
          <circle cx="31" cy="33" r="3" className="fill-foreground" />
          <circle cx="32" cy="32" r="1.5" fill="white" />
          
          {/* Right eye white */}
          <ellipse cx="50" cy="32" rx="5" ry="6" fill="white" />
          {/* Right eye pupil */}
          <circle cx="51" cy="33" r="3" className="fill-foreground" />
          <circle cx="52" cy="32" r="1.5" fill="white" />
        </g>

        {/* Smile */}
        <path
          d="M 32 42 Q 40 46 48 42"
          className="stroke-foreground stroke-2 fill-none"
          strokeLinecap="round"
        />

        {/* Arms */}
        <g className="arms">
          {/* Left arm */}
          <path
            d="M 15 40 Q 10 45 12 50"
            className="stroke-primary stroke-3 fill-none"
            strokeLinecap="round"
          />
          {/* Left hand */}
          <circle cx="12" cy="50" r="4" className="fill-primary/90" />
          <path
            d="M 10 50 L 8 52 M 12 50 L 12 53 M 14 50 L 16 52"
            className="stroke-primary stroke-1"
            strokeLinecap="round"
          />
          
          {/* Right arm */}
          <path
            d="M 65 40 Q 70 45 68 50"
            className="stroke-primary stroke-3 fill-none"
            strokeLinecap="round"
          />
          {/* Right hand */}
          <circle cx="68" cy="50" r="4" className="fill-primary/90" />
          <path
            d="M 66 50 L 64 52 M 68 50 L 68 53 M 70 50 L 72 52"
            className="stroke-primary stroke-1"
            strokeLinecap="round"
          />
        </g>

        {/* Legs */}
        <g className="legs">
          {/* Left leg */}
          <path
            d="M 32 62 L 28 78"
            className="stroke-primary stroke-3 fill-none"
            strokeLinecap="round"
          />
          {/* Left foot */}
          <ellipse cx="28" cy="82" rx="6" ry="4" className="fill-primary/90" />
          
          {/* Right leg */}
          <path
            d="M 48 62 L 52 78"
            className="stroke-primary stroke-3 fill-none"
            strokeLinecap="round"
          />
          {/* Right foot */}
          <ellipse cx="52" cy="82" rx="6" ry="4" className="fill-primary/90" />
        </g>

        {/* Sparkles around brain */}
        <g className="sparkles opacity-70">
          <circle cx="15" cy="20" r="2" className="fill-secondary" />
          <circle cx="65" cy="18" r="1.5" className="fill-accent" />
          <circle cx="70" cy="35" r="2" className="fill-secondary" />
          <circle cx="10" cy="35" r="1.5" className="fill-accent" />
        </g>
      </svg>
    </div>
  );
}
