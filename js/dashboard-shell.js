const navigation = [
  ["overview", "Home", "⌂", "dashboard.html"],
  ["portfolio", "Portfolio", "◫", "portfolio.html"],
  ["new", "Invest", "↗", "new.html"],
  ["wallet", "Wallets", "₦", "wallet.html"],
  ["history", "History", "▣", "portfolio.html"]
];

const currentPage = document.body.dataset.dashboardPage;
const shell = document.getElementById("app-shell");
const main = shell?.querySelector(".app-main");
const content = main?.querySelector(".dashboard-content");

if (shell && main && content) {
  const sidebar = document.createElement("aside");
  sidebar.className = "app-sidebar";
  sidebar.id = "dashboard-sidebar";
  sidebar.setAttribute("aria-label", "Dashboard sidebar");
  sidebar.innerHTML = `
    <div class="sidebar-head">
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
      <button class="sidebar-close" type="button" aria-label="Close dashboard navigation">×</button>
    </div>
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
  const primaryLinks = [
    ["overview", "Home", "⌂", "dashboard.html"],
    ["portfolio", "Portfolio", "◫", "portfolio.html"]
  ];

  for (const [page, label, icon, href] of primaryLinks) {
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

  const investGroup = document.createElement("div");
  investGroup.className = "app-nav-group";

  const investTrigger = document.createElement("button");
  investTrigger.type = "button";
  investTrigger.className = "app-nav-link app-nav-trigger";
  investTrigger.setAttribute("aria-expanded", "false");
  investTrigger.setAttribute("aria-label", "Expand investment options");

  const investMark = document.createElement("span");
  investMark.className = "app-nav-icon";
  investMark.setAttribute("aria-hidden", "true");
  investMark.textContent = "↗";

  const investLabel = document.createElement("span");
  investLabel.textContent = "Invest";
  investTrigger.append(investMark, investLabel);

  const investMenu = document.createElement("div");
  investMenu.className = "app-nav-submenu";
  investMenu.hidden = true;

  const investItems = [
    ["Nigerian Stocks", "◉", "markets.html"],
    ["Public Offering", "▣", "new.html"],
    ["FGN Savings Bond", "▤", "new.html"],
    ["Treasury Bills", "▥", "new.html"],
    ["Commercial Papers", "◌", "new.html"]
  ];

  for (const [itemLabel, itemIcon, itemHref] of investItems) {
    const item = document.createElement("a");
    item.className = "app-nav-subitem";
    item.href = itemHref;

    const icon = document.createElement("span");
    icon.className = "app-nav-sub-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = itemIcon;

    const label = document.createElement("span");
    label.className = "app-nav-sub-label";
    const isComingSoon = itemLabel !== "Nigerian Stocks";
    label.textContent = isComingSoon ? `${itemLabel} (Coming soon)` : itemLabel;

    item.append(icon, label);
    investMenu.append(item);
  }

  investTrigger.addEventListener("click", () => {
    const isOpen = investTrigger.getAttribute("aria-expanded") === "true";
    investTrigger.setAttribute("aria-expanded", String(!isOpen));
    investMenu.hidden = isOpen;
    investGroup.classList.toggle("is-open", !isOpen);
  });

  investGroup.append(investTrigger, investMenu);
  nav.append(investGroup);

  const secondaryLinks = [
    ["wallet", "Wallets", "₦", "wallet.html"],
    ["history", "History", "▣", "portfolio.html"]
  ];

  for (const [page, label, icon, href] of secondaryLinks) {
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

  const userProfile = document.createElement("div");
  userProfile.className = "app-user-profile";

  const userRow = document.createElement("div");
  userRow.className = "app-user-row";

  const userAvatar = document.createElement("span");
  userAvatar.className = "app-user-avatar";
  userAvatar.textContent = (sessionStorage.getItem("ngxlabUserName") || "User").trim().charAt(0).toUpperCase() || "U";

  const userMeta = document.createElement("div");
  userMeta.className = "app-user-meta";
  const userName = document.createElement("strong");
  userName.textContent = (sessionStorage.getItem("ngxlabUserName") || "User").trim() || "User";
  userMeta.append(userName);

  const userMenuToggle = document.createElement("button");
  userMenuToggle.type = "button";
  userMenuToggle.className = "app-user-menu-toggle";
  userMenuToggle.setAttribute("aria-expanded", "false");
  userMenuToggle.setAttribute("aria-label", "Open user menu");
  userMenuToggle.innerHTML = '<span aria-hidden="true">⋯</span>';

  userRow.append(userAvatar, userMeta, userMenuToggle);

  const userMenu = document.createElement("div");
  userMenu.className = "app-user-menu";
  userMenu.hidden = true;

  const profileItem = document.createElement("a");
  profileItem.href = "portfolio.html";
  profileItem.className = "app-user-menu-item";
  profileItem.innerHTML = '<span class="user-menu-icon" aria-hidden="true">👤</span><span>Your profile</span>';

  const themeItem = document.createElement("button");
  themeItem.type = "button";
  themeItem.className = "app-user-menu-item";
  themeItem.setAttribute("data-theme-toggle", "");
  const currentThemeLabel = document.documentElement.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  themeItem.innerHTML = `<span class="user-menu-icon" aria-hidden="true">${document.documentElement.dataset.theme === "dark" ? "☀" : "☾"}</span><span>${currentThemeLabel}</span>`;

  const logoutItem = document.createElement("button");
  logoutItem.type = "button";
  logoutItem.className = "app-user-menu-item app-user-menu-item-danger";
  logoutItem.innerHTML = '<span class="user-menu-icon" aria-hidden="true">↩</span><span>Logout</span>';
  logoutItem.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.assign("login.html");
  });

  userMenu.append(profileItem, themeItem, logoutItem);
  userProfile.append(userRow, userMenu);
  sidebar.append(userProfile);

  userMenuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = userMenuToggle.getAttribute("aria-expanded") === "true";
    userMenu.hidden = isOpen;
    userMenuToggle.setAttribute("aria-expanded", String(!isOpen));
    userMenu.classList.toggle("is-open", !isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!userMenu.contains(event.target) && !userMenuToggle.contains(event.target)) {
      userMenu.hidden = true;
      userMenu.classList.remove("is-open");
      userMenuToggle.setAttribute("aria-expanded", "false");
    }
  });

  const topbar = document.createElement("header");
  topbar.className = "app-topbar";
  const searchQuery = new URLSearchParams(window.location.search).get("q") || "";
  topbar.innerHTML = `
    <button class="dashboard-nav-toggle" type="button" aria-controls="dashboard-sidebar" aria-expanded="false" aria-label="Open dashboard navigation">
      <span></span><span></span><span></span>
    </button>
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

  const navToggle = topbar.querySelector(".dashboard-nav-toggle");
  const sidebarClose = sidebar.querySelector(".sidebar-close");
  const backdrop = document.createElement("button");
  backdrop.className = "dashboard-nav-backdrop";
  backdrop.type = "button";
  backdrop.tabIndex = -1;
  backdrop.setAttribute("aria-label", "Close dashboard navigation");
  backdrop.hidden = true;
  document.body.append(backdrop);
  const mobileViewport = window.matchMedia("(max-width: 850px)");
  let sidebarOpen = false;

  function setSidebarOpen(open, restoreFocus = false) {
    sidebarOpen = mobileViewport.matches && open;
    document.body.classList.toggle("dashboard-nav-open", sidebarOpen);
    navToggle.setAttribute("aria-expanded", String(sidebarOpen));
    navToggle.setAttribute("aria-label", sidebarOpen ? "Close dashboard navigation" : "Open dashboard navigation");
    sidebar.setAttribute("aria-hidden", String(mobileViewport.matches && !sidebarOpen));
    sidebar.inert = mobileViewport.matches && !sidebarOpen;
    backdrop.hidden = !sidebarOpen;

    if (sidebarOpen) sidebarClose.focus();
    else if (restoreFocus) navToggle.focus();
  }

  navToggle.addEventListener("click", () => setSidebarOpen(!sidebarOpen));
  sidebarClose.addEventListener("click", () => setSidebarOpen(false, true));
  backdrop.addEventListener("click", () => setSidebarOpen(false, true));
  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setSidebarOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (!sidebarOpen) return;
    if (event.key === "Escape") {
      setSidebarOpen(false, true);
      return;
    }

    if (event.key === "Tab") {
      const focusable = [...sidebar.querySelectorAll("a[href], button:not([disabled])")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  mobileViewport.addEventListener("change", () => setSidebarOpen(false));
  setSidebarOpen(false);
}
