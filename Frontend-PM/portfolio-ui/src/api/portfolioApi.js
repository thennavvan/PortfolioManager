const BASE_URL = "http://localhost:8080/api";

export async function getPortfolioSummary() {
  const res = await fetch(`${BASE_URL}/portfolio/summary`);
  return res.json();
}

export async function getPortfolioAllocation() {
  const res = await fetch(`${BASE_URL}/portfolio/allocation`);
  return res.json();
}

export async function getHoldings() {
  const res = await fetch(`${BASE_URL}/portfolio/holdings`);
  return res.json();
}
