import { Link } from 'wouter';
import { useListCharacters } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddCharacterDialog } from '@/components/add-character-dialog';
import { Button } from '@/components/ui/button';
import { Shield, Skull, Scroll, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeSelector } from '@/components/theme-selector';

export default function Home() {
  const { data: characters, isLoading } = useListCharacters();

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">

        {/* Theme selector top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeSelector />
        </div>

        <div className="text-center mb-16 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-black text-primary drop-shadow-lg tracking-widest"
          >
            ATTENTION DRAGONS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-sans max-w-2xl mx-auto"
          >
            Enter the extradimensional vault and manage your adventuring party's artifacts, armaments, and arcane curiosities.
          </motion.p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <AddCharacterDialog />
          <Link href="/dm">
            <Button variant="outline" size="lg" className="text-lg border-primary/30 text-primary hover:bg-primary/10">
              <Crown className="mr-2 h-5 w-5" /> Enter DM View
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-64 bg-secondary/50 border-border/50" />
            ))}
          </div>
        ) : characters?.length === 0 ? (
          <div className="text-center py-24 bg-card/50 rounded-2xl border border-border backdrop-blur-sm">
            <Skull className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-display text-foreground mb-2">The Vault is Empty</h2>
            <p className="text-muted-foreground">Forge a new hero to begin storing their treasures.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters?.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/character/${char.id}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-primary/20 hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-card/80 backdrop-blur-sm hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50 bg-secondary flex-shrink-0 relative">
                        <img
                          src={char.avatarUrl || `${import.meta.env.BASE_URL}images/avatar-placeholder.png`}
                          alt={char.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">{char.name}</CardTitle>
                        <p className="text-sm text-muted-foreground font-sans italic mt-1">played by {char.playerName}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-accent">
                          <Shield className="w-4 h-4" /> Lvl {char.level}
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Scroll className="w-4 h-4 text-muted-foreground" /> {char.race} {char.characterClass}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
