// Lokasi: src/utils/ai-json-parser.ts

/**
 * Mencari dan mem-parse blok JSON pertama (array atau objek) dari string.
 * Didesain untuk tangguh dalam menangani output dari LLM yang tidak konsisten.
 * @param text String mentah dari respons AI.
 * @returns Objek atau array yang sudah di-parse.
 * @throws {Error} Jika tidak ada blok JSON yang valid ditemukan.
 */
export function parseAiJsonResponse<T>(text: string): T {
  // Cari indeks awal dari '{' atau '['
  const firstBracket = text.indexOf('[');
  const firstBrace = text.indexOf('{');
  
  let startIndex = -1;

  if (firstBracket === -1 && firstBrace === -1) {
    throw new Error("AI response does not contain a JSON object or array.");
  }

  if (firstBracket === -1) {
    startIndex = firstBrace;
  } else if (firstBrace === -1) {
    startIndex = firstBracket;
  } else {
    startIndex = Math.min(firstBracket, firstBrace);
  }

  // Cari Tipe Penutup yang Sesuai
  const startChar = text[startIndex];
  const endChar = startChar === '[' ? ']' : '}';

  // Cari indeks akhir dari '}' atau ']'
  const lastIndex = text.lastIndexOf(endChar);

  if (lastIndex === -1) {
    throw new Error("AI response contains an incomplete JSON structure.");
  }
  
  // Ekstrak substring JSON yang potensial
  let jsonString = text.substring(startIndex, lastIndex + 1);

  // --- PERBAIKAN KUNCI ADA DI SINI ---
  // "Sanitasi" string untuk mengganti karakter kontrol ilegal di dalam string literal.
  // Ini akan mengganti newline literal dengan versi escaped-nya (\n -> \\n)
  // Ini aman dilakukan karena newline yang valid (untuk pemformatan JSON itu sendiri) 
  // tidak akan terpengaruh oleh replace sederhana ini pada string yang sudah diekstrak.
  jsonString = jsonString.replace(/[\n\r]/g, '\\n');

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse the sanitized JSON string:", jsonString);
    console.error("Original parsing error:", error);
    throw new Error(`The extracted and sanitized text from AI was not valid JSON. Error: ${(error as Error).message}`);
  }
}
