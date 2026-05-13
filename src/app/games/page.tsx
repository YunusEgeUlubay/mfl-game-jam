"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, Loader2 } from "lucide-react";
import GameCard from "@/components/GameCard";
import { Game, THEMES, PLATFORMS } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, game_ratings(rating)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message || JSON.stringify(error));
      } else if (data) {
        const gamesWithRatings = data.map((game: any) => {
          const ratings = game.game_ratings || [];
          const total = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
          return {
            ...game,
            total_votes: ratings.length,
            average_rating: ratings.length > 0 ? total / ratings.length : 0
          };
        });
        setGames(gamesWithRatings as Game[]);
      }
    } catch (err: any) {
      console.error("Caught exception:", err);
      setFetchError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    // Komponent mount edildiğinde ve router refresh olduğunda güncel veriyi çek
  }, [fetchGames]);

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (game.team_name && game.team_name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTheme = selectedTheme === "All" || game.theme === selectedTheme;
        const matchesPlatform = selectedPlatform === "All" || (game.engine && game.engine.toLowerCase() === selectedPlatform.toLowerCase());
        return matchesSearch && matchesTheme && matchesPlatform;
      });
  }, [searchQuery, selectedTheme, selectedPlatform, games]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Tüm <span className="text-primary text-glow">Oyunlar</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Arkadaşlarının geliştirdiği oyunları keşfet ve oyna.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="glass p-5 rounded-xl border-white/10">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Oyun veya yapımcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder-gray-500"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Temalar
              </h3>
              <div className="flex flex-col gap-2">
                {["All", ...THEMES].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={clsx(
                      "text-left px-3 py-2 rounded-md text-sm transition-colors",
                      selectedTheme === theme
                        ? "bg-primary/20 text-primary font-medium neon-border"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {theme === "All" ? "Tümü" : theme}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Platformlar
              </h3>
              <div className="flex flex-col gap-2">
                {["All", ...PLATFORMS].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={clsx(
                      "text-left px-3 py-2 rounded-md text-sm transition-colors",
                      selectedPlatform === platform
                        ? "bg-accent/20 text-accent font-medium border border-accent/50 shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {platform === "All" ? "Tümü" : platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="text-gray-400 font-medium">Yükleniyor...</span>
            </div>
          ) : fetchError ? (
            <div className="glass rounded-xl p-12 text-center border-red-500/30 bg-red-500/10 min-h-[400px] flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-red-500 mx-auto mb-4 hidden" />
              <h3 className="text-xl font-bold mb-2 text-white">Oyunlar Yüklenemedi</h3>
              <p className="text-red-400 max-w-sm mb-6">{fetchError}</p>
              <button onClick={() => { fetchGames(); router.refresh(); }} className="px-6 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors font-medium">
                Sayfayı Yenile
              </button>
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center border-white/10 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-400 max-w-sm">
                Arama kriterlerinize uyan bir oyun bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTheme("All");
                  setSelectedPlatform("All");
                }}
                className="mt-6 px-6 py-2 bg-primary/20 text-primary font-medium rounded-lg hover:bg-primary/30 transition-colors border border-primary/50"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
