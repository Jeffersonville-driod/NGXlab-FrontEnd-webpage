export function initializePasswordToggles(root = document) {
  const toggles = [...root.querySelectorAll("[data-password-toggle]")];

  toggles.forEach((toggle) => {
    const input = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!input) return;

    const setVisibility = (visible) => {
      input.type = visible ? "text" : "password";
      toggle.textContent = visible ? "Hide" : "Show";
      toggle.setAttribute("aria-label", `${visible ? "Hide" : "Show"} password`);
      toggle.setAttribute("aria-pressed", String(visible));
    };

    toggle.addEventListener("click", () => {
      setVisibility(input.type === "password");
    });

    input.form?.addEventListener("reset", () => setVisibility(false));
  });
}
