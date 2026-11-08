import { login, register } from "./auth.js";

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

document.querySelectorAll("[data-google-auth]").forEach((button) => {
  button.addEventListener("click", () => {
    authStatus.textContent = button.dataset.googleAuth === "signup"
      ? "Google sign-up isn't connected yet. No information was sent."
      : "Google sign-in isn't connected yet. No information was sent.";
  });
});

document.querySelector(".drawer-close").addEventListener("click", () => accountDrawer.close());
accountDrawer.addEventListener("click", (event) => {
  if (event.target === accountDrawer) accountDrawer.close();
});

Object.entries(authForms).forEach(([view, form]) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (view === "recovery") {
      authStatus.textContent = "Password recovery isn't connected yet. No email was sent.";
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    authStatus.textContent = view === "login" ? "Signing in..." : "Creating your account...";

    try {
      const formData = new FormData(form);
      if (view === "login") {
        await login(formData.get("email"), formData.get("password"));
        authStatus.textContent = "Signed in successfully.";
      } else {
        await register(
          formData.get("name"),
          formData.get("email"),
          formData.get("password")
        );
        authStatus.textContent = "Your account has been created.";
      }
      form.reset();
    } catch (error) {
      authStatus.textContent = error.message || "Authentication failed. Please try again.";
    } finally {
      submitButton.disabled = false;
    }
  });
});

const newsletterForm = document.getElementById("newsletter-form");
const newsletterStatus = document.getElementById("newsletter-status");

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  newsletterStatus.textContent = "Newsletter sign-up isn't connected yet. No email was sent or saved.";
});
