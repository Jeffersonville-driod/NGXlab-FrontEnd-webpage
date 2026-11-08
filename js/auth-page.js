import { login, register, requestPasswordReset } from "./auth.js";
import { initializePasswordToggles } from "./password-toggle.js";
import { dismissToast, showToast } from "./toast.js";

initializePasswordToggles();

const authIntro = document.getElementById("auth-intro");
const authStatus = document.getElementById("auth-status");
const authForms = {
  login: document.getElementById("login-form"),
  signup: document.getElementById("signup-form"),
  recovery: document.getElementById("recovery-form")
};
const authCopy = {
  login: "Log in to continue exploring NGXLab.",
  signup: "Start building your understanding of the market.",
  recovery: "Enter your email address to request a password recovery link."
};

function showAuthView(view, updateUrl = true) {
  if (!authForms[view]) return;

  dismissToast();
  Object.entries(authForms).forEach(([name, form]) => {
    form.hidden = name !== view;
  });
  authIntro.textContent = authCopy[view];
  authStatus.textContent = "";
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab.dataset.authView === view));
  });

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.replaceState(null, "", url);
  }
}

function setButtonLoading(button, loading) {
  button.disabled = loading;
  button.setAttribute("aria-busy", String(loading));
  button.querySelector(".button-spinner").hidden = !loading;
}

document.querySelectorAll(".auth-tab, .auth-link-button").forEach((button) => {
  button.addEventListener("click", () => showAuthView(button.dataset.authView));
});

document.querySelectorAll("[data-google-auth]").forEach((button) => {
  button.addEventListener("click", () => {
    authStatus.textContent = "";
    showToast(button.dataset.googleAuth === "signup"
      ? "Google sign-up isn't connected yet. No information was sent."
      : "Google sign-in isn't connected yet. No information was sent.");
  });
});

Object.entries(authForms).forEach(([view, form]) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    dismissToast();

    if (view === "recovery") {
      const submitButton = form.querySelector('[type="submit"]');
      setButtonLoading(submitButton, true);
      authStatus.textContent = "";

      try {
        const formData = new FormData(form);
        await requestPasswordReset(formData.get("email"));
        authStatus.textContent = "If an account exists for that email, a password reset link will be sent shortly.";
        form.reset();
      } catch (error) {
        showToast(error.message || "Couldn't request a password reset. Please try again.");
      } finally {
        setButtonLoading(submitButton, false);
      }
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    setButtonLoading(submitButton, true);
    authStatus.textContent = "";

    try {
      const formData = new FormData(form);
      if (view === "login") {
        await login(formData.get("email"), formData.get("password"));
      } else {
        await register(
          formData.get("name"),
          formData.get("email"),
          formData.get("password")
        );
      }
      window.location.assign("dashboard.html");
    } catch (error) {
      showToast(error.message || "Authentication failed. Please try again.");
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
});

const requestedView = new URLSearchParams(window.location.search).get("view");
showAuthView(Object.hasOwn(authForms, requestedView) ? requestedView : "login", false);
