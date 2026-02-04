export function formatMoney(value) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(num);
}

export function formatNumber(value, digits = 4) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  }).format(num);
}

export function formatPct(value) {
  const num = Number(value ?? 0);
  return `${num.toFixed(2)}%`;
}

export function formatDateTime(isoOrEpoch) {
  const d = new Date(isoOrEpoch);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}
