import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';
import type { ParticleType } from '@/lib/themes';

const RUNE_GLYPHS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ'];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  glyph?: string;
}

function useParticles(count: number, seed = 42): Particle[] {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seededRand(seed + i * 3) * 100,
      delay: seededRand(seed + i * 7) * 8,
      duration: 6 + seededRand(seed + i * 11) * 10,
      size: 4 + seededRand(seed + i * 13) * 10,
      opacity: 0.3 + seededRand(seed + i * 17) * 0.5,
      glyph: RUNE_GLYPHS[Math.floor(seededRand(seed + i * 19) * RUNE_GLYPHS.length)],
    }));
  }, [count, seed]);
}

function EmberParticles() {
  const particles = useParticles(22, 1);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-8px',
            width: p.size * 0.55,
            height: p.size * 0.55,
            background: `radial-gradient(circle, hsl(40 100% 75%) 0%, hsl(25 95% 60%) 40%, transparent 100%)`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -(320 + p.size * 22)],
            x: [0, (seededRand(p.id * 23) - 0.5) * 90],
            opacity: [p.opacity, p.opacity * 0.8, 0],
            scale: [1, 0.6, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function RuneParticles({ color }: { color: string }) {
  const particles = useParticles(14, 2);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute font-display select-none"
          style={{
            left: `${p.x}%`,
            top: `${seededRand(p.id * 5) * 100}%`,
            fontSize: p.size + 6,
            color: `hsl(${color})`,
            opacity: 0,
            textShadow: `0 0 12px hsl(${color} / 0.9)`,
          }}
          animate={{
            opacity: [0, p.opacity * 0.7, 0],
            y: [0, -70 - p.size * 6],
            rotate: [0, (seededRand(p.id * 31) - 0.5) * 100],
          }}
          transition={{ duration: p.duration * 1.6, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {p.glyph}
        </motion.div>
      ))}
    </div>
  );
}

function BubbleParticles() {
  const particles = useParticles(20, 3);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full border"
          style={{
            left: `${p.x}%`,
            bottom: '-20px',
            width: p.size,
            height: p.size,
            borderColor: `hsl(140 70% 55% / ${p.opacity * 0.7})`,
            background: `radial-gradient(circle at 30% 30%, hsl(140 60% 70% / 0.18), transparent 65%)`,
          }}
          animate={{
            y: [0, -(420 + p.size * 12)],
            x: [0, Math.sin(p.id) * 35, -Math.sin(p.id) * 25, 0],
            opacity: [0, p.opacity * 0.8, p.opacity * 0.5, 0],
            scale: [0.5, 1, 0.95, 1.08],
          }}
          transition={{ duration: p.duration * 1.3, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function SparkParticles() {
  const particles = useParticles(30, 4);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            bottom: `${seededRand(p.id * 7) * 25}%`,
            width: p.size * 0.3,
            height: p.size * 0.3,
            background: seededRand(p.id) > 0.5 ? `hsl(0 90% 68%)` : `hsl(40 95% 68%)`,
            borderRadius: '1px',
            opacity: p.opacity,
            transform: `rotate(${seededRand(p.id * 37) * 45}deg)`,
          }}
          animate={{
            y: [0, -(90 + p.size * 12)],
            x: [0, (seededRand(p.id * 41) - 0.5) * 70],
            opacity: [p.opacity, p.opacity, 0],
            scale: [1, 1.6, 0],
          }}
          transition={{ duration: 1 + seededRand(p.id * 43) * 2.5, delay: p.delay * 0.4, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function LeafParticles() {
  const particles = useParticles(18, 5);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size * 0.6,
            borderRadius: '50% 0 50% 0',
            background: seededRand(p.id * 3) > 0.4
              ? `hsl(${100 + seededRand(p.id * 11) * 30} 65% ${30 + seededRand(p.id * 7) * 20}%)`
              : `hsl(${40 + seededRand(p.id * 13) * 20} 60% ${35 + seededRand(p.id * 9) * 15}%)`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, 650 + p.size * 22],
            x: [0, (seededRand(p.id * 23) - 0.5) * 130, (seededRand(p.id * 29) - 0.5) * 90, 0],
            rotate: [0, seededRand(p.id * 31) * 380 * (seededRand(p.id) > 0.5 ? 1 : -1)],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{ duration: p.duration * 1.7, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

const THEME_BG_IMAGE: Record<string, string> = {
  arcane: 'bg-arcane.png',
  tavern: 'bg-tavern.png',
  tome: 'bg-tome.png',
  apothecary: 'bg-apothecary.png',
  armory: 'bg-armory.png',
  grove: 'bg-grove.png',
};

const THEME_BG_OPACITY: Record<string, number> = {
  arcane: 0.22,
  tavern: 0.28,
  tome: 0.20,
  apothecary: 0.22,
  armory: 0.25,
  grove: 0.22,
};

export function AnimatedBackground() {
  const { theme } = useTheme();
  const imgFile = THEME_BG_IMAGE[theme.id];
  const imgOpacity = THEME_BG_OPACITY[theme.id] ?? 0.2;
  const BASE_URL = import.meta.env.BASE_URL || '/';

  const particles: Partial<Record<ParticleType, React.ReactElement | null>> = {
    embers: <EmberParticles />,
    runes: <RuneParticles color={theme.accentGlowColor} />,
    bubbles: <BubbleParticles />,
    sparks: <SparkParticles />,
    leaves: <LeafParticles />,
    none: null,
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: theme.backgroundGradient }} />

      {/* AI-generated background image */}
      {imgFile && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${BASE_URL}images/${imgFile})`,
            opacity: imgOpacity,
            mixBlendMode: 'luminosity',
          }}
        />
      )}

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Particle layer */}
      <div className="absolute inset-0">
        {particles[theme.particleType]}
      </div>
    </div>
  );
}
