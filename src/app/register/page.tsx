"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const schoolInfo = formData.get("schoolInfo") as string;

    try {
      // 1. Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. user_profiles tablosuna ekle
        const { error: profileError } = await supabase.from("user_profiles").insert([
          {
            id: authData.user.id,
            full_name: fullName,
            email: email,
            school_info: schoolInfo,
            approval_status: "pending"
          }
        ]);

        if (profileError) throw profileError;

        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Kayıt hatası:", err);
      setError(err.message || "Kayıt işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass p-10 rounded-2xl text-center max-w-md w-full neon-border border-primary">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Kayıt Başarılı!</h2>
          <p className="text-gray-400 mb-6">
            Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="glass p-8 md:p-10 rounded-2xl w-full max-w-md border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserPlus className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Hesap Oluştur</h1>
        <p className="text-center text-gray-400 mb-8 text-sm">Oyun yüklemek için platforma kayıt ol</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Ad Soyad</label>
            <input
              required
              name="fullName"
              type="text"
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Adınız ve Soyadınız"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Okul Numarası / Sınıf</label>
            <input
              required
              name="schoolInfo"
              type="text"
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Örn: 12A / 1024"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">E-posta Adresi</label>
            <input
              required
              name="email"
              type="email"
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="ornek@manisafen.k12.tr"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Şifre</label>
            <input
              required
              name="password"
              type="password"
              minLength={6}
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="En az 6 karakter"
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
            className="w-full py-3.5 mt-2 rounded-xl bg-primary text-black font-bold tracking-wider hover:bg-primary/90 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
