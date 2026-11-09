import { API_BASE_URL } from "./config.js";

const orderStatus = document.getElementById("order-status");

async function loadOrderMarketData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/market/overview`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Market data unavailable (${response.status}).`);

    const data = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("The market service returned an invalid response.");
    }
    window.dispatchEvent(new CustomEvent("ngxlab:market-overview", { detail: data }));
  } catch (error) {
    orderStatus.textContent = error instanceof Error
      ? `${error.message} Please visit Markets or try again later.`
      : "Market data is currently unavailable. Please visit Markets or try again later.";
  }
}

loadOrderMarketData();
