const accountDrawer = document.getElementById("account-drawer");
const authTitle = document.getElementById("auth-title");
const authIntro = document.getElementById("auth-intro");
const authStatus = document.getElementById("auth-status");
const authForms = {
  login: document.getElementById("login-form"),
  signup: document.getElementById("signup-form"),
  recovery: document.getElementById("recovery-form")
};
const authCopy = {
  login: ["Welcome back", "Log in to continue exploring NGXLab."],
  signup: ["Create your account", "Start building your understanding of the market."],
  recovery: ["Reset your password", "Enter your email address to request a password recovery link."]
};

function showAuthView(view) {
  if (!authForms[view]) return;
  Object.entries(authForms).forEach(([name, form]) => {
    form.hidden = name !== view;
  });
  authTitle.textContent = authCopy[view][0];
  authIntro.textContent = authCopy[view][1];
  authStatus.textContent = "";
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab.dataset.authView === view));
  });
}

document.querySelectorAll("[data-open-auth]").forEach((button) => {
  button.addEventListener("click", () => {
    showAuthView(button.dataset.authView);
    if (!accountDrawer.open) accountDrawer.showModal();
  });
});

document.querySelectorAll(".auth-tab, .auth-link-button").forEach((button) => {
  button.addEventListener("click", () => showAuthView(button.dataset.authView));
});

document.querySelector(".drawer-close").addEventListener("click", () => accountDrawer.close());
accountDrawer.addEventListener("click", (event) => {
  if (event.target === accountDrawer) accountDrawer.close();
});

Object.entries(authForms).forEach(([view, form]) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    authStatus.textContent = view === "recovery"
      ? "Password recovery is not connected yet. No email was sent."
      : "Account access is not connected yet. Nothing was saved or sent.";
    form.reset();
  });
});
