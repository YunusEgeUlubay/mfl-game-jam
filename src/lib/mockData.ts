export type GameStatus = "pending" | "approved" | "rejected";

export interface Game {
  id: string;
  title: string;
  team_name: string;
  team_members: string;
  description: string;
  theme: string;
  engine: string;
  image_url: string;
  game_url: string;
  status: GameStatus;
  created_at: string;
  game_ratings?: { rating: number; user_id: string }[];
  average_rating?: number;
  total_votes?: number;
}

export const THEMES = ["Arena", "Tırmanma", "Dostluk", "Şifa", "Engelden Kaç"];
export const PLATFORMS = ["Unity", "Unreal Engine", "PythonGame"];

