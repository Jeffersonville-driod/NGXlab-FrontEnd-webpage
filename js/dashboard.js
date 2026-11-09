const balanceStorageKey = "ngxlabVirtualBalanceNgn";
const userNameStorageKey = "ngxlabUserName";
const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2
});
const wholeNumberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

const balanceElements = [
  document.getElementById("virtual-balance-value"),
  document.getElementById("wallet-balance"),
  document.getElementById("portfolio-balance"),
  document.getElementById("portfolio-capital")
].filter(Boolean);
const balanceStatusElements = [
  document.getElementById("virtual-balance-status"),
  document.getElementById("wallet-status")
].filter(Boolean);
const tradeDate = document.getElementById("dashboard-trade-date");
const stockCount = document.getElementById("dashboard-total-stocks");
const welcomeTitle = document.getElementById("dashboard-title");
const welcomeDate = document.getElementById("welcome-date");
const userAvatar = document.getElementById("user-avatar");
const stockSelect = document.getElementById("trade-symbol");
const stockName = document.getElementById("selected-stock-name");
const stockPrice = document.getElementById("selected-stock-price");
const amountInput = document.getElementById("trade-amount");
const estimatedShares = document.getElementById("estimated-shares");
const previewButton = document.getElementById("preview-order");
const orderStatus = document.getElementById("order-status");
const orderTabs = [...document.querySelectorAll("[data-order-side]")];
const amountChips = [...document.querySelectorAll("[data-order-amount]")];
const searchInput = document.getElementById("market-search");

let virtualBalance = null;
let availableStocks = [];
let orderSide = "Buy";

function setBalanceText(text) {
  for (const element of balanceElements) element.textContent = text;
}

function displayBalance(value) {
  setBalanceText(currencyFormat.format(value));
}

function setBalanceStatus(text) {
  for (const element of balanceStatusElements) element.textContent = text;
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
    setBalanceText("Log in to view");
    setBalanceStatus("Your account balance is available after login.");
    if (orderStatus) orderStatus.textContent = "Log in to preview a practice order.";
  } else {
    virtualBalance = Number(rawBalance);
    if (!Number.isFinite(virtualBalance) || virtualBalance < 0) {
      sessionStorage.removeItem(balanceStorageKey);
      virtualBalance = null;
      setBalanceText("Balance unavailable");
      setBalanceStatus("Please log in again to load your practice balance.");
      if (orderStatus) orderStatus.textContent = "Log in again to preview a practice order.";
    } else {
      displayBalance(virtualBalance);
      if (amountInput) amountInput.max = String(virtualBalance);
      setBalanceStatus("Virtual funds · simulated only");
      if (orderStatus) orderStatus.textContent = "Preview only. Practice trades are not submitted yet.";
    }
  }

  const storedName = sessionStorage.getItem(userNameStorageKey)?.trim();
  const firstName = storedName?.split(/\s+/)[0];
  if (firstName && welcomeTitle && userAvatar) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    welcomeTitle.textContent = `${greeting}, ${firstName}`;
    userAvatar.textContent = storedName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  if (welcomeDate) {
    welcomeDate.textContent = new Intl.DateTimeFormat("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(new Date()).toUpperCase();
  }
}

function selectedStock() {
  return availableStocks.find((stock) => stock.symbol === stockSelect?.value);
}

function updateSelectedQuote() {
  if (!stockSelect || !stockName || !stockPrice) return;
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
  if (!stockSelect || !amountInput || !estimatedShares || !previewButton) return;
  const stock = selectedStock();
  const price = Number(stock?.current_price);
  const amount = Number(amountInput.value);
  const shares = Number.isFinite(price) && price > 0 && Number.isFinite(amount) && amount > 0
    ? Math.floor(amount / price)
    : 0;
  estimatedShares.textContent = shares > 0 ? wholeNumberFormat.format(shares) : "—";
  const exceedsBalance = orderSide === "Buy" && virtualBalance !== null && amount > virtualBalance;
  previewButton.disabled = virtualBalance === null || !stock || shares < 1 || exceedsBalance;
  if (virtualBalance !== null && orderStatus) {
    orderStatus.textContent = exceedsBalance
      ? "That amount is above your virtual cash balance."
      : "Preview only. Practice trades are not submitted yet.";
  }
}

function loadMarketOverview(event) {
  const data = event.detail;
  if (!data || typeof data !== "object") return;
  if (tradeDate) tradeDate.textContent = formatTradeDate(data.trade_date);
  if (stockCount) {
    const total = Number(data.total_stocks);
    stockCount.textContent = data.total_stocks === null || data.total_stocks === undefined || !Number.isFinite(total)
      ? "—"
      : wholeNumberFormat.format(total);
  }

  const uniqueStocks = new Map();
  const stockLists = [data.top_volume, data.gainers, data.losers]
    .filter(Array.isArray);
  for (const stock of stockLists.flat()) {
    if (stock?.symbol) uniqueStocks.set(stock.symbol, stock);
  }
  availableStocks = [...uniqueStocks.values()];

  if (stockSelect) {
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
      const requestedSymbol = new URLSearchParams(window.location.search).get("symbol");
      if (requestedSymbol && availableStocks.some((stock) => stock.symbol === requestedSymbol)) {
        stockSelect.value = requestedSymbol;
      }
    }
  }

  updateSelectedQuote();
}

function setupOrderControls() {
  if (!stockSelect || !amountInput || !previewButton || !orderStatus) return;

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

window.addEventListener("ngxlab:market-overview", loadMarketOverview);
initializeAccount();
setupOrderControls();
updateEstimate();
