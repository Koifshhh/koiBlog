exports.handler = async function (event) {

  const GH_TOKEN = process.env.GH_TOKEN;
  const GH_OWNER = process.env.GH_OWNER;
  const GH_REPO = process.env.GH_REPO;
  const GH_BRANCH = process.env.GH_BRANCH || "main";

  if(event.httpMethod !== "POST"){
    return { statusCode:405 };
  }

  const incoming = JSON.parse(event.body);

  const headers = {
    "Authorization": `Bearer ${GH_TOKEN}`,
    "Accept": "application/vnd.github+json"
  };

  // 1. Get current posts.json
  const getRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/posts.json?ref=${GH_BRANCH}`,
    { headers }
  );

  const file = await getRes.json();
  const sha = file.sha;
  const current = Buffer.from(file.content, "base64").toString("utf8");
  let posts = JSON.parse(current);

  // Remove duplicate n
  posts = posts.filter(p => p.n !== incoming.n);

  // Add new at top
  posts.unshift(incoming);

  const updated = JSON.stringify(posts, null, 2);

  // 2. Commit back
  await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/posts.json`,
    {
      method:"PUT",
      headers:{ ...headers, "Content-Type":"application/json" },
      body: JSON.stringify({
        message:`Add post ${incoming.n}. ${incoming.title}`,
        content: Buffer.from(updated).toString("base64"),
        sha,
        branch: GH_BRANCH
      })
    }
  );

  return {
    statusCode:200,
    body: JSON.stringify({ success:true })
  };
};
