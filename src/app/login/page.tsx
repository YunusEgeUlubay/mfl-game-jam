"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        router.push("/submit");
      }
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      setError("E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="glass p-8 md:p-10 rounded-2xl w-full max-w-md border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-secondary" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Öğrenci Girişi</h1>
        <p className="text-center text-gray-400 mb-8 text-sm">Oyun yüklemek için hesabına giriş yap</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">E-posta Adresi</label>
            <input
              required
              name="email"
              type="email"
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="E-posta adresiniz"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Şifre</label>
            <input
              required
              name="password"
              type="password"
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              placeholder="Şifreniz"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-secondary text-white font-bold tracking-wider hover:bg-secondary/90 transition-all hover:shadow-[0_0_15px_rgba(255,0,60,0.4)] flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-secondary hover:underline font-medium">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
