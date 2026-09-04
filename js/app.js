/* Interactive CV/Portfolio — loads YAML configs and renders all sections. */

const state = {
  profile: null,
  tech: null,
  domains: null,
  education: null,
  projects: null,
  skillById: new Map(),
  domainById: new Map(),
  activeCategory: "All",
  selectedTech: new Set(),
  selectedDomain: null,
};

/* ── Utilities ───────────────────────────────────────────────── */

function esc(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

async function loadYaml(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return jsyaml.load(await res.text());
}

/* Logo with graceful fallback to emoji if the image is missing. */
function logoHtml(logo, emoji) {
  if (logo) {
    return `<span class="edu-logo"><img src="${esc(logo)}" alt="" loading="lazy"
      onerror="this.parentElement.textContent='${esc(emoji || "🎓")}'"></span>`;
  }
  return `<span class="edu-logo">${esc(emoji || "🎓")}</span>`;
}

/* Small icon badge for tech chips/tags: real logo (icon) with a white
   backdrop for legibility, falling back to the plain emoji if the
   icon is absent or fails to load. `size` is "chip" or "tag". */
function iconBadgeHtml(icon, emoji, size) {
  const sizeClass = `size-${size}`;
  if (icon) {
    return `<span class="icon-badge ${sizeClass}"><img src="${esc(icon)}" alt="" loading="lazy"
      onerror="this.parentElement.classList.add('emoji-only');this.parentElement.textContent='${esc(emoji || "")}'"></span>`;
  }
  return `<span class="icon-badge ${sizeClass} emoji-only">${esc(emoji || "")}</span>`;
}

/* ── Theme toggle ────────────────────────────────────────────── */

function initTheme() {
  const btn = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("theme-toggle").textContent = theme === "dark" ? "🌙" : "☀️";
}

/* ── Hero ────────────────────────────────────────────────────── */

function renderHero() {
  const p = state.profile;
  const avatar = p.photo
    ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}">`
    : esc(p.avatar_emoji || "👋");
  const contacts = (p.contact || [])
    .map(
      (c) => `<a class="contact-link" href="${esc(c.href)}" target="_blank" rel="noopener">
        <span>${esc(c.emoji)}</span><span>${esc(c.value)}</span></a>`
    )
    .join("");

  document.getElementById("hero").innerHTML = `
    <div class="hero-avatar">${avatar}</div>
    <div>
      <h1 class="hero-name">${esc(p.name)}</h1>
      <p class="hero-role">${esc(p.role)}</p>
      <p class="hero-tagline">${esc(p.tagline)}</p>
      <span class="hero-location">📍 ${esc(p.location)}</span>
      <div class="hero-contacts">${contacts}</div>
    </div>`;

  document.getElementById("footer-text").textContent =
    `${p.name} — ${p.role} · content driven by YAML configs in /data`;
  document.title = `${p.name} — ${p.role}`;
}

/* ── Tech stack ──────────────────────────────────────────────── */

function renderTechFilters() {
  const names = ["All", ...state.tech.categories.map((c) => c.name)];
  document.getElementById("tech-filters").innerHTML = names
    .map(
      (n) => `<button class="pill ${n === state.activeCategory ? "active" : ""}"
        data-category="${esc(n)}">${esc(n)}</button>`
    )
    .join("");
}

