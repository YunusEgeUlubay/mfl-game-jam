"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, Lock, Loader2 } from "lucide-react";
import { THEMES, PLATFORMS } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    setSubmitError(null);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const team_name = formData.get('team_name') as string;
    const team_members = formData.get('team_members') as string;
    const description = formData.get('description') as string;
    const theme = formData.get('theme') as string;
    const engine = formData.get('engine') as string;
    const game_url = formData.get('game_url') as string;
    const image_url = formData.get('image_url') as string || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop";

    const { error } = await supabase.from('games').insert([
      {
        title,
        team_name,
        team_members,
        description,
        theme,
        engine,
        game_url,
        image_url,
        status: 'pending',
        user_id: userProfile.id
      }
    ]);

    setLoading(false);
    if (!error) {
      setSubmitted(true);
    } else {
      setSubmitError(error.message || JSON.stringify(error));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (userProfile?.approval_status !== 'approved') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass p-10 rounded-2xl text-center max-w-lg w-full neon-border border-yellow-500">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Onay Bekleniyor</h2>
          <p className="text-gray-400 mb-8">
            {userProfile?.approval_status === 'rejected' 
              ? "Hesabınız admin tarafından reddedildi. Oyun yükleyemezsiniz."
              : "Hesabınız admin onayı bekliyor. Onaylandıktan sonra oyun yükleyebilirsiniz."}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass p-10 rounded-2xl text-center max-w-lg w-full neon-border border-primary">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Başarıyla Gönderildi!</h2>
          <p className="text-gray-400 mb-8">
            Oyununuz başarıyla gönderildi, admin onayı bekliyor.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
          >
            Yeni Oyun Yükle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-4">
          Oyununu <span className="text-primary text-glow">Yükle</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Geliştirdiğin oyunu MFL Game Jam platformunda sergilemek için aşağıdaki formu doldur.
        </p>
      </div>

      <div className="glass p-8 md:p-10 rounded-2xl border-white/10 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl z-[-1]" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Oyun Adı</label>
              <input 
                required 
                name="title"
                type="text" 
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Örn: Neon Ascend"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Takım Adı</label>
              <input 
                required 
                name="team_name"
                type="text" 
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Örn: Neon Studio"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Takım Üyeleri (Opsiyonel)</label>
            <input 
              name="team_members"
              type="text" 
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Örn: Ahmet (Geliştirici), Ayşe (Tasarımcı)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Oyun Açıklaması</label>
            <textarea 
              required 
              name="description"
              rows={4}
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              placeholder="Oyununuzun hikayesini ve nasıl oynandığını anlatın..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Tema</label>
              <select required name="theme" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
                <option value="">Tema Seçin</option>
                {THEMES.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Platform / Motor</label>
              <select required name="engine" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none">
                <option value="">Platform Seçin</option>
                {PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Oyun Linki (İndirme veya Oynama URL'si)</label>
            <input 
              required 
              name="game_url"
              type="url" 
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="https://itch.io/... veya Google Drive linki"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Kapak Görseli URL (Opsiyonel)</label>
            <input 
              name="image_url"
              type="url" 
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="https://... (boş bırakılırsa varsayılan atanır)"
            />
          </div>

          {submitError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <span className="font-bold">Hata:</span> {submitError}
            </div>
          )}

          <div className="pt-6 border-t border-white/10 mt-8">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Oyunu Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
