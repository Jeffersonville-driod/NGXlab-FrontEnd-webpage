let toast;
let toastMessage;
let toastTimer;

function getToast() {
  if (toast) return toast;

  toast = document.createElement("div");
  toast.className = "auth-toast";
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.hidden = true;

  toastMessage = document.createElement("span");
  toastMessage.className = "auth-toast-message";

  const dismissButton = document.createElement("button");
  dismissButton.className = "auth-toast-dismiss";
  dismissButton.type = "button";
  dismissButton.setAttribute("aria-label", "Dismiss notification");
  dismissButton.textContent = "×";
  dismissButton.addEventListener("click", dismissToast);

  toast.append(toastMessage, dismissButton);
  document.body.append(toast);
  return toast;
}

export function dismissToast() {
  clearTimeout(toastTimer);
  if (toast) toast.hidden = true;
}

export function showToast(message) {
  const notification = getToast();
  clearTimeout(toastTimer);
  toastMessage.textContent = message;
  notification.hidden = false;
  toastTimer = window.setTimeout(dismissToast, 8000);
}
