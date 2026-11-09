const menuButton = document.querySelector(".mobile-menu-toggle");
const navigation = document.getElementById("main-navigation");
const closeButton = document.querySelector(".mobile-nav-close");
const backdrop = document.querySelector(".mobile-nav-backdrop");
const mobileViewport = window.matchMedia("(max-width: 850px)");

if (menuButton && navigation && closeButton && backdrop) {
  let isOpen = false;

  function setOpen(open, restoreFocus = false) {
    isOpen = mobileViewport.matches && open;
    document.body.classList.toggle("mobile-nav-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navigation.setAttribute("aria-hidden", String(mobileViewport.matches && !isOpen));
    navigation.inert = mobileViewport.matches && !isOpen;
    backdrop.hidden = !isOpen;

    if (isOpen) closeButton.focus();
    else if (restoreFocus) menuButton.focus();
  }

  menuButton.addEventListener("click", () => setOpen(!isOpen));
  closeButton.addEventListener("click", () => setOpen(false, true));
  backdrop.addEventListener("click", () => setOpen(false, true));
  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      setOpen(false, true);
      return;
    }

    if (event.key === "Tab") {
      const focusable = [...navigation.querySelectorAll("a[href], button:not([disabled])")];
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
  mobileViewport.addEventListener("change", () => setOpen(false));
  setOpen(false);
}
