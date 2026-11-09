const balanceStorageKey = "ngxlabVirtualBalanceNgn";
const userNameStorageKey = "ngxlabUserName";
const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2
});
const wholeNumberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

const balanceValue = document.getElementById("virtual-balance-value");
const balanceStatus = document.getElementById("virtual-balance-status");
const portfolioBalance = document.getElementById("portfolio-balance");
const portfolioCapital = document.getElementById("portfolio-capital");
const tradeDate = document.getElementById("dashboard-trade-date");
const stockCount = document.getElementById("dashboard-total-stocks");
const welcomeTitle = document.getElementById("dashboard-title");
const welcomeDate = document.getElementById("welcome-date");
const userAvatar = document.getElementById("user-avatar");
const marketSearch = document.getElementById("market-search");
const stockSelect = document.getElementById("trade-symbol");
const stockName = document.getElementById("selected-stock-name");
const stockPrice = document.getElementById("selected-stock-price");
const amountInput = document.getElementById("trade-amount");
const estimatedShares = document.getElementById("estimated-shares");
const previewButton = document.getElementById("preview-order");
const orderStatus = document.getElementById("order-status");
const watchlist = document.getElementById("watchlist-stocks");
const orderTabs = [...document.querySelectorAll("[data-order-side]")];
const amountChips = [...document.querySelectorAll("[data-order-amount]")];
const navLinks = [...document.querySelectorAll(".app-nav-link")];

let virtualBalance = null;
let availableStocks = [];
let orderSide = "Buy";

function displayBalance(value) {
  const formatted = currencyFormat.format(value);
  balanceValue.textContent = formatted;
  portfolioBalance.textContent = formatted;
  portfolioCapital.textContent = formatted;
}

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

function initializeAccount() {
  const rawBalance = sessionStorage.getItem(balanceStorageKey);
  if (rawBalance === null) {
    balanceValue.textContent = "Log in to view";
    portfolioBalance.textContent = "Balance unavailable";
    portfolioCapital.textContent = "—";
    balanceStatus.textContent = "Your account balance is available after login.";
    orderStatus.textContent = "Log in to preview a practice order.";
  } else {
    virtualBalance = Number(rawBalance);
    if (!Number.isFinite(virtualBalance) || virtualBalance < 0) {
      sessionStorage.removeItem(balanceStorageKey);
      virtualBalance = null;
      balanceValue.textContent = "Balance unavailable";
      portfolioBalance.textContent = "Balance unavailable";
      portfolioCapital.textContent = "—";
      balanceStatus.textContent = "Please log in again to load your practice balance.";
      orderStatus.textContent = "Log in again to preview a practice order.";
    } else {
      displayBalance(virtualBalance);
      amountInput.max = String(virtualBalance);
      balanceStatus.textContent = "Virtual funds · simulated only";
      orderStatus.textContent = "Preview only. Practice trades are not submitted yet.";
    }
  }

  const storedName = sessionStorage.getItem(userNameStorageKey)?.trim();
  const firstName = storedName?.split(/\s+/)[0];
  if (firstName) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    welcomeTitle.textContent = `${greeting}, ${firstName}`;
    userAvatar.textContent = storedName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  welcomeDate.textContent = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date()).toUpperCase();
}

function selectedStock() {
  return availableStocks.find((stock) => stock.symbol === stockSelect.value);
}

function updateSelectedQuote() {
  const stock = selectedStock();
  if (!stock) {
    stockName.textContent = "No market quote available";
    stockPrice.textContent = "—";
    updateEstimate();
    return;
  }
  stockName.textContent = `${stock.symbol} · ${stock.name || "NGX stock"}`;
  const price = Number(stock.current_price);
  stockPrice.textContent = Number.isFinite(price) ? currencyFormat.format(price) : "Price unavailable";
  updateEstimate();
}

function updateEstimate() {
  const stock = selectedStock();
  const price = Number(stock?.current_price);
  const amount = Number(amountInput.value);
  const shares = Number.isFinite(price) && price > 0 && Number.isFinite(amount) && amount > 0
    ? Math.floor(amount / price)
    : 0;
  estimatedShares.textContent = shares > 0 ? wholeNumberFormat.format(shares) : "—";
  const exceedsBalance = orderSide === "Buy" && virtualBalance !== null && amount > virtualBalance;
  previewButton.disabled = virtualBalance === null || !stock || shares < 1 || exceedsBalance;
  if (virtualBalance !== null) {
    orderStatus.textContent = exceedsBalance
      ? "That amount is above your virtual cash balance."
      : "Preview only. Practice trades are not submitted yet.";
  }
}

