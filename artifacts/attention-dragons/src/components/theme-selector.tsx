import { Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { THEMES, type ThemeId } from '@/lib/themes';
import { motion } from 'framer-motion';

export function ThemeSelector() {
  const { themeId, setThemeId, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-primary transition-colors"
          title="Change visual theme"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-sans">{theme.emoji} {theme.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-display text-sm tracking-wide">
          Choose Your Aesthetic
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setThemeId(t.id as ThemeId)}
            className="flex items-start gap-3 py-3 cursor-pointer"
          >
            <span className="text-lg leading-none mt-0.5">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm tracking-wide">{t.name}</span>
                {themeId === t.id && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-primary text-xs"
                  >
                    ✦
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-sans mt-0.5 leading-tight">
                {t.tagline}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
