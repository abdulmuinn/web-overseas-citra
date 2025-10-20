import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parsing body
    const { message } = await req.json();
    if (!message || message.trim() === "") {
      throw new Error("Field 'message' kosong atau tidak valid.");
    }

    // Ambil API key dari Environment
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY belum diset di environment Supabase.");
    }

    // Prompt sistem
    const systemPrompt = `Kamu adalah Chatbot Citra Overseas Assistant milik PT Citra Insan Mandiri.
Jawablah dengan sopan, ramah, dan ringkas dalam Bahasa Indonesia.

Informasi yang bisa kamu berikan:
- Program kerja luar negeri tersedia di berbagai negara (Jepang, Korea, Taiwan, Singapura, dll)
- Proses seleksi: Pendaftaran → Seleksi Berkas → Interview → Medical Check-up → Training → Berangkat
- Biaya administrasi bervariasi tergantung negara tujuan (hubungi kantor untuk detail)
- Dokumen yang diperlukan: KTP, KK, Ijazah, Paspor, Foto
- Gaji disesuaikan dengan negara dan posisi (biasanya Rp 15–40 juta/bulan)
- Kontrak kerja biasanya 2–3 tahun
- PT CIM sudah berpengalaman lebih dari 10 tahun mengirim pekerja ke luar negeri

Jika ada pertanyaan yang tidak bisa kamu jawab, arahkan pengguna untuk menghubungi kantor langsung.`;

    // Panggil Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    // Debugging log
    console.log("Response status:", response.status);
    console.log("Raw response:", await response.clone().text());

    // Kalau error dari Gemini
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("Gemini API error: " + errorText);
    }

    // Parsing hasil dari Gemini
    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output_text ||
      "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

    // Kirim hasil ke client
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat-assistant:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
