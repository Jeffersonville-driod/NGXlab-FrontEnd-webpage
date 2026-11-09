import { API_BASE_URL } from "./config.js";

const tradeDate = document.getElementById("dashboard-trade-date");
const stockCount = document.getElementById("dashboard-total-stocks");
const status = document.getElementById("dashboard-market-status");
const wholeNumberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

function formatTradeDate(value) {
  if (!value) return "Date unavailable";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!dateOnly) return String(value);
  const [, year, month, day] = dateOnly;
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

async function loadMarketSnapshot() {
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
    tradeDate.textContent = formatTradeDate(data.trade_date);
    stockCount.textContent = data.total_stocks === null || data.total_stocks === undefined
      ? "—"
      : wholeNumberFormat.format(Number(data.total_stocks));
    status.textContent = "Latest stored market snapshot";
  } catch (error) {
    tradeDate.textContent = "Unavailable";
    stockCount.textContent = "—";
    status.textContent = error instanceof Error && error.message.startsWith("Market data unavailable")
      ? `${error.message} Please visit Markets to retry.`
      : "Market data is currently unavailable. Please visit Markets to retry.";
  }
}

loadMarketSnapshot();
