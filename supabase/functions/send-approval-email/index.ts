import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS Headers for calling from the browser (Admin panel)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, status } = await req.json()

    if (!email || status !== 'approved') {
      throw new Error("Geçersiz payload. 'email' ve status='approved' gerekli.")
    }

    // RESEND API KEY'i Supabase Secrets üzerinden okunmalı:
    // supabase secrets set RESEND_API_KEY=re_123456789
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY bulunamadı.")

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'MFL Game Jam <noreply@mflgamejam.com>', // Resend üzerinde verify edilmiş bir domain olmalı
        to: [email],
        subject: 'MFL Game Jam Hesabınız Onaylandı!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Tebrikler!</h2>
            <p>MFL Game Jam platformundaki öğrenci hesabınız admin tarafından onaylandı.</p>
            <p>Artık platforma giriş yapıp geliştirdiğiniz oyunları yükleyebilirsiniz.</p>
            <br/>
            <p>Başarılar dileriz,<br/>MFL Game Jam Yönetimi</p>
          </div>
        `
      })
    })

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
