import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";
import { Game } from "@/lib/mockData";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`} className="block group">
      <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:neon-border hover:shadow-2xl h-full flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={game.image_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
              {game.theme}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded bg-accent/20 text-accent border border-accent/30 backdrop-blur-md">
              {game.engine}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
            {game.description}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
            <span className="text-xs text-gray-500">Takım: {game.team_name}</span>
            <div className="flex items-center gap-3">
              <StarRating 
                gameId={game.id} 
                initialAverage={game.average_rating || 0} 
                initialVotes={game.total_votes || 0} 
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
