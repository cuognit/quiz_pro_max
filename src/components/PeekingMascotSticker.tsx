import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeartParticle {
  id: number;
  x: number;
  scale: number;
}

export const PeekingMascotSticker: React.FC = () => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [speechText, setSpeechText] = useState<string | null>(null);

  const handleClickMascot = () => {
    // Generate 3-5 little hearts
    const newHearts: HeartParticle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: (Math.random() - 0.5) * 60,
      scale: 0.8 + Math.random() * 0.5
    }));
    setHearts(prev => [...prev.slice(-10), ...newHearts]);

    const quotes = [
      'A+ trong tầm tay! 💯',
      'Tự tin lên nha! 🍀',
      'Chiến hết mình! 🔥',
      'Đỉnh nóc kịch trần! 🚀',
      'Cố lên bạn ơi! ✨'
    ];
    setSpeechText(quotes[Math.floor(Math.random() * quotes.length)]);

    setTimeout(() => {
      setSpeechText(null);
    }, 2000);
  };

  return (
    <div className="absolute -top-16 left-6 z-30 pointer-events-auto select-none">
      {/* Speech bubble */}
      <AnimatePresence>
        {speechText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-9 -left-2 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-[11px] font-bold shadow-lg border border-amber-300 dark:border-amber-400 whitespace-nowrap z-40 drop-shadow-md"
          >
            {speechText}
            {/* Bubble arrow */}
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-amber-300 dark:border-amber-400 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating hearts on click */}
      {hearts.map(h => (
        <motion.span
          key={h.id}
          initial={{ opacity: 1, y: 0, x: h.x, scale: h.scale }}
          animate={{ opacity: 0, y: -45, scale: h.scale * 1.3 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setHearts(prev => prev.filter(item => item.id !== h.id));
          }}
          className="absolute -top-4 left-6 text-base pointer-events-none z-40"
        >
          ❤️
        </motion.span>
      ))}

      {/* Main Mascot Container */}
      <motion.div
        onClick={handleClickMascot}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [-3, 3, -3],
          rotate: [-1.5, 1.5, -1.5]
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="relative cursor-pointer group"
        title="Chạm vào mình để nhận năng lượng may mắn!"
      >
        <svg
          width="96"
          height="76"
          viewBox="0 0 120 95"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Flag behind paw */}
          <motion.g
            style={{ transformOrigin: '88px 52px' }}
            animate={{ rotate: [-10, 16, -10] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {/* Flag stick */}
            <line x1="88" y1="52" x2="114" y2="12" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
            {/* Flag cloth */}
            <path
              d="M112 14L85 24C83 25 83 28 85 29L108 38L112 14Z"
              fill="url(#flagGradient)"
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Text on flag */}
            <text
              x="100"
              y="27"
              fill="#FFFFFF"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              transform="rotate(6, 100, 27)"
            >
              CỐ LÊN!
            </text>
          </motion.g>

          {/* Cat Left Ear */}
          <motion.path
            d="M24 38C22 25 29 16 38 24C44 29 38 42 24 38Z"
            fill="#FFFDF7"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path d="M27 34C26 27 29 22 34 26C38 29 34 36 27 34Z" fill="#FDA4AF" />

          {/* Cat Right Ear */}
          <motion.path
            d="M78 24C87 16 94 25 92 38C78 42 72 29 78 24Z"
            fill="#FFFDF7"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path d="M82 26C87 22 90 27 89 34C82 36 78 29 82 26Z" fill="#FDA4AF" />

          {/* Cat Round Head & Body */}
          <path
            d="M20 72C15 50 26 32 58 32C90 32 101 50 96 72C94 77 90 80 84 80H32C26 80 22 77 20 72Z"
            fill="#FFFDF7"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Head highlights / fur */}
          <path d="M52 32C52 36 56 38 58 38C60 38 64 36 64 32" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Eyes (Animated Blinking) */}
          <motion.g
            style={{ transformOrigin: '58px 52px' }}
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              times: [0, 0.9, 0.94, 1]
            }}
          >
            {/* Left Eye */}
            <circle cx="42" cy="52" r="5" fill="#1E293B" />
            <circle cx="40.5" cy="50.5" r="1.8" fill="#FFFFFF" />
            <circle cx="43.5" cy="53.5" r="0.9" fill="#FFFFFF" />

            {/* Right Eye */}
            <circle cx="74" cy="52" r="5" fill="#1E293B" />
            <circle cx="72.5" cy="50.5" r="1.8" fill="#FFFFFF" />
            <circle cx="75.5" cy="53.5" r="0.9" fill="#FFFFFF" />
          </motion.g>

          {/* Pink Cheeks (Blush) */}
          <ellipse cx="32" cy="59" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.85" />
          <ellipse cx="84" cy="59" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.85" />

          {/* Cute Cat Nose & Mouth :3 */}
          <path d="M58 55L55 58H61L58 55Z" fill="#F43F5E" />
          <path
            d="M52 61C54 63 56 63 58 60C60 63 62 63 64 61"
            stroke="#1E293B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Paw holding modal edge */}
          <ellipse cx="26" cy="80" rx="9" ry="6" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3" />
          <path d="M22 80V83M26 80V84M30 80V83" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Right Paw holding modal edge & flag */}
          <ellipse cx="90" cy="80" rx="9" ry="6" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3" />
          <path d="M86 80V83M90 80V84M94 80V83" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="flagGradient" x1="85" y1="14" x2="114" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF4444" />
              <stop offset="1" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mini sparkle star hovering above mascot */}
        <motion.span
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 right-2 text-xs select-none pointer-events-none"
        >
          ✨
        </motion.span>
      </motion.div>
    </div>
  );
};
