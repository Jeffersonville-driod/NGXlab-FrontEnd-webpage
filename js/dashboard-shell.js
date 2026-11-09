const navigation = [
  ["overview", "Overview", "⌂", "dashboard.html"],
  ["markets", "Markets", "▥", "markets.html"],
  ["new", "New", "↗", "new.html"],
  ["portfolio", "Portfolio", "◫", "portfolio.html"],
  ["wallet", "Wallet", "₦", "wallet.html"],
  ["resources", "Resources", "▤", "resources.html"],
  ["learn", "Learn", "✳", "learn.html"],
  ["contest", "Contest", "★", "contest.html"],
  ["help-center", "Help center", "?", "help-center.html"]
];

const currentPage = document.body.dataset.dashboardPage;
const shell = document.getElementById("app-shell");
const main = shell?.querySelector(".app-main");
const content = main?.querySelector(".dashboard-content");

if (shell && main && content) {
  const sidebar = document.createElement("aside");
  sidebar.className = "app-sidebar";
  sidebar.setAttribute("aria-label", "Dashboard sidebar");
  sidebar.innerHTML = `
    <a class="dashboard-brand" href="dashboard.html" aria-label="NGXLab practice overview">
      <span class="dashboard-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M12 5h12l-2 8 7 15H7l7-15-2-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M11 23h14M14 18l3 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="23" cy="8" r="1.4" fill="#ff7900"/>
        </svg>
      </span>
      <span class="dashboard-brand-name">NGX<span>Lab</span></span>
    </a>
    <p class="sidebar-label">PRACTICE SPACE</p>
    <nav class="app-navigation" aria-label="Practice navigation"></nav>
    <div class="sidebar-note">
      <span class="sidebar-note-icon" aria-hidden="true">✳</span>
      <strong>Learn by doing</strong>
      <p>Build confidence with virtual money. No deposits, no real losses.</p>
    </div>
    <div class="sidebar-footer">
      <span class="practice-mode"><span aria-hidden="true"></span> Practice mode</span>
      <a href="terms-and-conditions.html">Terms &amp; Conditions</a>
      <a href="index.html">About NGXLab</a>
    </div>`;

  const nav = sidebar.querySelector(".app-navigation");
  for (const [page, label, icon, href] of navigation) {
    const link = document.createElement("a");
    link.className = "app-nav-link";
    link.href = href;
    if (page === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }

    const mark = document.createElement("span");
    mark.className = "app-nav-icon";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = icon;
    link.append(mark, document.createTextNode(label));
    nav.append(link);
  }

  const topbar = document.createElement("header");
  topbar.className = "app-topbar";
  const searchQuery = new URLSearchParams(window.location.search).get("q") || "";
  topbar.innerHTML = `
    <label class="dashboard-search">
      <span aria-hidden="true">⌕</span>
      <input id="market-search" type="search" placeholder="Search stocks…" aria-label="Search NGX stocks">
      <kbd>⌘ K</kbd>
    </label>
    <div class="topbar-actions">
      <span class="practice-pill"><span aria-hidden="true"></span> Demo account</span>
      <span class="profile-button" id="user-avatar" aria-hidden="true">N</span>
    </div>`;

  const searchInput = topbar.querySelector("#market-search");
  searchInput.value = searchQuery;
  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const query = event.currentTarget.value.trim();
    if (query) window.location.assign(`markets.html?q=${encodeURIComponent(query)}`);
  });
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }
  });

  main.insertBefore(topbar, content);
  shell.prepend(sidebar);
}
