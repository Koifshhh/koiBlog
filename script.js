async function loadPosts() {
  const el = document.getElementById("postList");

  try {
    const res = await fetch("posts.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load posts.json");

    const posts = await res.json();
    posts.sort((a, b) => a.n - b.n);

    el.innerHTML = posts.map(p => renderPost(p)).join("");
  } catch (err) {
    el.innerHTML = `<p class="muted">Couldn’t load posts. (${err.message})</p>`;
  }
}

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPost(p) {
  const n = String(p.n ?? "").padStart(2, "0");
  const title = esc(p.title ?? "(untitled)");
  const caption = esc(p.caption ?? "");

  const spotify = p.spotify ? `<a href="${esc(p.spotify)}" target="_blank" rel="noreferrer">Listen on Spotify</a>` : "";
  const apple = p.apple ? `<a href="${esc(p.apple)}" target="_blank" rel="noreferrer">Listen on Apple Music</a>` : "";
  const divider = (p.spotify && p.apple) ? `<span class="divider">•</span>` : "";

  const listen = (p.spotify || p.apple)
    ? `<div class="listen">${spotify}${divider}${apple}</div>`
    : "";

  return `
    <article class="post">
      <div><span class="num">${n}.</span><span class="title">${title}</span></div>
      <div class="caption">${caption}</div>
      ${listen}
    </article>
  `;
}

loadPosts();
