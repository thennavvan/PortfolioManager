const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body === 'object') {
        message = Object.values(body).join("\n");
      }
    } catch {
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function getPortfolio() {
  return request("/api/portfolio");
}

export async function addAsset(asset) {
  return request("/api/portfolio", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(asset)
  });
}

export async function updateAsset(id, asset) {
  return request(`/api/portfolio/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(asset)
  });
}

export async function deleteAsset(id) {
  return request(`/api/portfolio/${id}`, { method: "DELETE" });
}

export async function getHistory() {
  return request("/api/portfolio/history");
}

export async function getPricesBulk(symbols) {
  return request("/api/prices/bulk", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ symbols })
  });
}

export async function getAllocation() {
  return request("/api/portfolio/allocation");
}
