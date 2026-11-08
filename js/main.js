const newsletterForm = document.getElementById("newsletter-form");
const newsletterStatus = document.getElementById("newsletter-status");

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  newsletterStatus.textContent = "Newsletter sign-up isn't connected yet. No email was sent or saved.";
});
