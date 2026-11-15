import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingQuote {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const StickerSquadOverlay: React.FC = () => {
  const [activeQuote, setActiveQuote] = useState<FloatingQuote | null>(null);

  const triggerQuote = (text: string, x: number, y: number) => {
    setActiveQuote({
      id: Date.now(),
      text,
      x,
      y
    });
    setTimeout(() => {
      setActiveQuote(null);
    }, 2000);
  };

  return (
    <>
      {/* ================= 1. FLOATING BACKDROP CELEBRATION STICKERS ================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {/* Floating Sticker: 🍀 May Mắn 100% */}
        <motion.div
          animate={{
            y: [-12, 12, -12],
            rotate: [-6, 6, -6],
            x: [-4, 4, -4]
          }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[8%] left-[4%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/85 text-white text-xs font-bold shadow-xl border border-white/20 backdrop-blur-xs select-none"
        >
          <span className="text-xl">🍀</span>
          <span>May Mắn 100%</span>
        </motion.div>

        {/* Floating Sticker: 💯 Chắc Suất A+ */}
        <motion.div
          animate={{
            y: [10, -10, 10],
            rotate: [5, -5, 5],
            x: [3, -3, 3]
          }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute top-[10%] right-[4%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/85 text-white text-xs font-bold shadow-xl border border-white/20 backdrop-blur-xs select-none"
        >
          <span className="text-xl">💯</span>
          <span>Chắc Suất A+</span>
        </motion.div>

        {/* Floating Sticker: 🚀 Bứt Phá Về Đích */}
        <motion.div
          animate={{
            y: [-14, 14, -14],
            rotate: [-5, 7, -5],
            x: [-6, 6, -6]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute bottom-[10%] left-[5%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-500/85 text-white text-xs font-bold shadow-xl border border-white/20 backdrop-blur-xs select-none"
        >
          <span className="text-xl">🚀</span>
          <span>Bứt Phá Về Đích</span>
        </motion.div>

        {/* Floating Sticker: 🏆 Thủ Khoa SQA */}
        <motion.div
          animate={{
            y: [12, -12, 12],
            rotate: [6, -6, 6],
            x: [4, -4, 4]
          }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-[12%] right-[5%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-600/85 text-white text-xs font-bold shadow-xl border border-white/20 backdrop-blur-xs select-none"
        >
          <span className="text-xl">🏆</span>
          <span>Thủ Khoa SQA</span>
        </motion.div>

        {/* Drifting Emoticons in background */}
        <motion.span
          animate={{ y: [-15, 15, -15], rotate: [-10, 10, -10] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[28%] left-[2%] text-2xl opacity-60 hidden md:block"
        >
          🎓
        </motion.span>
        <motion.span
          animate={{ y: [12, -12, 12], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[25%] right-[2%] text-2xl opacity-60 hidden md:block"
        >
          🌟
        </motion.span>
        <motion.span
          animate={{ y: [-10, 10, -10], rotate: [10, -10, 10] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[28%] left-[2%] text-2xl opacity-60 hidden md:block"
        >
          🔥
        </motion.span>
        <motion.span
          animate={{ y: [14, -14, 14], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[25%] right-[2%] text-2xl opacity-60 hidden md:block"
        >
          🎉
        </motion.span>
      </div>

      {/* Interactive Floating Speech Quote */}
      <AnimatePresence>
        {activeQuote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            style={{ top: activeQuote.y, left: activeQuote.x }}
            className="fixed z-50 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold shadow-2xl border-2 border-amber-400 pointer-events-none drop-shadow-lg -translate-x-1/2 -translate-y-full"
          >
            {activeQuote.text}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-amber-400 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 2. THE SQUAD OF 5 PEEKING MASCOTS (360° FRAME) ================= */}

      {/* MASCOT 1 (Top Left): 🐱 Mèo Ami vẫy cờ 'CỐ LÊN! 🎉' */}
      <div className="absolute -top-[58px] left-6 z-30 select-none">
        <motion.div
          onClick={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerQuote('Mèo Ami: Cố lên bạn ơi, A+ thẳng tiến! 🐾', rect.left + 40, rect.top);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative cursor-pointer group"
          title="Mèo Ami: Chạm để nhận may mắn!"
        >
          <svg width="84" height="66" viewBox="0 0 120 95" fill="none" className="drop-shadow-md">
            {/* Flag behind paw */}
            <motion.g
              style={{ transformOrigin: '88px 52px' }}
              animate={{ rotate: [-10, 18, -10] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <line x1="88" y1="52" x2="114" y2="12" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
              <path d="M112 14L85 24C83 25 83 28 85 29L108 38L112 14Z" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
              <text x="100" y="27" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle" transform="rotate(6, 100, 27)">
                CỐ LÊN!
              </text>
            </motion.g>
            {/* Ears */}
            <path d="M24 38C22 25 29 16 38 24C44 29 38 42 24 38Z" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3.5" />
            <path d="M27 34C26 27 29 22 34 26C38 29 34 36 27 34Z" fill="#FDA4AF" />
            <path d="M78 24C87 16 94 25 92 38C78 42 72 29 78 24Z" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3.5" />
            <path d="M82 26C87 22 90 27 89 34C82 36 78 29 82 26Z" fill="#FDA4AF" />
            {/* Head & Body */}
            <path d="M20 72C15 50 26 32 58 32C90 32 101 50 96 72C94 77 90 80 84 80H32C26 80 22 77 20 72Z" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3.5" />
            {/* Eyes (Blinking) */}
            <motion.g
              style={{ transformOrigin: '58px 52px' }}
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.9, 0.94, 1] }}
            >
              <circle cx="42" cy="52" r="5" fill="#1E293B" />
              <circle cx="40.5" cy="50.5" r="1.8" fill="#FFFFFF" />
              <circle cx="74" cy="52" r="5" fill="#1E293B" />
              <circle cx="72.5" cy="50.5" r="1.8" fill="#FFFFFF" />
            </motion.g>
            <ellipse cx="32" cy="59" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.85" />
            <ellipse cx="84" cy="59" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.85" />
            <path d="M58 55L55 58H61L58 55Z" fill="#F43F5E" />
            <path d="M52 61C54 63 56 63 58 60C60 63 62 63 64 61" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Paws on border */}
            <ellipse cx="26" cy="80" rx="9" ry="6" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3" />
            <ellipse cx="90" cy="80" rx="9" ry="6" fill="#FFFDF7" stroke="#1E293B" strokeWidth="3" />
          </svg>
        </motion.div>
      </div>

      {/* MASCOT 2 (Top Right): 🐰 Thỏ Tuzki nháy mắt thả tim 'YÊU SQA ❤️' */}
      <div className="absolute -top-[62px] right-6 z-30 select-none hidden sm:block">
        <motion.div
          onClick={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerQuote('Thỏ Tuzki: Trắc nghiệm 50/50 câu trúng phóc! 🐰❤️', rect.left + 40, rect.top);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={{ y: [3, -3, 3], rotate: [2, -2, 2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="relative cursor-pointer group"
          title="Thỏ Tuzki: Chạm để nhận tim!"
        >
          <svg width="84" height="68" viewBox="0 0 120 100" fill="none" className="drop-shadow-md">
            {/* Bunny Long Ears */}
            <motion.path
              d="M38 45C32 20 40 4 48 8C56 12 50 30 46 45Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="3.5"
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <path d="M42 38C38 24 43 12 47 15C51 18 48 28 46 38Z" fill="#FBCFE8" />

            <motion.path
              d="M72 45C68 30 62 12 70 8C78 4 86 20 80 45Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="3.5"
              animate={{ rotate: [4, -4, 4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <path d="M72 38C70 28 67 18 71 15C75 12 80 24 76 38Z" fill="#FBCFE8" />

            {/* Bunny Head */}
            <ellipse cx="59" cy="62" rx="34" ry="26" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3.5" />
            {/* Winking Eye Left & Sparkle Eye Right */}
            <path d="M40 60C44 63 48 60 48 60" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="76" cy="58" r="4.5" fill="#1E293B" />
            <circle cx="75" cy="56.5" r="1.6" fill="#FFFFFF" />
            {/* Cheeks & Cute smile */}
            <ellipse cx="36" cy="67" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="82" cy="67" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
            <path d="M56 63L59 66L62 63" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M55 68C57 70 61 70 63 68" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bunny Paws holding a heart */}
            <ellipse cx="32" cy="84" rx="8" ry="5.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
            <ellipse cx="86" cy="84" rx="8" ry="5.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
            {/* Floating Heart */}
            <motion.path
              d="M59 84C59 84 51 76 47 71C43 66 48 60 53 62C56 64 59 67 59 67C59 67 62 64 65 62C70 60 75 66 71 71C67 76 59 84 59 84Z"
              fill="#F43F5E"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </div>

      {/* MASCOT 3 (Left Edge): 🦖 Khủng long xanh béo ôm bút '10 ĐIỂM ✏️' */}
      <div className="absolute top-1/2 -left-[54px] -translate-y-1/2 z-30 select-none hidden sm:block">
        <motion.div
          onClick={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerQuote('Khủng long: Tự tin tô trắc nghiệm 10 điểm! 🦖✏️', rect.left + 35, rect.top);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={{ x: [-2, 3, -2], rotate: [-2, 2, -2] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="relative cursor-pointer group"
          title="Khủng long xanh: Chạm để nhận bút 10 điểm!"
        >
          <svg width="68" height="84" viewBox="0 0 85 105" fill="none" className="drop-shadow-md">
            {/* Dino Body */}
            <path
              d="M65 15C42 12 25 32 30 65C32 78 40 92 65 92C68 92 68 82 68 82V25C68 18 67 15 65 15Z"
              fill="#34D399"
              stroke="#065F46"
              strokeWidth="3.5"
            />
            {/* Dino Spikes */}
            <path d="M28 35L16 42L28 50L18 58L29 66L20 74L34 80" fill="#10B981" stroke="#065F46" strokeWidth="2.5" />
            {/* Cute Big Eye */}
            <circle cx="48" cy="36" r="6" fill="#FFFFFF" stroke="#065F46" strokeWidth="2.5" />
            <circle cx="49" cy="36" r="3.5" fill="#065F46" />
            <circle cx="50" cy="34.5" r="1.3" fill="#FFFFFF" />
            {/* Rosy Cheek */}
            <circle cx="40" cy="46" r="4.5" fill="#F87171" opacity="0.8" />
            {/* Happy Smile */}
            <path d="M45 48C49 52 56 50 56 46" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" />
            {/* Big Pencil held in arms */}
            <g transform="rotate(-35, 52, 65)">
              <rect x="42" y="45" width="16" height="42" rx="3" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
              <polygon points="42,45 50,28 58,45" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
              <polygon points="47,33 50,28 53,33" fill="#1E293B" />
              <rect x="42" y="78" width="16" height="9" fill="#F472B6" />
            </g>
            {/* Paws */}
            <circle cx="56" cy="62" r="5" fill="#34D399" stroke="#065F46" strokeWidth="2.5" />
          </svg>
        </motion.div>
      </div>

      {/* MASCOT 4 (Right Edge): 🐕 Cún Shiba vàng thắt khăn 'QUYẾT TỬ QUA MÔN 🔥' */}
      <div className="absolute top-1/2 -right-[54px] -translate-y-1/2 z-30 select-none hidden sm:block">
        <motion.div
          onClick={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerQuote('Shiba: Quyết chiến quyết thắng qua môn SQA! 🐕🔥', rect.left + 35, rect.top);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={{ x: [2, -3, 2], rotate: [2, -2, 2] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          className="relative cursor-pointer group"
          title="Cún Shiba: Chạm để nhận ý chí quyết tâm!"
        >
          <svg width="68" height="84" viewBox="0 0 85 105" fill="none" className="drop-shadow-md">
            {/* Shiba Body & Head */}
            <path
              d="M20 15C42 12 60 32 55 65C53 78 45 92 20 92C17 92 17 82 17 82V25C17 18 18 15 20 15Z"
              fill="#F59E0B"
              stroke="#78350F"
              strokeWidth="3.5"
            />
            {/* Shiba White Muzzle */}
            <path d="M17 48C28 46 42 55 42 70C42 82 28 88 17 88V48Z" fill="#FFFBEB" />
            {/* Shiba Ear */}
            <polygon points="26,14 42,4 40,24" fill="#D97706" stroke="#78350F" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="30,15 38,9 37,20" fill="#FDE68A" />
            {/* Red Headband (Khăn quyết tâm) */}
            <path d="M17 32C32 29 48 35 52 38L54 44C48 40 32 35 17 38V32Z" fill="#EF4444" />
            <circle cx="34" cy="34" r="2.5" fill="#FFFFFF" />
            {/* Shiba Eye */}
            <ellipse cx="36" cy="46" rx="3.5" ry="4.5" fill="#78350F" />
            <circle cx="37" cy="45" r="1.3" fill="#FFFFFF" />
            {/* Nose & Smile */}
            <ellipse cx="23" cy="56" rx="3.5" ry="2.5" fill="#78350F" />
            <path d="M23 60C28 62 33 60 35 57" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            {/* Paw holding border */}
            <ellipse cx="28" cy="78" rx="6" ry="7" fill="#FFFBEB" stroke="#78350F" strokeWidth="2.5" />
          </svg>
        </motion.div>
      </div>

      {/* MASCOT 5 (Bottom Edge): 🐻 Gấu Bubu ôm cúp 'THỦ KHOA 🏆' */}
      <div className="absolute -bottom-[50px] right-8 z-30 select-none hidden sm:block">
        <motion.div
          onClick={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            triggerQuote('Gấu Bubu: Trao cúp vàng thủ khoa cho bạn! 🏆✨', rect.left + 40, rect.top);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={{ y: [3, -3, 3], rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          className="relative cursor-pointer group"
          title="Gấu Bubu: Chạm để nhận cúp thủ khoa!"
        >
          <svg width="88" height="64" viewBox="0 0 110 80" fill="none" className="drop-shadow-md">
            {/* Bear Round Ears */}
            <circle cx="32" cy="30" r="12" fill="#92400E" stroke="#451A03" strokeWidth="3" />
            <circle cx="32" cy="30" r="6" fill="#FBBF24" />
            <circle cx="78" cy="30" r="12" fill="#92400E" stroke="#451A03" strokeWidth="3" />
            <circle cx="78" cy="30" r="6" fill="#FBBF24" />

            {/* Bear Head */}
            <ellipse cx="55" cy="46" rx="36" ry="26" fill="#B45309" stroke="#451A03" strokeWidth="3.5" />
            {/* Bear Snout */}
            <ellipse cx="55" cy="52" rx="14" ry="10" fill="#FDE68A" />
            <ellipse cx="55" cy="48" rx="4" ry="2.8" fill="#451A03" />
            <path d="M55 51V55M52 55C53.5 56.5 56.5 56.5 58 55" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="42" cy="42" r="3.5" fill="#451A03" />
            <circle cx="43" cy="41" r="1.2" fill="#FFFFFF" />
            <circle cx="68" cy="42" r="3.5" fill="#451A03" />
            <circle cx="69" cy="41" r="1.2" fill="#FFFFFF" />
            {/* Cheeks */}
            <circle cx="34" cy="50" r="4" fill="#F87171" opacity="0.8" />
            <circle cx="76" cy="50" r="4" fill="#F87171" opacity="0.8" />

            {/* Golden Trophy held by Bear */}
            <g transform="translate(42, 38) scale(0.65)">
              <path d="M6 8H34V20C34 27.7 27.7 34 20 34C12.3 34 6 27.7 6 20V8Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
              <path d="M2 12C2 12 0 20 6 22M38 12C38 12 40 20 34 22" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
              <path d="M20 34V42M12 42H28" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
            </g>
            {/* Paws */}
            <circle cx="34" cy="58" r="6" fill="#B45309" stroke="#451A03" strokeWidth="2.5" />
            <circle cx="76" cy="58" r="6" fill="#B45309" stroke="#451A03" strokeWidth="2.5" />
          </svg>
        </motion.div>
      </div>
    </>
  );
};