function renderTechGrid() {
  const categories =
    state.activeCategory === "All"
      ? state.tech.categories
      : state.tech.categories.filter((c) => c.name === state.activeCategory);

  document.getElementById("tech-grid").innerHTML = categories
    .map(
      (cat) => `
      <div class="tech-category">
        <h3><span>${esc(cat.emoji)}</span>${esc(cat.name)}</h3>
        <div class="chip-row">
          ${cat.skills
            .map(
              (s) => `<button class="chip ${state.selectedTech.has(s.id) ? "active" : ""}"
                data-skill="${esc(s.id)}">${iconBadgeHtml(s.icon, s.emoji, "chip")}${esc(s.name)}</button>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");
}

/* ── Domains ─────────────────────────────────────────────────── */

function renderDomains() {
  document.getElementById("domain-grid").innerHTML = state.domains.domains
    .map(
      (d) => `<button class="domain-card ${state.selectedDomain === d.id ? "active" : ""}"
        data-domain="${esc(d.id)}">
        <span class="domain-emoji">${esc(d.emoji)}</span>
        <h3>${esc(d.name)}</h3>
        <p>${esc(d.blurb)}</p>
      </button>`
    )
    .join("");
}

/* ── Education & certificates ────────────────────────────────── */

function renderEducation() {
  const edu = state.education.education || [];
  const certs = state.education.certificates || [];

  document.getElementById("education-list").innerHTML =
    `<h3>Education</h3>` +
    edu
      .map(
        (e) => `<div class="edu-item">
          ${logoHtml(e.logo, e.emoji)}
          <div>
            <h4>${esc(e.degree)}</h4>
            <p class="edu-meta">${esc(e.school)} · ${esc(e.period)}</p>
            ${e.details ? `<p class="edu-details">${esc(e.details)}</p>` : ""}
          </div>
        </div>`
      )
      .join("");

  document.getElementById("certificates-list").innerHTML =
    `<h3>Certificates</h3>` +
    certs
      .map((c) => {
        const title = c.url
          ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>`
          : esc(c.name);
        return `<div class="edu-item">
          ${logoHtml(c.logo, c.emoji)}
          <div>
            <h4>${title}</h4>
            <p class="edu-meta">${esc(c.issuer)} · ${esc(c.year)}</p>
          </div>
        </div>`;
      })
      .join("");
}

/* ── Projects ────────────────────────────────────────────────── */

function projectMatchesFilters(project) {
  if (state.selectedDomain && project.domain !== state.selectedDomain) return false;
  for (const techId of state.selectedTech) {
    if (!(project.tech || []).includes(techId)) return false;
  }
  return true;
}

function renderProjects() {
  const visible = state.projects.projects.filter(projectMatchesFilters);

  document.getElementById("no-results").classList.toggle("hidden", visible.length > 0);
  document.getElementById("project-list").innerHTML = visible
    .map((p) => {
      const domain = state.domainById.get(p.domain);
      const techTags = (p.tech || [])
        .map((id) => {
          const s = state.skillById.get(id);
          return s
            ? `<span class="tech-tag">${iconBadgeHtml(s.icon, s.emoji, "tag")}${esc(s.name)}</span>`
            : `<span class="tech-tag">${esc(id)}</span>`;
        })
        .join("");

      return `<article class="project-card">
        <div class="project-head">
          <h3 class="project-title">${esc(p.title)}</h3>
          <span class="project-period">${esc(p.period)}</span>
        </div>
        <div class="project-meta">
          ${domain ? `<span class="domain-badge">${esc(domain.emoji)} ${esc(domain.name)}</span>` : ""}
          <span class="meta-item">🏢 ${esc(p.client)}</span>
          <span class="meta-item">📍 ${esc(p.location)}</span>
          <span class="meta-item">👥 Team of ${esc(p.team_size)}</span>
        </div>
        <div class="project-lists">
          <div>
            <h4>Responsibilities</h4>
            <ul>${(p.responsibilities || []).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
          </div>
          <div>
            <h4>Deliverables</h4>
            <ul>${(p.deliverables || []).map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="project-tech">${techTags}</div>
      </article>`;
    })
    .join("");
}

function renderActiveFilters() {
  const bar = document.getElementById("active-filters");
  const tags = [];

  if (state.selectedDomain) {
    const d = state.domainById.get(state.selectedDomain);
    tags.push(
      `<button class="filter-tag" data-remove-domain="1">${esc(d.emoji)} ${esc(d.name)} ✕</button>`
    );
  }
  for (const id of state.selectedTech) {
    const s = state.skillById.get(id);
    tags.push(
      `<button class="filter-tag" data-remove-tech="${esc(id)}">${iconBadgeHtml(s.icon, s.emoji, "tag")}${esc(s.name)} ✕</button>`
    );
  }

  if (tags.length === 0) {
    bar.classList.add("hidden");
    bar.innerHTML = "";
    return;
  }
  bar.classList.remove("hidden");
  bar.innerHTML =
    `<span>Filtering by:</span>` +
    tags.join("") +
    `<button class="clear-filters" data-clear="1">Clear all</button>`;
}

function refreshFiltered() {
  renderTechGrid();
  renderDomains();
  renderActiveFilters();
  renderProjects();
}

/* ── Events (delegated) ──────────────────────────────────────── */

function initEvents() {
  document.getElementById("tech-filters").addEventListener("click", (e) => {
    const pill = e.target.closest("[data-category]");
    if (!pill) return;
    state.activeCategory = pill.dataset.category;
    renderTechFilters();
    renderTechGrid();
  });

  document.getElementById("tech-grid").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-skill]");
    if (!chip) return;
    const id = chip.dataset.skill;
    state.selectedTech.has(id) ? state.selectedTech.delete(id) : state.selectedTech.add(id);
    refreshFiltered();
  });

  document.getElementById("domain-grid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-domain]");
    if (!card) return;
    const id = card.dataset.domain;
    state.selectedDomain = state.selectedDomain === id ? null : id;
    refreshFiltered();
  });

  document.getElementById("active-filters").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.clear) {
      state.selectedTech.clear();
      state.selectedDomain = null;
    } else if (t.dataset.removeDomain) {
      state.selectedDomain = null;
    } else if (t.dataset.removeTech) {
      state.selectedTech.delete(t.dataset.removeTech);
    }
    refreshFiltered();
  });
}

/* ── Bootstrap ───────────────────────────────────────────────── */

async function init() {
  initTheme();

  [state.profile, state.tech, state.domains, state.education, state.projects] =
    await Promise.all([
      loadYaml("data/profile.yaml"),
      loadYaml("data/tech.yaml"),
      loadYaml("data/domains.yaml"),
      loadYaml("data/education.yaml"),
      loadYaml("data/projects.yaml"),
    ]);

  for (const cat of state.tech.categories) {
    for (const skill of cat.skills) state.skillById.set(skill.id, skill);
  }
  for (const d of state.domains.domains) state.domainById.set(d.id, d);

  renderHero();
  renderTechFilters();
  renderTechGrid();
  renderDomains();
  renderEducation();
  renderProjects();
  initEvents();
}

init().catch((err) => {
  document.getElementById("project-list").innerHTML =
    `<p class="no-results">Failed to load site data: ${esc(err.message)}.<br>
     If you opened index.html directly, serve it instead: <code>python3 -m http.server</code></p>`;
  console.error(err);
});
