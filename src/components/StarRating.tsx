"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StarRatingProps {
  gameId: string;
  initialAverage: number;
  initialVotes: number;
  readOnly?: boolean;
}

const getVisitorId = () => {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID 
         ? crypto.randomUUID() 
         : Math.random().toString(36).substring(2, 15);
    localStorage.setItem('visitor_id', id);
  }
  return id;
};

export default function StarRating({ gameId, initialAverage, initialVotes, readOnly = false }: StarRatingProps) {
  const [average, setAverage] = useState(initialAverage);
  const [votes, setVotes] = useState(initialVotes);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!readOnly) {
       const visitorId = getVisitorId();
       const fetchUserVote = async () => {
         const { data, error } = await supabase
           .from('game_ratings')
           .select('rating')
           .eq('game_id', gameId)
           .eq('visitor_id', visitorId)
           .maybeSingle(); // maybeSingle instead of single to avoid error if 0 rows
           
         if (data && !error) {
           setUserRating(data.rating);
         }
       };
       fetchUserVote();
    }
  }, [gameId, readOnly]);

  const handleVote = async (e: React.MouseEvent, rating: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (readOnly || loading) return;

    setLoading(true);
    const visitorId = getVisitorId();
    const payload = { game_id: gameId, visitor_id: visitorId, rating: Math.round(rating) };

    console.log("Gönderilen puan payload:", payload);

    const { data, error } = await supabase.from('game_ratings').upsert(
      payload,
      { onConflict: 'game_id,visitor_id' }
    ).select();

    console.log("Supabase upsert sonucu:", { data, error });

    if (!error) {
      setUserRating(rating);
      
      // Ortalama puan ve oy sayısını yeniden hesapla
      const { data: allRatings } = await supabase.from('game_ratings').select('rating').eq('game_id', gameId);
      if (allRatings) {
        const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
        setAverage(allRatings.length > 0 ? total / allRatings.length : 0);
        setVotes(allRatings.length);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      console.error("Supabase rating hatası:", error);
      alert("Puan kaydedilemedi: " + error.message);
    }
    setLoading(false);
  };

  const displayRating = hoverRating || userRating || average || 0;

  return (
    <div className="flex flex-col items-start relative z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly || loading}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
            onClick={(e) => handleVote(e, star)}
            className={`transition-all p-0.5 focus:outline-none ${readOnly ? "cursor-default" : "cursor-pointer disabled:opacity-50"}`}
            title={`${star} Yıldız`}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                displayRating >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-500"
              } ${hoverRating && hoverRating >= star && !readOnly ? "scale-110 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" : ""}`}
            />
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-1.5 font-medium min-w-[36px]">
          {average > 0 ? average.toFixed(1) : "0"} ({votes})
        </span>
      </div>
      {showToast && (
        <span className="text-xs text-green-400 font-medium absolute -top-6 left-0 bg-black/90 px-2 py-1 rounded shadow-lg border border-green-500/30 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          Puanınız kaydedildi
        </span>
      )}
    </div>
  );
}
