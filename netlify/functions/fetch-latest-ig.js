exports.handler = async function () {
  try {
    const IG_USER_ID = process.env.IG_USER_ID;
    const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

    const url = `https://graph.facebook.com/v19.0/${IG_USER_ID}/media?fields=id,caption,permalink,timestamp&limit=1&access_token=${IG_ACCESS_TOKEN}`;

    const r = await fetch(url);
    const payload = await r.json();
    const item = payload?.data?.[0] || {};
    const caption = item.caption || "";

    let parsed = {};
    const firstLine = caption.split(/\r?\n/)[0];
    const m = firstLine.match(/^(\d{1,2})\.\s+(.+)$/);
    if(m){
      parsed = { n:Number(m[1]), title:m[2] };
    }

    const detected = {};
    const spotify = caption.match(/https?:\/\/open\.spotify\.com\/\S+/i);
    const apple = caption.match(/https?:\/\/(music\.)?apple\.com\/\S+/i);
    if(spotify) detected.spotify = spotify[0];
    if(apple) detected.apple = apple[0];

    return {
      statusCode:200,
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({
        id:item.id,
        caption,
        parsed,
        detected
      })
    };
  } catch (e) {
    return {
      statusCode:500,
      body: JSON.stringify({ error:"IG fetch failed" })
    };
  }
};
