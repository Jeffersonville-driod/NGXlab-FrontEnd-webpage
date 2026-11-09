const themeStorageKey = "ngxlabTheme";
const root = document.documentElement;
const storedTheme = localStorage.getItem(themeStorageKey);
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
let theme = storedTheme === "light" || storedTheme === "dark"
  ? storedTheme
  : systemPrefersDark.matches ? "dark" : "light";

function applyTheme(nextTheme) {
  theme = nextTheme;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme === "dark" ? "#101713" : "#f5f2e9";

  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    const darkModeEnabled = theme === "dark";
    toggle.textContent = darkModeEnabled ? "☀" : "☾";
    toggle.setAttribute("aria-label", darkModeEnabled ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("title", darkModeEnabled ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("aria-pressed", String(darkModeEnabled));
  }
}

applyTheme(theme);

const controlsHost = document.querySelector(".topbar-actions")
  || document.querySelector(".navigation, .drawer-header, .topbar-inner");
if (controlsHost) {
  const toggle = document.createElement("button");
  toggle.className = "theme-toggle";
  toggle.type = "button";
  toggle.setAttribute("data-theme-toggle", "");
  toggle.addEventListener("click", () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
  controlsHost.append(toggle);
  applyTheme(theme);
}

systemPrefersDark.addEventListener("change", (event) => {
  if (localStorage.getItem(themeStorageKey) === null) {
    applyTheme(event.matches ? "dark" : "light");
  }
});
