"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, Lock, ShieldCheck, Loader2, ExternalLink, Trash2, Users, Gamepad2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [games, setGames] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [adminTab, setAdminTab] = useState<"games" | "users">("games");
  const [gameFilter, setGameFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [userFilter, setUserFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

useEffect(() => {
  if (!authenticated) return;

  if (adminTab === "games") {
    fetchGames();
  }

  if (adminTab === "users") {
    fetchUsers();
  }
}, [authenticated, adminTab]);
  console.log("ADMIN TAB:", adminTab);
console.log("USERS:", users);

  const fetchGames = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
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
        setGames(gamesWithRatings);
      }
    } catch (err: any) {
      setFetchError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message || JSON.stringify(error));
      } else if (data) {
        setUsers(data);
      }
    } catch (err: any) {
      setFetchError(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Musti45*") {
      setAuthenticated(true);
    } else {
      alert("Hatalı şifre!");
    }
  };

  // --- GAME ACTIONS ---
  const handleGameApprove = async (id: string) => {
    const { error } = await supabase.from('games').update({ status: 'approved' }).eq('id', id);
    if (!error) {
      setGames(prev => prev.map(g => g.id === id ? { ...g, status: "approved" } : g));
      router.refresh();
    }
  };

  const handleGameReject = async (id: string) => {
    const { error } = await supabase.from('games').update({ status: 'rejected' }).eq('id', id);
    if (!error) {
      setGames(prev => prev.map(g => g.id === id ? { ...g, status: "rejected" } : g));
      router.refresh();
    }
  };

  const handleGameDelete = async (id: string) => {
    if (window.confirm("Bu oyunu kalıcı olarak silmek istiyor musunuz?")) {
      try {
        await supabase.from('game_ratings').delete().eq('game_id', id);
        const { error } = await supabase.from('games').delete().eq('id', id);
        if (error) alert("Oyun silinirken hata oluştu: " + error.message);
        else {
          setGames(prev => prev.filter(g => g.id !== id));
          fetchGames();
          router.refresh();
        }
      } catch (err: any) {
        alert("Beklenmeyen bir hata oluştu: " + err.message);
      }
    }
  };

  // --- USER ACTIONS ---
  const handleUserApprove = async (id: string, email: string) => {
    try {
      const { error } = await supabase.from('user_profiles').update({ approval_status: 'approved' }).eq('id', id);
      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === id ? { ...u, approval_status: "approved" } : u));
      
      // Edge function tetikle (Mail gönderimi)
      // await supabase.functions.invoke('send-approval-email', { body: { email, status: 'approved' } });
      console.log("Mail gönderme tetiklendi:", email);
      
      router.refresh();
    } catch (err: any) {
      alert("Kullanıcı onaylanırken hata oluştu: " + err.message);
    }
  };

  const handleUserReject = async (id: string) => {
    const { error } = await supabase.from('user_profiles').update({ approval_status: 'rejected' }).eq('id', id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, approval_status: "rejected" } : u));
      router.refresh();
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass p-8 md:p-10 rounded-2xl w-full max-w-md border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Yönetici Girişi</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Yönetici Şifresi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                placeholder="Şifrenizi girin..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-secondary text-white font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all hover:shadow-[0_0_15px_rgba(255,0,60,0.4)]"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredGames = games.filter(g => gameFilter === "all" || g.status === gameFilter);
  const filteredUsers = users.filter(u => userFilter === "all" || u.approval_status === userFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Paneli</h1>
            <p className="text-gray-400">Sistem yönetim merkezi</p>
          </div>
        </div>

        {/* Ana Sekmeler */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 w-full md:w-auto">
          <button
            onClick={() => setAdminTab("games")}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all flex-1 md:flex-none justify-center",
              adminTab === "games" ? "bg-primary/20 text-primary shadow-sm border border-primary/20" : "text-gray-400 hover:text-white"
            )}
          >
            <Gamepad2 className="w-4 h-4" /> Oyunlar
          </button>
          <button
            onClick={() => setAdminTab("users")}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all flex-1 md:flex-none justify-center",
              adminTab === "users" ? "bg-secondary/20 text-secondary shadow-sm border border-secondary/20" : "text-gray-400 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" /> Kullanıcılar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-xl p-10 text-center border-white/10 flex justify-center items-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : fetchError ? (
        <div className="glass rounded-xl p-10 text-center border-red-500/30 bg-red-500/10 min-h-[40vh] flex flex-col items-center justify-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-white">Bağlantı Hatası</h3>
          <p className="text-red-400 mb-4">{fetchError}</p>
          <button onClick={() => adminTab === "games" ? fetchGames() : fetchUsers()} className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors">
            Tekrar Dene
          </button>
        </div>
      ) : adminTab === "games" ? (
        <>
          <div className="flex mb-6 bg-white/5 p-1 rounded-lg border border-white/10 overflow-x-auto inline-flex">
            {(["pending", "approved", "rejected", "all"] as const).map(f => (
              <button key={f} onClick={() => setGameFilter(f)} className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap", gameFilter === f ? "bg-white/10 text-white" : "text-gray-400 hover:text-white")}>
                {f === "all" ? "Tümü" : f === "pending" ? "Bekleyenler" : f === "approved" ? "Onaylananlar" : "Reddedilenler"}
              </button>
            ))}
          </div>

          {filteredGames.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center border-white/10">Sonuç Bulunamadı</div>
          ) : (
            <div className="grid gap-6">
              {filteredGames.map(game => (
                <div key={game.id} className="glass rounded-xl p-5 flex flex-col md:flex-row gap-6 border-white/10 hover:border-white/20 transition-all">
                  <div className="relative w-full md:w-72 aspect-video rounded-lg overflow-hidden flex-shrink-0 neon-border bg-surface">
                    <Image src={game.image_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"} alt={game.title || "Oyun Görseli"} fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className={clsx("text-xs px-2 py-1 rounded-full font-bold uppercase backdrop-blur-md border", game.status === "approved" && "bg-primary/20 text-primary border-primary/50", game.status === "pending" && "bg-yellow-500/20 text-yellow-500 border-yellow-500/50", game.status === "rejected" && "bg-red-500/20 text-red-500 border-red-500/50")}>
                        {game.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{game.title || "İsimsiz Oyun"}</h3>
                        <p className="text-sm text-gray-400">Takım: <span className="text-gray-200">{game.team_name || "Belirtilmedi"}</span></p>
                        {game.team_members && <p className="text-xs text-gray-500 mt-1">Üyeler: {game.team_members}</p>}
                        {game.user_profiles && <p className="text-xs text-primary mt-1">Yükleyen: {game.user_profiles.full_name}</p>}
                      </div>
                      {game.game_url && (
                        <a href={game.game_url} target="_blank" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-300 border border-white/10 flex-shrink-0">
                          <ExternalLink className="w-4 h-4" /> Linki Aç
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 mb-4">
                      <span className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-300">{game.theme || "Tema Belirtilmedi"}</span>
                      <span className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-300">{game.engine || "Motor Belirtilmedi"}</span>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">{game.description || "Açıklama belirtilmedi."}</p>

                    <div className="flex flex-row flex-wrap gap-3 mt-auto pt-4 border-t border-white/5">
                      {game.status === "pending" && (
                        <>
                          <button onClick={() => handleGameApprove(game.id)} className="flex-1 md:flex-none md:w-32 py-2.5 px-4 rounded-lg bg-primary/20 text-primary font-bold hover:bg-primary/30 border border-primary/50 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Onayla</button>
                          <button onClick={() => handleGameReject(game.id)} className="flex-1 md:flex-none md:w-32 py-2.5 px-4 rounded-lg glass text-secondary font-bold hover:bg-secondary/10 border-secondary/30 border flex items-center justify-center gap-2"><X className="w-4 h-4" /> Reddet</button>
                        </>
                      )}
                      <button onClick={() => handleGameDelete(game.id)} className="flex-1 md:flex-none md:w-32 py-2.5 px-4 rounded-lg bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex mb-6 bg-white/5 p-1 rounded-lg border border-white/10 overflow-x-auto inline-flex">
            {(["pending", "approved", "rejected", "all"] as const).map(f => (
              <button key={f} onClick={() => setUserFilter(f)} className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap", userFilter === f ? "bg-white/10 text-white" : "text-gray-400 hover:text-white")}>
                {f === "all" ? "Tümü" : f === "pending" ? "Bekleyenler" : f === "approved" ? "Onaylananlar" : "Reddedilenler"}
              </button>
            ))}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center border-white/10">Kullanıcı Bulunamadı</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <div key={user.id} className="glass rounded-xl p-5 border-white/10 hover:border-white/20 transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{user.full_name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Sınıf/No: {user.school_info || "-"}</p>
                    </div>
                    <span className={clsx("text-xs px-2 py-1 rounded-full font-bold uppercase backdrop-blur-md border", user.approval_status === "approved" && "bg-primary/20 text-primary border-primary/50", user.approval_status === "pending" && "bg-yellow-500/20 text-yellow-500 border-yellow-500/50", user.approval_status === "rejected" && "bg-red-500/20 text-red-500 border-red-500/50")}>
                      {user.approval_status}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                    {user.approval_status === "pending" && (
                      <>
                        <button onClick={() => handleUserApprove(user.id, user.email)} className="flex-1 py-2 px-3 rounded-lg bg-primary/20 text-primary font-bold hover:bg-primary/30 border border-primary/50 flex items-center justify-center gap-1.5 text-sm"><Check className="w-4 h-4" /> Onayla</button>
                        <button onClick={() => handleUserReject(user.id)} className="flex-1 py-2 px-3 rounded-lg glass text-secondary font-bold hover:bg-secondary/10 border-secondary/30 border flex items-center justify-center gap-1.5 text-sm"><X className="w-4 h-4" /> Reddet</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
