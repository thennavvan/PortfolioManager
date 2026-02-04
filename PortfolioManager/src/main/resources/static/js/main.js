import { getPortfolio, addAsset, updateAsset, deleteAsset, getHistory, getPricesBulk, getAllocation } from "./api.js";
import { renderAllocationChart, renderHistoryChart } from "./charts.js";
import { fillForm, readForm, renderHoldingsTable, setFormState, setOverview, setStatus } from "./ui.js";

let selected = null;

function computeAllocation(assets, priceBySymbol) {
  const byType = {
    STOCK: 0,
    BOND: 0,
    CRYPTO: 0,
    CASH: 0,
    ETF: 0,
    COMMODITY: 0,
    REAL_ESTATE: 0,
    MUTUAL_FUND: 0
  };

  for (const a of assets) {
    const symbol = (a.tickerSymbol || "").toUpperCase();
    const price = Number(priceBySymbol[symbol]?.price ?? 0);
    const qty = Number(a.quantityOwned ?? 0);
    const buy = Number(a.buyPrice ?? 0);
    // If current price is 0 (Yahoo down), use buy price to avoid misleading allocation
    const value = qty * (price || buy);
    byType[a.assetType] = (byType[a.assetType] || 0) + value;
  }

  for (const k of Object.keys(byType)) {
    if (byType[k] <= 0) delete byType[k];
  }

  return byType;
}

function computeOverview(assets, priceBySymbol) {
  const totalAssets = assets.length;
  let totalSpent = 0;
  let currentValue = 0;

  for (const a of assets) {
    const symbol = (a.tickerSymbol || "").toUpperCase();
    const price = Number(priceBySymbol[symbol]?.price ?? 0);
    const qty = Number(a.quantityOwned ?? 0);
    const buy = Number(a.buyPrice ?? 0);

    totalSpent += qty * buy;
    // If current price is 0 (Yahoo down), use buy price to avoid misleading loss
    currentValue += qty * (price || buy);
  }

  const totalPL = currentValue - totalSpent;
  const totalPLPct = totalSpent === 0 ? 0 : (totalPL / totalSpent) * 100;

  return { totalSpent, totalAssets, currentValue, totalPL, totalPLPct };
}

async function refresh() {
  setStatus("Refreshing...", "");

  const assets = await getPortfolio();
  const symbols = [...new Set(assets.map(a => (a.tickerSymbol || "").toUpperCase()).filter(Boolean))];
  const priceBySymbol = symbols.length ? await getPricesBulk(symbols) : {};

  setOverview(computeOverview(assets, priceBySymbol));

  renderHoldingsTable({
    assets,
    priceBySymbol,
    onSelect: (asset) => {
      selected = asset;
      fillForm(asset);
      setFormState({ selected });
      setStatus(`Selected ${asset.tickerSymbol} (#${asset.id})`, "");
    }
  });

  // Use backend allocation API
  const allocationResponse = await getAllocation();
  const allocationByType = {};
  allocationResponse.allocation.forEach(item => {
    allocationByType[item.assetType] = item.value;
  });
  renderAllocationChart(document.getElementById("allocationChart"), allocationByType);

  const history = await getHistory();
  renderHistoryChart(document.getElementById("historyChart"), history);

  setStatus("Up to date.", "good");
}

function clearSelection() {
  selected = null;
  fillForm(null);
  setFormState({ selected });
}

function wireEvents() {
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    try {
      await refresh();
    } catch (e) {
      setStatus(e.message, "bad");
    }
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    clearSelection();
    setStatus("Cleared.", "");
  });

  document.getElementById("assetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = readForm();
      await addAsset(payload);
      clearSelection();
      setStatus("Asset added.", "good");
      await refresh();
    } catch (err) {
      setStatus(err.message, "bad");
    }
  });

  document.getElementById("updateBtn").addEventListener("click", async () => {
    if (!selected?.id) return;
    try {
      const payload = readForm();
      await updateAsset(selected.id, payload);
      setStatus("Asset updated.", "good");
      await refresh();
    } catch (err) {
      setStatus(err.message, "bad");
    }
  });

  document.getElementById("deleteBtn").addEventListener("click", async () => {
    if (!selected?.id) return;
    try {
      await deleteAsset(selected.id);
      clearSelection();
      setStatus("Asset deleted.", "good");
      await refresh();
    } catch (err) {
      setStatus(err.message, "bad");
    }
  });
}

(async function init() {
  setFormState({ selected });
  wireEvents();
  try {
    await refresh();
  } catch (e) {
    setStatus(e.message, "bad");
  }
})();
