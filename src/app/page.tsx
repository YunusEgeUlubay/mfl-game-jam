import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import GameCard from "@/components/GameCard";
import { supabase } from "@/lib/supabase";
import { Game } from "@/lib/mockData";

export const revalidate = 0;

export default async function Home() {
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3);

  const featuredGames = (data as Game[]) || [];

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background z-0" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 mb-8 animate-glow">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Manisa Fen Lisesi Geliştirici Topluluğu</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            MFL <span className="text-glow text-primary">GAME</span> JAM
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Sınırları zorla, kodla, yarat ve oyna. MFL öğrencilerinin geliştirdiği en iyi oyunları keşfet veya kendi oyununu dünyaya sergile.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/games"
              className="px-8 py-4 rounded-lg bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2"
            >
              Oyunları Keşfet
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/submit"
              className="px-8 py-4 rounded-lg glass border-white/20 font-bold uppercase tracking-wider hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              Oyun Yükle
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">
            Öne Çıkan <span className="text-primary text-glow">Oyunlar</span>
          </h2>
          <Link href="/games" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="glass rounded-2xl p-10 md:p-16 text-center neon-border relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Sen de Aramıza Katıl!</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
            Kendi oyununu geliştirdin mi? Platforma yükle, admin onayından geçsin ve diğer öğrencilerin beğenisine sunulsun.
          </p>
          <Link 
            href="/submit"
            className="inline-flex px-8 py-4 rounded-lg bg-secondary text-white font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all hover:shadow-[0_0_30px_rgba(255,0,60,0.5)]"
          >
            Hemen Yükle
          </Link>
        </div>
      </section>
    </div>
  );
}
