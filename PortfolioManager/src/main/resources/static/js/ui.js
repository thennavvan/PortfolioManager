import { formatMoney, formatNumber, formatPct } from "./format.js";

export function setOverview({ totalSpent, totalAssets, currentValue, totalPL, totalPLPct }) {
  document.getElementById("totalSpent").textContent = formatMoney(totalSpent);
  document.getElementById("totalAssets").textContent = String(totalAssets);
  document.getElementById("currentValue").textContent = formatMoney(currentValue);

  const plEl = document.getElementById("totalPL");
  plEl.textContent = formatMoney(totalPL);
  plEl.classList.toggle("good", totalPL >= 0);
  plEl.classList.toggle("bad", totalPL < 0);

  const pctEl = document.getElementById("totalPLPct");
  pctEl.textContent = formatPct(totalPLPct);
  pctEl.classList.toggle("good", totalPLPct >= 0);
  pctEl.classList.toggle("bad", totalPLPct < 0);
}

export function renderHoldingsTable({ assets, priceBySymbol, onSelect }) {
  const tbody = document.getElementById("holdingsTbody");

  if (!assets.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted">No assets yet. Add one below.</td></tr>';
    return;
  }

  tbody.innerHTML = "";

  for (const a of assets) {
    const symbol = (a.tickerSymbol || "").toUpperCase();
    const currentPrice = Number(priceBySymbol[symbol]?.price ?? 0);

    const qty = Number(a.quantityOwned ?? 0);
    const buy = Number(a.buyPrice ?? 0);

    const marketValue = qty * currentPrice;
    const invested = qty * buy;
    const pl = marketValue - invested;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${symbol}</td>
      <td>${a.companyName ?? ""}</td>
      <td class="num">${formatNumber(qty, 6)}</td>
      <td class="num">${formatMoney(buy)}</td>
      <td class="num">${formatMoney(currentPrice)}</td>
      <td class="num">${formatMoney(marketValue)}</td>
      <td class="num ${pl >= 0 ? "good" : "bad"}">${formatMoney(pl)}</td>
    `;

    tr.addEventListener("click", () => onSelect(a));
    tbody.appendChild(tr);
  }
}

export function setFormState({ selected }) {
  const updateBtn = document.getElementById("updateBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  updateBtn.disabled = !selected;
  deleteBtn.disabled = !selected;
}

export function fillForm(asset) {
  document.getElementById("assetId").value = asset?.id ?? "";
  document.getElementById("tickerSymbol").value = asset?.tickerSymbol ?? "";
  document.getElementById("companyName").value = asset?.companyName ?? "";
  document.getElementById("quantityOwned").value = asset?.quantityOwned ?? "";
  document.getElementById("buyPrice").value = asset?.buyPrice ?? "";
  document.getElementById("assetType").value = asset?.assetType ?? "STOCK";
}

export function readForm() {
  const tickerSymbol = document.getElementById("tickerSymbol").value.trim().toUpperCase();
  const companyName = document.getElementById("companyName").value.trim();
  const quantityOwned = Number(document.getElementById("quantityOwned").value);
  const buyPrice = Number(document.getElementById("buyPrice").value);
  const assetType = document.getElementById("assetType").value;

  return { tickerSymbol, companyName, quantityOwned, buyPrice, assetType };
}

export function setStatus(message, kind = "") {
  const el = document.getElementById("formStatus");
  el.textContent = message || "";
  el.classList.toggle("good", kind === "good");
  el.classList.toggle("bad", kind === "bad");
}
