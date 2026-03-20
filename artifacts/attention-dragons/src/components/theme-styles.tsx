import { useEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';

const BASE_URL = import.meta.env.BASE_URL || '/';

function getThemeCSS(themeId: string): string {
  const imgBase = `${BASE_URL}images`;

  const shared = `
    /* ── Shared reset ── */
    [data-theme] * { transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
  `;

  switch (themeId) {
    /* ═══════════════════════════════════════════
       ARCANE VAULT — obsidian, arcane runes, gold
       ══════════════════════════════════════════ */
    case 'arcane': return shared + `
      [data-theme="arcane"] body { background-color: hsl(260 40% 5%); }
      
      [data-theme="arcane"] .bg-background { background: transparent; }
      
      [data-theme="arcane"] [class*="bg-card"] {
        background: linear-gradient(135deg, hsl(265 30% 12%) 0%, hsl(260 35% 8%) 100%) !important;
        border-color: hsl(40 40% 28%) !important;
        box-shadow: 0 4px 20px hsl(270 60% 5%), inset 0 1px 0 hsl(280 40% 20% / 0.3) !important;
      }
      [data-theme="arcane"] [class*="bg-card"]:hover {
        border-color: hsl(40 70% 50%) !important;
        box-shadow: 0 0 25px hsl(280 80% 50% / 0.2), 0 8px 30px hsl(270 60% 5%) !important;
      }

      [data-theme="arcane"] h1, [data-theme="arcane"] h2, [data-theme="arcane"] h3 {
        text-shadow: 0 0 20px hsl(40 80% 55% / 0.4), 0 2px 10px rgba(0,0,0,0.8);
      }
      [data-theme="arcane"] h1 {
        letter-spacing: 0.15em;
      }

      [data-theme="arcane"] [class*="rounded-xl"], [data-theme="arcane"] [class*="rounded-lg"] {
        border-radius: 6px;
      }
      
      [data-theme="arcane"] input, [data-theme="arcane"] textarea {
        background: hsl(260 30% 8%) !important;
        border-color: hsl(260 25% 22%) !important;
      }
      [data-theme="arcane"] input:focus, [data-theme="arcane"] textarea:focus {
        border-color: hsl(40 70% 50%) !important;
        box-shadow: 0 0 0 2px hsl(40 70% 50% / 0.2) !important;
      }
    `;

    /* ═══════════════════════════════════════════
       THE TAVERN — warm oak, fire, parchment edges
       ══════════════════════════════════════════ */
    case 'tavern': return shared + `
      [data-theme="tavern"] body { background-color: hsl(25 40% 5%); }

      /* Cards look like old wooden boards */
      [data-theme="tavern"] [class*="bg-card"] {
        background: linear-gradient(160deg,
          hsl(25 40% 12%) 0%,
          hsl(22 35% 9%) 40%,
          hsl(28 38% 11%) 100%
        ) !important;
        background-image: 
          linear-gradient(160deg, hsl(25 40% 12%) 0%, hsl(22 35% 9%) 40%, hsl(28 38% 11%) 100%),
          repeating-linear-gradient(
            92deg,
            transparent 0px,
            transparent 60px,
            hsl(25 30% 15% / 0.4) 60px,
            hsl(25 30% 15% / 0.4) 61px
          ) !important;
        border: 1px solid hsl(30 45% 25%) !important;
        border-top: 2px solid hsl(30 55% 30%) !important;
        border-bottom: 2px solid hsl(20 40% 15%) !important;
        box-shadow: 
          0 6px 24px hsl(20 50% 3%),
          inset 0 1px 0 hsl(35 50% 30% / 0.4),
          inset 0 -1px 0 hsl(15 40% 10% / 0.6) !important;
        border-radius: 4px !important;
      }
      [data-theme="tavern"] [class*="bg-card"]:hover {
        border-top-color: hsl(35 70% 45%) !important;
        box-shadow: 
          0 8px 30px hsl(20 50% 3%),
          0 0 20px hsl(30 80% 45% / 0.12),
          inset 0 1px 0 hsl(35 60% 35% / 0.5) !important;
      }

      /* Headings: rustic, slightly rough */
      [data-theme="tavern"] h1, [data-theme="tavern"] h2, [data-theme="tavern"] h3 {
        text-shadow: 2px 2px 0 hsl(20 40% 5%), 0 0 30px hsl(30 90% 50% / 0.3);
        letter-spacing: 0.08em;
      }
      [data-theme="tavern"] h1 {
        letter-spacing: 0.04em;
      }

      /* Rounded, cozy buttons */
      [data-theme="tavern"] button {
        border-radius: 6px !important;
      }

      /* Inputs: wood-like feel */
      [data-theme="tavern"] input, [data-theme="tavern"] textarea {
        background: hsl(25 35% 8%) !important;
        border: 1px solid hsl(30 40% 22%) !important;
        border-radius: 4px !important;
      }
      [data-theme="tavern"] input:focus {
        border-color: hsl(30 70% 45%) !important;
        box-shadow: 0 0 0 2px hsl(30 70% 45% / 0.2) !important;
      }

      /* Section dividers look like wooden planks */
      [data-theme="tavern"] hr, [data-theme="tavern"] .border-b {
        border-color: hsl(30 35% 22%) !important;
        border-image: none !important;
      }

      /* Subtle background texture on whole page */
      [data-theme="tavern"] #root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url('${imgBase}/bg-tavern.png');
        background-size: cover;
        background-position: center;
        opacity: 0.12;
        pointer-events: none;
        z-index: 1;
      }
      [data-theme="tavern"] .relative.z-10 { position: relative; z-index: 2; }

      /* Rounded radii everywhere for cozy feel */
      [data-theme="tavern"] [class*="rounded-xl"] { border-radius: 8px !important; }
      [data-theme="tavern"] [class*="rounded-lg"] { border-radius: 6px !important; }
    `;

    /* ═══════════════════════════════════════════
       WIZARD'S TOME — parchment pages, ink, scrollwork
       ══════════════════════════════════════════ */
    case 'tome': return shared + `
      [data-theme="tome"] body { background-color: hsl(220 55% 4%); }

      /* Cards look like open book pages / aged manuscripts */
      [data-theme="tome"] [class*="bg-card"] {
        background: linear-gradient(155deg,
          hsl(220 45% 10%) 0%,
          hsl(215 40% 7%) 50%,
          hsl(225 45% 9%) 100%
        ) !important;
        border: 1px solid hsl(200 35% 22%) !important;
        border-radius: 3px !important;
        box-shadow:
          0 0 0 3px hsl(220 45% 8%),
          0 0 0 4px hsl(200 30% 18%),
          0 8px 30px hsl(220 60% 2%),
          inset 0 0 40px hsl(220 50% 6% / 0.5) !important;
        position: relative;
      }
      /* Ornate corner decorations using outline */
      [data-theme="tome"] [class*="bg-card"]::before {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid hsl(190 40% 20% / 0.4);
        border-radius: 2px;
        pointer-events: none;
      }
      [data-theme="tome"] [class*="bg-card"]:hover {
        border-color: hsl(190 60% 40%) !important;
        box-shadow:
          0 0 0 3px hsl(220 45% 8%),
          0 0 0 4px hsl(190 40% 22%),
          0 0 25px hsl(190 90% 55% / 0.15),
          0 12px 40px hsl(220 60% 2%) !important;
      }

      /* Headings: scholarly, arcane blue glow */
      [data-theme="tome"] h1, [data-theme="tome"] h2, [data-theme="tome"] h3 {
        text-shadow: 0 0 30px hsl(190 90% 55% / 0.5), 0 2px 8px hsl(220 60% 2%);
        letter-spacing: 0.12em;
      }
      [data-theme="tome"] h1 { letter-spacing: 0.06em; }

      /* Sharp, scholarly button shape */
      [data-theme="tome"] button {
        border-radius: 3px !important;
      }

      /* Double-border inputs */
      [data-theme="tome"] input, [data-theme="tome"] textarea {
        background: hsl(220 40% 7%) !important;
        border: 1px solid hsl(200 30% 20%) !important;
        border-radius: 2px !important;
        box-shadow: 0 0 0 1px hsl(220 40% 12%) !important;
      }
      [data-theme="tome"] input:focus {
        border-color: hsl(190 70% 45%) !important;
        box-shadow: 0 0 0 1px hsl(220 40% 12%), 0 0 0 3px hsl(190 70% 45% / 0.2) !important;
      }

      /* Background image overlay */
      [data-theme="tome"] #root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url('${imgBase}/bg-tome.png');
        background-size: cover;
        background-position: center top;
        opacity: 0.1;
        pointer-events: none;
        z-index: 1;
      }
      [data-theme="tome"] .relative.z-10 { position: relative; z-index: 2; }

      /* Very tight corners for manuscript feel */
      [data-theme="tome"] [class*="rounded-xl"] { border-radius: 4px !important; }
      [data-theme="tome"] [class*="rounded-lg"] { border-radius: 3px !important; }
      [data-theme="tome"] [class*="rounded-full"] { border-radius: 50% !important; }
    `;

    /* ═══════════════════════════════════════════
       ALCHEMIST'S APOTHECARY — glass, emerald glow
       ══════════════════════════════════════════ */
    case 'apothecary': return shared + `
      [data-theme="apothecary"] body { background-color: hsl(150 45% 4%); }

      /* Cards look like crystal/glass panels */
      [data-theme="apothecary"] [class*="bg-card"] {
        background: linear-gradient(135deg,
          hsl(155 40% 10% / 0.9) 0%,
          hsl(150 35% 7% / 0.95) 100%
        ) !important;
        backdrop-filter: blur(12px) saturate(1.4) !important;
        -webkit-backdrop-filter: blur(12px) saturate(1.4) !important;
        border: 1px solid hsl(140 60% 40% / 0.35) !important;
        border-radius: 16px !important;
        box-shadow:
          0 0 25px hsl(140 70% 40% / 0.08),
          0 8px 32px hsl(150 50% 2%),
          inset 0 1px 0 hsl(140 60% 60% / 0.15),
          inset 0 -1px 0 hsl(150 40% 8% / 0.5) !important;
      }
      [data-theme="apothecary"] [class*="bg-card"]:hover {
        border-color: hsl(140 70% 50% / 0.6) !important;
        box-shadow:
          0 0 35px hsl(140 70% 40% / 0.2),
          0 0 80px hsl(140 70% 40% / 0.06),
          0 12px 40px hsl(150 50% 2%),
          inset 0 1px 0 hsl(140 60% 60% / 0.2) !important;
      }

      /* Headings: emerald shimmer */
      [data-theme="apothecary"] h1, [data-theme="apothecary"] h2, [data-theme="apothecary"] h3 {
        text-shadow: 0 0 20px hsl(140 75% 48% / 0.5), 0 0 60px hsl(140 75% 48% / 0.2), 0 2px 8px rgba(0,0,0,0.8);
        letter-spacing: 0.06em;
      }

      /* Pill-shaped buttons */
      [data-theme="apothecary"] button {
        border-radius: 999px !important;
      }

      /* Glass-morphism inputs */
      [data-theme="apothecary"] input, [data-theme="apothecary"] textarea {
        background: hsl(150 40% 8% / 0.6) !important;
        border: 1px solid hsl(140 50% 35% / 0.4) !important;
        border-radius: 999px !important;
        backdrop-filter: blur(8px) !important;
      }
      [data-theme="apothecary"] input:focus {
        border-color: hsl(140 70% 45%) !important;
        box-shadow: 0 0 0 2px hsl(140 70% 45% / 0.25), 0 0 20px hsl(140 70% 45% / 0.15) !important;
      }

      /* Background */
      [data-theme="apothecary"] #root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url('${imgBase}/bg-apothecary.png');
        background-size: cover;
        background-position: center;
        opacity: 0.15;
        pointer-events: none;
        z-index: 1;
      }
      [data-theme="apothecary"] .relative.z-10 { position: relative; z-index: 2; }

      /* Very rounded everywhere — pill shapes */
      [data-theme="apothecary"] [class*="rounded-xl"] { border-radius: 20px !important; }
      [data-theme="apothecary"] [class*="rounded-lg"] { border-radius: 16px !important; }
      [data-theme="apothecary"] [class*="rounded-md"] { border-radius: 12px !important; }
    `;

    /* ═══════════════════════════════════════════
       KNIGHT'S ARMORY — iron plates, heraldic red
       ══════════════════════════════════════════ */
    case 'armory': return shared + `
      [data-theme="armory"] body { background-color: hsl(0 8% 5%); }

      /* Cards look like iron plates with beveled corners */
      [data-theme="armory"] [class*="bg-card"] {
        background: linear-gradient(160deg,
          hsl(0 6% 14%) 0%,
          hsl(0 5% 9%) 100%
        ) !important;
        border: 1px solid hsl(0 20% 20%) !important;
        border-top: 2px solid hsl(0 30% 28%) !important;
        border-left: 2px solid hsl(0 20% 22%) !important;
        border-radius: 2px !important;
        clip-path: polygon(
          10px 0%, calc(100% - 10px) 0%,
          100% 10px, 100% calc(100% - 10px),
          calc(100% - 10px) 100%, 10px 100%,
          0% calc(100% - 10px), 0% 10px
        ) !important;
        box-shadow:
          0 0 0 1px hsl(0 15% 12%),
          0 8px 30px hsl(0 10% 2%),
          inset 0 1px 0 hsl(0 20% 25% / 0.5),
          inset 2px 0 0 hsl(0 15% 20% / 0.3) !important;
      }
      [data-theme="armory"] [class*="bg-card"]:hover {
        border-top-color: hsl(0 80% 50%) !important;
        box-shadow:
          0 0 0 1px hsl(0 15% 12%),
          0 0 20px hsl(0 80% 50% / 0.15),
          0 12px 40px hsl(0 10% 2%),
          inset 0 1px 0 hsl(0 50% 35% / 0.4) !important;
      }

      /* Headings: bold, heraldic — uppercase military */
      [data-theme="armory"] h1, [data-theme="armory"] h2, [data-theme="armory"] h3 {
        text-shadow: 2px 2px 0 hsl(0 10% 4%), 0 0 20px hsl(0 80% 55% / 0.3);
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      [data-theme="armory"] h1 { letter-spacing: 0.25em; }

      /* Angular buttons — like shields or stamps */
      [data-theme="armory"] button {
        border-radius: 2px !important;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 0.85em;
      }

      /* Iron-slab inputs */
      [data-theme="armory"] input, [data-theme="armory"] textarea {
        background: hsl(0 6% 8%) !important;
        border: 1px solid hsl(0 15% 18%) !important;
        border-radius: 2px !important;
        border-top-color: hsl(0 20% 25%) !important;
      }
      [data-theme="armory"] input:focus {
        border-color: hsl(0 70% 45%) !important;
        box-shadow: 0 0 0 2px hsl(0 70% 45% / 0.2) !important;
      }

      /* Crimson section dividers */
      [data-theme="armory"] .border-b {
        border-color: hsl(0 40% 22%) !important;
      }

      /* Background */
      [data-theme="armory"] #root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url('${imgBase}/bg-armory.png');
        background-size: cover;
        background-position: center;
        opacity: 0.14;
        pointer-events: none;
        z-index: 1;
      }
      [data-theme="armory"] .relative.z-10 { position: relative; z-index: 2; }

      /* Hard angular radii everywhere */
      [data-theme="armory"] [class*="rounded-xl"] { border-radius: 2px !important; }
      [data-theme="armory"] [class*="rounded-lg"] { border-radius: 2px !important; }
      [data-theme="armory"] [class*="rounded-md"] { border-radius: 1px !important; }
      /* But keep circles circular */
      [data-theme="armory"] [class*="rounded-full"] { border-radius: 50% !important; }

      /* Rivet decoration on large cards */
      [data-theme="armory"] [class*="bg-card"]::after {
        content: '';
        position: absolute;
        top: 8px;
        right: 10px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, hsl(0 20% 40%), hsl(0 10% 15%));
        box-shadow: -18px 0 0 0 transparent, 0 0 0 1px hsl(0 15% 25%);
        pointer-events: none;
      }
    `;

    /* ═══════════════════════════════════════════
       DRUID'S GROVE — organic bark, forest, vines
       ══════════════════════════════════════════ */
    case 'grove': return shared + `
      [data-theme="grove"] body { background-color: hsl(120 30% 4%); }

      /* Cards look like pieces of bark / carved wood */
      [data-theme="grove"] [class*="bg-card"] {
        background: linear-gradient(145deg,
          hsl(120 25% 10%) 0%,
          hsl(115 20% 7%) 50%,
          hsl(125 22% 9%) 100%
        ) !important;
        border: 1px solid hsl(100 28% 18%) !important;
        /* Organic asymmetric border-radius */
        border-radius: 4px 14px 4px 14px / 14px 4px 14px 4px !important;
        border-top: 2px solid hsl(90 35% 22%) !important;
        border-right: 1px solid hsl(110 25% 14%) !important;
        box-shadow:
          0 6px 24px hsl(120 40% 2%),
          0 2px 4px hsl(110 30% 8%),
          inset 0 1px 0 hsl(90 40% 20% / 0.3),
          inset -1px 0 0 hsl(120 20% 12% / 0.4) !important;
      }
      [data-theme="grove"] [class*="bg-card"]:hover {
        border-top-color: hsl(80 60% 40%) !important;
        box-shadow:
          0 8px 30px hsl(120 40% 2%),
          0 0 20px hsl(90 50% 30% / 0.1),
          inset 0 1px 0 hsl(90 45% 25% / 0.4) !important;
      }

      /* Headings: earthy, organic nature feel */
      [data-theme="grove"] h1, [data-theme="grove"] h2, [data-theme="grove"] h3 {
        text-shadow: 0 2px 8px hsl(120 40% 2%), 0 0 25px hsl(80 60% 45% / 0.3);
        letter-spacing: 0.08em;
      }

      /* Organic button shapes */
      [data-theme="grove"] button {
        border-radius: 4px 10px 4px 10px / 10px 4px 10px 4px !important;
      }

      /* Bark-like inputs */
      [data-theme="grove"] input, [data-theme="grove"] textarea {
        background: hsl(120 25% 7%) !important;
        border: 1px solid hsl(100 25% 18%) !important;
        border-radius: 2px 8px 2px 8px / 8px 2px 8px 2px !important;
        border-top-color: hsl(90 30% 22%) !important;
      }
      [data-theme="grove"] input:focus {
        border-color: hsl(80 55% 40%) !important;
        box-shadow: 0 0 0 2px hsl(80 55% 40% / 0.2) !important;
      }

      /* Nature dividers */
      [data-theme="grove"] .border-b {
        border-color: hsl(100 25% 18%) !important;
        border-image: none !important;
      }

      /* Background */
      [data-theme="grove"] #root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url('${imgBase}/bg-grove.png');
        background-size: cover;
        background-position: center;
        opacity: 0.14;
        pointer-events: none;
        z-index: 1;
      }
      [data-theme="grove"] .relative.z-10 { position: relative; z-index: 2; }

      /* Organic radii */
      [data-theme="grove"] [class*="rounded-xl"] { border-radius: 4px 14px 4px 14px / 14px 4px 14px 4px !important; }
      [data-theme="grove"] [class*="rounded-lg"] { border-radius: 3px 10px 3px 10px / 10px 3px 10px 3px !important; }
    `;

    default: return shared;
  }
}

export function ThemeStyles() {
  const { themeId } = useTheme();

  useEffect(() => {
    let styleEl = document.getElementById('dynamic-theme-styles') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-theme-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = getThemeCSS(themeId);
  }, [themeId]);

  return null;
}
