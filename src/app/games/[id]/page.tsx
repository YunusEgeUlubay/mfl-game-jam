"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { Play, Share2, AlertCircle, ArrowLeft } from "lucide-react";
import { Game } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

export default function GameDetailPage() {
  const params = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*, game_ratings(rating)')
        .eq('id', params.id)
        .single();
      
      if (!error && data) {
        const ratings = data.game_ratings || [];
        const total = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
        const gameWithRatings = {
          ...data,
          total_votes: ratings.length,
          average_rating: ratings.length > 0 ? total / ratings.length : 0
        };
        setGame(gameWithRatings as Game);
      } else {
        setGame(null);
      }
      setLoading(false);
    };
    if (params.id) {
      fetchGame();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-secondary mb-4" />
        <h1 className="text-3xl font-bold mb-4">Oyun Bulunamadı</h1>
        <Link href="/games" className="text-primary hover:underline">
          Oyunlara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      <Link href="/games" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Oyunlara Dön
      </Link>

      {/* Hero Image */}
      <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 neon-border shadow-2xl">
        <Image
          src={game.image_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"}
          alt={game.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <div className="flex gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
              {game.theme}
            </span>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-accent/20 text-accent border border-accent/30 backdrop-blur-md">
              {game.engine}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white text-glow mb-2">
            {game.title}
          </h1>
          <p className="text-xl text-gray-300">Takım: <span className="text-white font-medium">{game.team_name}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 text-primary">Oyun Hakkında</h2>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {game.description}
            </p>
          </div>

          {game.team_members && (
            <div className="glass rounded-2xl p-8 border-white/10">
              <h2 className="text-2xl font-bold mb-4 text-accent">Takım Üyeleri</h2>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {game.team_members}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border-white/10 flex flex-col gap-4">
            {game.game_url && (
              <a 
                href={game.game_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-black" />
                Oyunu Oyna
              </a>
            )}
            
            <div className="flex flex-col gap-4">
              <div className="w-full py-3 rounded-xl border border-white/10 glass flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-bold text-gray-300">Bu oyunu puanla</span>
                <StarRating 
                  gameId={game.id} 
                  initialAverage={game.average_rating || 0} 
                  initialVotes={game.total_votes || 0} 
                />
              </div>
              
              <button className="w-full py-3 rounded-xl glass border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-gray-300">
                <Share2 className="w-5 h-5" />
                Paylaş
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border-white/10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Detaylar</h3>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-500">Yüklenme Tarihi</span>
                <span className="text-gray-300">{new Date(game.created_at).toLocaleDateString("tr-TR")}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Platform</span>
                <span className="text-gray-300">{game.engine}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Tema</span>
                <span className="text-gray-300">{game.theme}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Durum</span>
                <span className="text-primary">Onaylandı</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
