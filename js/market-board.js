import { API_BASE_URL } from "./config.js";

const board = document.querySelector(".market-section");
const status = document.getElementById("market-status");
const retryButton = document.getElementById("market-retry");
const sessionDate = document.getElementById("market-session");
const totalStocks = document.getElementById("market-total-stocks");
const asOf = document.getElementById("market-as-of");
const summary = document.getElementById("market-summary");
const stockTable = document.getElementById("market-stocks");
const tabs = [...document.querySelectorAll(".market-tab")];

const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });
const volumeFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
const stockLists = { gainers: [], losers: [], volume: [] };
let activeView = "gainers";

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

function appendTableMessage(tableBody, message, columnCount) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.className = "market-stock-empty";
  cell.colSpan = columnCount;
  cell.textContent = message;
  row.append(cell);
  tableBody.replaceChildren(row);
}

function renderSummary(market) {
  summary.replaceChildren();
  const values = market && typeof market === "object" && !Array.isArray(market)
    ? Object.entries(market).filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
    : [];

  if (values.length === 0) {
    appendTableMessage(summary, "Market summary is not available.", 2);
    return;
  }

  for (const [label, value] of values) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = label.replaceAll("_", " ");
    const valueCell = document.createElement("td");
    valueCell.textContent = displayValue(value);
    row.append(nameCell, valueCell);
    summary.append(row);
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

function renderStocks() {
  const stocks = stockLists[activeView];
  if (!Array.isArray(stocks) || stocks.length === 0) {
    appendTableMessage(stockTable, "No stocks are available for this list.", 5);
    return;
  }

  const rows = stocks.slice(0, 5).map((stock) => {
    const row = document.createElement("tr");
    const companyCell = document.createElement("td");
    const company = document.createElement("div");
    company.className = "market-stock-company";
    const symbol = document.createElement("strong");
    symbol.textContent = displayValue(stock?.symbol);
    const name = document.createElement("span");
    name.textContent = displayValue(stock?.name);
    company.append(symbol, name);
    companyCell.append(company);

    const priceCell = document.createElement("td");
    priceCell.textContent = formatPrice(stock?.current_price);

    const changeCell = document.createElement("td");
    const numericChange = stock?.change_percent === null || stock?.change_percent === undefined || stock?.change_percent === ""
      ? Number.NaN
      : Number(stock.change_percent);
    const changeClass = numericChange > 0 ? "is-positive" : numericChange < 0 ? "is-negative" : "is-neutral";
    changeCell.className = `market-stock-change ${changeClass}`;
    changeCell.textContent = formatChange(stock?.change_percent);

    const volumeCell = document.createElement("td");
    const rawVolume = stock?.volume;
    const numericVolume = rawVolume === null || rawVolume === undefined || rawVolume === "" ? Number.NaN : Number(rawVolume);
    volumeCell.textContent = Number.isFinite(numericVolume) ? volumeFormat.format(numericVolume) : displayValue(rawVolume);

    const sectorCell = document.createElement("td");
    sectorCell.textContent = displayValue(stock?.sector);
    row.append(companyCell, priceCell, changeCell, volumeCell, sectorCell);
    return row;
  });

  stockTable.replaceChildren(...rows);
}

function selectView(view) {
  if (!Object.hasOwn(stockLists, view)) return;
  activeView = view;
  for (const tab of tabs) {
    tab.setAttribute("aria-pressed", String(tab.dataset.marketView === activeView));
  }
  renderStocks();
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
  stockLists.gainers = data.gainers;
  stockLists.losers = data.losers;
  stockLists.volume = data.top_volume;
  renderStocks();
}

async function loadMarketOverview() {
  board.setAttribute("aria-busy", "true");
  retryButton.hidden = true;
  status.textContent = "Loading the latest market snapshot…";
  appendTableMessage(stockTable, "Loading market data…", 5);

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
    appendTableMessage(stockTable, "Market data could not be loaded.", 5);
    retryButton.hidden = false;
  } finally {
    board.setAttribute("aria-busy", "false");
  }
}

for (const tab of tabs) {
  tab.addEventListener("click", () => selectView(tab.dataset.marketView));
}
retryButton.addEventListener("click", loadMarketOverview);
renderSummary(null);
loadMarketOverview();
