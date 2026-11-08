import { resetPassword } from "./auth.js";
import { initializePasswordToggles } from "./password-toggle.js";
import { dismissToast, showToast } from "./toast.js";

initializePasswordToggles();

const form = document.getElementById("reset-password-form");
const status = document.getElementById("reset-password-status");
const token = new URLSearchParams(window.location.search).get("token");

if (!token) {
  showToast("This password reset link is invalid or incomplete. Request a new one to continue.");
  form.hidden = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!token) return;

  const formData = new FormData(form);
  const password = formData.get("password");
  if (password !== formData.get("password-confirm")) {
    showToast("The passwords don't match. Please try again.");
    return;
  }

  dismissToast();
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  status.textContent = "";

  try {
    await resetPassword(token, password);
    status.textContent = "Your password has been updated. You can now log in with your new password.";
    form.hidden = true;
    window.history.replaceState(null, "", window.location.pathname);
  } catch (error) {
    showToast(error.message || "Couldn't reset your password. The link may have expired or already been used.");
  } finally {
    submitButton.disabled = false;
    submitButton.setAttribute("aria-busy", "false");
  }
});
