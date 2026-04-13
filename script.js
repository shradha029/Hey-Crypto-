// script.js

const COINS = ["bitcoin", "ethereum", "dogecoin", "solana"];
let prevPrices = {};
let intervalId = null;

async function getCryptoPrices() {
  const btn = document.querySelector("button");
  if (btn) {
    btn.textContent = "↻ Refreshing...";
    btn.disabled = true;
  }

  const ids = COINS.join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    updateCard("bitcoin",  data.bitcoin.usd,  data.bitcoin.usd_24h_change);
    updateCard("ethereum", data.ethereum.usd, data.ethereum.usd_24h_change);
    updateCard("dogecoin", data.dogecoin.usd, data.dogecoin.usd_24h_change);
    updateCard("solana",   data.solana.usd,   data.solana.usd_24h_change);

    updateTimestamp();

  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    showError();
  } finally {
    if (btn) {
      btn.textContent = "↻ Refresh Prices";
      btn.disabled = false;
    }
  }
}

function updateCard(coinId, newPrice, change24h) {
  const priceEl = document.getElementById(coinId + "-price");
  const changeEl = document.getElementById(coinId + "-change");

  if (!priceEl) return;

  // Flash green/red vs previous refresh
  const prev = prevPrices[coinId];
  if (prev !== undefined) {
    const flashClass = newPrice >= prev ? "flash-up" : "flash-down";
    priceEl.classList.add(flashClass);
    setTimeout(() => priceEl.classList.remove("flash-up", "flash-down"), 800);
  }

  prevPrices[coinId] = newPrice;
  priceEl.textContent = formatPrice(newPrice);

  // 24h change label
  if (changeEl && change24h !== undefined) {
    const sign = change24h >= 0 ? "+" : "";
    changeEl.textContent = `${sign}${change24h.toFixed(2)}% (24h)`;
    changeEl.className = "change " + (change24h >= 0 ? "up" : "down");
  }
}

function formatPrice(price) {
  if (price < 0.01) {
    return "$" + price.toFixed(6);
  } else if (price < 1) {
    return "$" + price.toFixed(4);
  }
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateTimestamp() {
  const el = document.getElementById("last-updated");
  if (!el) return;
  const now = new Date();
  el.textContent = "Updated at " + now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function showError() {
  COINS.forEach(id => {
    const priceEl = document.getElementById(id + "-price");
    const changeEl = document.getElementById(id + "-change");
    if (priceEl) priceEl.textContent = "Error loading";
    if (changeEl) {
      changeEl.textContent = "Try again";
      changeEl.className = "change neutral";
    }
  });

  const el = document.getElementById("last-updated");
  if (el) el.textContent = "Failed to fetch — check your connection";
}

function startInterval() {
  clearInterval(intervalId);
  intervalId = setInterval(getCryptoPrices, 10000);
}

// Pause fetching when tab is hidden to save API calls
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(intervalId);
  } else {
    getCryptoPrices();
    startInterval();
  }
});

// Kick off on page load
getCryptoPrices();
startInterval();