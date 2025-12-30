import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, extractMetadata = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    console.log("Scanning album image, extractMetadata:", extractMetadata);

    const systemPrompt = extractMetadata
      ? `You are an expert at reading album covers and track listings from photos.
Extract ALL information you can see from the image and return as a JSON object with this structure:
{
  "album": {
    "title": "Album Name" (string, required - extract from cover or title),
    "artist": "Artist Name" (string, required - extract from cover),
    "year": 1990 (number, optional - if visible),
    "genre": "Rock" (string, optional - infer from style if possible)
  },
  "songs": [
    {"track_number": 1, "title": "Song Name", "duration": "3:45"},
    {"track_number": 2, "title": "Another Song"}
  ]
}
Look carefully at the album cover, back cover, or any visible text to extract the album title and artist name.
If you can only see the track listing but not the cover, still try to extract what you can.
Return ONLY valid JSON, no other text.`
      : `You are an expert at reading album track listings from photos.
Extract the song information from the image and return it as a JSON array.
Each song should have: track_number (integer), title (string), and optionally duration (string like "3:45") and artist (string if different from album artist).
If you cannot read some information, do your best to infer it or leave optional fields empty.
Return ONLY valid JSON array, no other text. Example:
[{"track_number": 1, "title": "Song Name", "duration": "3:45"}, {"track_number": 2, "title": "Another Song"}]`;

    const userPrompt = extractMetadata
      ? "Extract the album title, artist name, and all song titles with track numbers from this album image. Return as JSON object with 'album' and 'songs' fields."
      : "Extract all song titles and track numbers from this album image. Return as JSON array.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response content:", content);

    if (!content) {
      throw new Error("No response from AI");
    }

    // Try to parse the JSON from the response
    let result;
    try {
      // Handle case where AI might wrap in markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse album info from image");
    }

    // Handle different response formats
    if (extractMetadata) {
      // Expecting { album: {...}, songs: [...] }
      if (result.album && result.songs) {
        console.log("Extracted album:", result.album.title, "by", result.album.artist);
        console.log("Found", result.songs.length, "songs");
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (Array.isArray(result)) {
        // AI returned just songs array, return with empty album
        return new Response(
          JSON.stringify({ album: null, songs: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ album: result.album || null, songs: result.songs || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Legacy format - just songs array
      const songs = Array.isArray(result) ? result : (result.songs || []);
      return new Response(
        JSON.stringify({ songs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in scan-album function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
