import { API_BASE_URL } from "./config.js";

const board = document.querySelector(".market-section");
const status = document.getElementById("market-status");
const retryButton = document.getElementById("market-retry");
const sessionDate = document.getElementById("market-session");
const totalStocks = document.getElementById("market-total-stocks");
const asOf = document.getElementById("market-as-of");
const summary = document.getElementById("market-summary");

const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });
const volumeFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return numberFormat.format(value);
  return String(value);
}

function formatTradeDate(value) {
  if (!value) return "Trading session: date unavailable";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return `Trading session: ${new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(Number(year), Number(month) - 1, Number(day)))}`;
  }
  return `Trading session: ${String(value)}`;
}

function appendMetric(label, value) {
  if (value === null || value === undefined || typeof value === "object") return;
  const metric = document.createElement("div");
  metric.className = "market-metric";
  const term = document.createElement("dt");
  term.textContent = label.replaceAll("_", " ");
  const description = document.createElement("dd");
  description.textContent = displayValue(value);
  metric.append(term, description);
  summary.append(metric);
}

function renderSummary(market) {
  summary.replaceChildren();
  if (market && typeof market === "object" && !Array.isArray(market)) {
    for (const [label, value] of Object.entries(market)) appendMetric(label, value);
  } else if (market !== null && market !== undefined && market !== "") {
    appendMetric("Market", market);
  }
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  const price = Number(value);
  return Number.isFinite(price) ? `₦${numberFormat.format(price)}` : String(value);
}

function formatChange(value) {
  if (value === null || value === undefined || value === "") return "—";
  const change = Number(value);
  if (!Number.isFinite(change)) return String(value);
  return `${change > 0 ? "+" : ""}${numberFormat.format(change)}%`;
}

function renderStocks(containerId, stocks) {
  const list = document.getElementById(containerId);
  list.replaceChildren();
  if (!Array.isArray(stocks) || stocks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "market-empty-list";
    empty.textContent = "No stocks are available for this list.";
    list.append(empty);
    return;
  }

  for (const stock of stocks.slice(0, 5)) {
    const item = document.createElement("li");
    item.className = "market-stock-item";

    const heading = document.createElement("div");
    heading.className = "market-stock-heading";
    const name = document.createElement("div");
    name.className = "market-stock-name";
    const symbol = document.createElement("strong");
    symbol.textContent = displayValue(stock?.symbol);
    const company = document.createElement("span");
    company.textContent = displayValue(stock?.name);
    name.append(symbol, company);

    const change = document.createElement("span");
    const numericChange = Number(stock?.change_percent);
    change.className = `market-stock-change${Number.isFinite(numericChange) && numericChange < 0 ? " is-negative" : ""}`;
    change.textContent = formatChange(stock?.change_percent);
    heading.append(name, change);

    const details = document.createElement("div");
    details.className = "market-stock-details";
    const price = document.createElement("span");
    price.textContent = `Price ${formatPrice(stock?.current_price)}`;
    const volume = document.createElement("span");
    const rawVolume = stock?.volume;
    const numericVolume = rawVolume === null || rawVolume === undefined || rawVolume === "" ? Number.NaN : Number(rawVolume);
    volume.textContent = `Volume ${Number.isFinite(numericVolume) ? volumeFormat.format(numericVolume) : displayValue(rawVolume)}`;
    details.append(price, volume);

    const sector = document.createElement("div");
    sector.className = "market-stock-details";
    sector.textContent = `Sector ${displayValue(stock?.sector)}`;

    item.append(heading, details, sector);
    list.append(item);
  }
}

function renderOverview(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The market service returned an invalid response.");
  }

  sessionDate.textContent = formatTradeDate(data.trade_date);
  totalStocks.textContent = data.total_stocks === null || data.total_stocks === undefined
    ? ""
    : `${displayValue(data.total_stocks)} stocks`;
  asOf.textContent = data.as_of ? `Updated ${displayValue(data.as_of)}` : "";
  renderSummary(data.market);
  renderStocks("market-gainers", data.gainers);
  renderStocks("market-losers", data.losers);
  renderStocks("market-volume", data.top_volume);
}

async function loadMarketOverview() {
  board.setAttribute("aria-busy", "true");
  retryButton.hidden = true;
  status.textContent = "Loading the latest market snapshot…";

  try {
    const response = await fetch(`${API_BASE_URL}/api/market/overview`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Market data unavailable (${response.status}).`);
    }

    const data = await response.json();
    renderOverview(data);
    status.textContent = "";
  } catch (error) {
    status.textContent = error instanceof Error && error.message.startsWith("Market data unavailable")
      ? `${error.message} Please try again later.`
      : "Market data is currently unavailable. Please try again later.";
    retryButton.hidden = false;
  } finally {
    board.setAttribute("aria-busy", "false");
  }
}

retryButton.addEventListener("click", loadMarketOverview);
loadMarketOverview();
