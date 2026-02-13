// Fetches your most recent Instagram post caption via the official Instagram Graph API.
//
// ENV vars required in Netlify:
//   IG_USER_ID = your Instagram Business Account ID
//   IG_ACCESS_TOKEN = long-lived access token
//
// Returns:
// { id, timestamp, permalink, caption, parsed: {n, title}, detected: {spotify, apple} }

export default async () => {
  try {
    const IG_USER_ID = process.env.IG_USER_ID;
    const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "Missing IG_USER_ID or IG_ACCESS_TOKEN env vars." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const fields = ["id", "caption", "permalink", "timestamp"].join(",");

    const url = new URL(`https://graph.facebook.com/v19.0/${IG_USER_ID}/media`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", "1");
    url.searchParams.set("access_token", IG_ACCESS_TOKEN);

    const r = await fetch(url.toString(), { headers: { "accept": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: "Instagram API error", detail: t }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    const payload = await r.json();
    const item = payload?.data?.[0] || {};
    const caption = item.caption || "";

    // Parse first line like: "12. Never forget"
    let parsed = {};
    const firstLine = caption.split(/\r?\n/)[0] || "";
    const m = firstLine.match(/^\s*(\d{1,2})\.?\s+(.+?)\s*$/);
    if (m) parsed = { n: Number(m[1]), title: m[2] };

    // Detect Spotify/Apple links if present in caption
    const detected = {};
    const spotifyMatch = caption.match(/https?:\/\/open\.spotify\.com\/\S+/i);
    const appleMatch = caption.match(/https?:\/\/(music\.)?apple\.com\/\S+/i);
    if (spotifyMatch) detected.spotify = spotifyMatch[0].replace(/[)\],.?!]+$/,"");
    if (appleMatch) detected.apple = appleMatch[0].replace(/[)\],.?!]+$/,"");

    return new Response(JSON.stringify({
      id: item.id,
      timestamp: item.timestamp,
      permalink: item.permalink,
      caption,
      parsed,
      detected
    }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store"
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", detail: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
