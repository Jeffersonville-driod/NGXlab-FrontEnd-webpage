const balanceValue = document.getElementById("virtual-balance-value");
const balanceStatus = document.getElementById("virtual-balance-status");
const rawBalance = sessionStorage.getItem("ngxlabVirtualBalanceNgn");

if (rawBalance === null) {
  balanceValue.textContent = "Log in to view";
  balanceStatus.textContent = "Your account balance is available after login.";
} else {
  const balance = Number(rawBalance);
  if (!Number.isFinite(balance) || balance < 0) {
    sessionStorage.removeItem("ngxlabVirtualBalanceNgn");
    balanceValue.textContent = "Balance unavailable";
    balanceStatus.textContent = "Please log in again to load your practice balance.";
  } else {
    balanceValue.textContent = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(balance);
    balanceStatus.textContent = "Virtual funds · simulated only";
  }
}