function renderWatchlist(stocks) {
  watchlist.replaceChildren();
  if (stocks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "watchlist-empty";
    empty.textContent = "Watchlist stocks will appear when market data is available.";
    watchlist.append(empty);
    return;
  }

  for (const stock of stocks.slice(0, 4)) {
    const card = document.createElement("article");
    card.className = "stock-card";
    const top = document.createElement("div");
    top.className = "stock-top";
    const logo = document.createElement("span");
    logo.className = "stock-symbol-mark";
    logo.textContent = String(stock.symbol || "?").slice(0, 2);
    const practice = document.createElement("button");
    practice.className = "market-practice-button";
    practice.type = "button";
    practice.textContent = "Practise";
    practice.addEventListener("click", () => setSelectedStock(stock));
    top.append(logo, practice);

    const name = document.createElement("div");
    name.className = "stock-name";
    const symbol = document.createElement("strong");
    symbol.textContent = stock.symbol || "—";
    const company = document.createElement("span");
    company.textContent = stock.name || "NGX stock";
    name.append(symbol, company);

    const price = document.createElement("div");
    price.className = "stock-price";
    const quote = document.createElement("strong");
    const numericPrice = Number(stock.current_price);
    quote.textContent = Number.isFinite(numericPrice) ? currencyFormat.format(numericPrice) : "—";
    const change = document.createElement("span");
    const numericChange = Number(stock.change_percent);
    change.className = numericChange < 0 ? "negative" : "";
    change.textContent = Number.isFinite(numericChange) ? `${numericChange > 0 ? "+" : ""}${numericChange}%` : "—";
    price.append(quote, change);

    card.append(top, name, price);
    watchlist.append(card);
  }
}

function setSelectedStock(stock) {
  if (!stock?.symbol) return;
  const optionExists = [...stockSelect.options].some((option) => option.value === stock.symbol);
  if (!optionExists) {
    const option = document.createElement("option");
    option.value = stock.symbol;
    option.textContent = `${stock.symbol} — ${stock.name || "NGX stock"}`;
    stockSelect.append(option);
    availableStocks.push(stock);
  }
  stockSelect.value = stock.symbol;
  updateSelectedQuote();
  document.getElementById("practice-order").scrollIntoView({ behavior: "smooth", block: "center" });
}

function loadMarketOverview(event) {
  const data = event.detail;
  if (!data || typeof data !== "object") return;
  tradeDate.textContent = formatTradeDate(data.trade_date);
  stockCount.textContent = data.total_stocks === null || data.total_stocks === undefined
    ? "—"
    : wholeNumberFormat.format(Number(data.total_stocks));

  const uniqueStocks = new Map();
  for (const stock of [...(data.top_volume || []), ...(data.gainers || []), ...(data.losers || [])]) {
    if (stock?.symbol) uniqueStocks.set(stock.symbol, stock);
  }
  availableStocks = [...uniqueStocks.values()];
  stockSelect.replaceChildren();
  if (availableStocks.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No market stocks available";
    option.value = "";
    stockSelect.append(option);
    stockSelect.disabled = true;
  } else {
    for (const stock of availableStocks) {
      const option = document.createElement("option");
      option.value = stock.symbol;
      option.textContent = `${stock.symbol} — ${stock.name || "NGX stock"}`;
      stockSelect.append(option);
    }
    stockSelect.disabled = false;
  }

  renderWatchlist(data.top_volume || []);
  updateSelectedQuote();
}

function setupOrderControls() {
  for (const tab of orderTabs) {
    tab.addEventListener("click", () => {
      orderSide = tab.dataset.orderSide;
      for (const item of orderTabs) {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      }
      updateEstimate();
    });
  }

  for (const chip of amountChips) {
    chip.addEventListener("click", () => {
      amountInput.value = chip.dataset.orderAmount;
      for (const item of amountChips) item.classList.toggle("is-selected", item === chip);
      updateEstimate();
    });
  }

  stockSelect.addEventListener("change", updateSelectedQuote);
  amountInput.addEventListener("input", () => {
    for (const chip of amountChips) {
      chip.classList.toggle("is-selected", Number(chip.dataset.orderAmount) === Number(amountInput.value));
    }
    updateEstimate();
  });
  previewButton.addEventListener("click", () => {
    const stock = selectedStock();
    const amount = Number(amountInput.value);
    const price = Number(stock?.current_price);
    const shares = Number.isFinite(price) && price > 0 ? Math.floor(amount / price) : 0;
    if (!stock || virtualBalance === null || shares < 1) return;
    const estimatedCost = shares * price;
    orderStatus.textContent = `${orderSide} preview: ${wholeNumberFormat.format(shares)} ${stock.symbol} share${shares === 1 ? "" : "s"}, approximately ${currencyFormat.format(estimatedCost)}. No trade has been sent.`;
  });
}

for (const link of navLinks) {
  link.addEventListener("click", () => {
    for (const item of navLinks) {
      const active = item === link;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("ngxlab:market-overview", loadMarketOverview);
window.addEventListener("ngxlab:select-stock", (event) => setSelectedStock(event.detail));
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    marketSearch.focus();
  }
});
initializeAccount();
setupOrderControls();
updateEstimate();
