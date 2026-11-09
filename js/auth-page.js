import { login, register, requestPasswordReset } from "./auth.js";
import { initializePasswordToggles } from "./password-toggle.js";
import { dismissToast, showToast } from "./toast.js";

initializePasswordToggles();

const authIntro = document.getElementById("auth-intro");
const authStatus = document.getElementById("auth-status");
const virtualBalanceStorageKey = "ngxlabVirtualBalanceNgn";
const userNameStorageKey = "ngxlabUserName";
const cscsNumberStorageKey = "ngxlabCscsNumber";
const chnNumberStorageKey = "ngxlabChnNumber";
const authFormElements = {
  login: document.getElementById("login-form"),
  signup: document.getElementById("signup-form"),
  recovery: document.getElementById("recovery-form")
};
const authForms = Object.fromEntries(
  Object.entries(authFormElements).filter(([, form]) => form)
);
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
  if (authIntro) authIntro.textContent = authCopy[view];
  if (authStatus) authStatus.textContent = "";
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

document.querySelectorAll("[data-auth-view]").forEach((button) => {
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
    sessionStorage.removeItem(virtualBalanceStorageKey);
    sessionStorage.removeItem(userNameStorageKey);
    sessionStorage.removeItem(cscsNumberStorageKey);
    sessionStorage.removeItem(chnNumberStorageKey);

    try {
      const formData = new FormData(form);
      let user;
      if (view === "login") {
        user = await login(formData.get("email"), formData.get("password"));
      } else {
        user = await register(
          formData.get("name"),
          formData.get("email"),
          formData.get("password")
        );
      }
      if (typeof user?.virtualBalanceNgn === "number" && Number.isFinite(user.virtualBalanceNgn) && user.virtualBalanceNgn >= 0) {
        sessionStorage.setItem(virtualBalanceStorageKey, String(user.virtualBalanceNgn));
      }
      if (typeof user?.name === "string" && user.name.trim()) {
        sessionStorage.setItem(userNameStorageKey, user.name.trim());
      }
      if (typeof user?.cscsNumber === "string" && user.cscsNumber.trim()) {
        sessionStorage.setItem(cscsNumberStorageKey, user.cscsNumber.trim());
      }
      if (typeof user?.chnNumber === "string" && user.chnNumber.trim()) {
        sessionStorage.setItem(chnNumberStorageKey, user.chnNumber.trim());
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
const initialView = document.body.dataset.authView || "login";
showAuthView(Object.hasOwn(authForms, requestedView) ? requestedView : initialView, false);
