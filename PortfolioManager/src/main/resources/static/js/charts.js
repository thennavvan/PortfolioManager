import { formatMoney, formatDateTime } from "./format.js";

let allocationChart = null;
let historyChart = null;

export function renderAllocationChart(ctx, allocationByType) {
  console.log("renderAllocationChart called with:", allocationByType);
  const labels = Object.keys(allocationByType);
  const data = labels.map(k => allocationByType[k]);

  if (allocationChart) allocationChart.destroy();

  // Ensure chart renders even with no data
  const finalLabels = labels.length ? labels : ["No assets"];
  const finalData = data.length ? data : [1];

  allocationChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: finalLabels,
      datasets: [{
        data: finalData,
        borderColor: "rgba(255,255,255,0.14)",
        backgroundColor: [
          "rgba(124, 92, 255, 0.65)",
          "rgba(45, 212, 191, 0.65)",
          "rgba(251, 113, 133, 0.55)",
          "rgba(255, 255, 255, 0.20)",
          "rgba(250, 204, 21, 0.55)",
          "rgba(34, 197, 94, 0.55)",
          "rgba(59, 130, 246, 0.55)",
          "rgba(168, 85, 247, 0.55)"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "rgba(255,255,255,0.85)" }
        },
        tooltip: {
          callbacks: {
            label: (item) => `${item.label}: ${formatMoney(item.raw)}`
          }
        }
      }
    }
  });
}

export function renderHistoryChart(ctx, points) {
  console.log("renderHistoryChart called with:", points);
  const labels = points.map(p => formatDateTime(p.time));
  const data = points.map(p => p.totalValue);

  if (historyChart) historyChart.destroy();

  // Ensure chart renders even with no data
  const finalLabels = labels.length ? labels : ["No data"];
  const finalData = data.length ? data : [0];

  historyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: finalLabels,
      datasets: [{
        label: "Portfolio Value",
        data: finalData,
        borderColor: "rgba(45, 212, 191, 0.8)",
        backgroundColor: "rgba(45, 212, 191, 0.18)",
        fill: true,
        tension: 0.25,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.65)" },
          grid: { color: "rgba(255,255,255,0.06)" }
        },
        y: {
          ticks: {
            color: "rgba(255,255,255,0.65)",
            callback: (v) => formatMoney(v)
          },
          grid: { color: "rgba(255,255,255,0.06)" }
        }
      },
      plugins: {
        legend: { labels: { color: "rgba(255,255,255,0.85)" } },
        tooltip: {
          callbacks: {
            label: (item) => formatMoney(item.raw)
          }
        }
      }
    }
  });
}
