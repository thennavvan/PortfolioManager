import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPortfolioSummary, getPortfolioHoldings, getPortfolioAllocation, getAssets, getAllPortfolioHistory } from './api';

// Colors for pie chart segments
const CHART_COLORS = [
  [59, 130, 246],   // Blue
  [239, 68, 68],    // Red
  [16, 185, 129],   // Green
  [245, 158, 11],   // Amber
  [139, 92, 246],   // Purple
  [236, 72, 153],   // Pink
  [20, 184, 166],   // Teal
  [249, 115, 22],   // Orange
];

/**
 * Draws a pie chart on the PDF
 */
const drawPieChart = (doc, allocation, centerX, centerY, radius) => {
  if (!allocation || allocation.length === 0) return;

  let startAngle = -Math.PI / 2; // Start from top
  const total = allocation.reduce((sum, item) => sum + (item.percentageAllocation || 0), 0);

  allocation.forEach((item, index) => {
    const percentage = item.percentageAllocation || 0;
    const sliceAngle = (percentage / 100) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const color = CHART_COLORS[index % CHART_COLORS.length];

    // Draw pie slice
    doc.setFillColor(color[0], color[1], color[2]);
    
    // Draw the slice as a filled arc
    const steps = 50;
    const points = [];
    points.push([centerX, centerY]);
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i / steps);
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      ]);
    }
    points.push([centerX, centerY]);

    // Draw filled polygon for the slice
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    
    // Use lines to draw the slice
    doc.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      doc.lineTo(points[i][0], points[i][1]);
    }
    doc.fill();

    startAngle = endAngle;
  });

  // Draw legend
  let legendY = centerY - (allocation.length * 8) / 2;
  const legendX = centerX + radius + 15;

  allocation.forEach((item, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    
    // Color box
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(legendX, legendY - 3, 8, 8, 'F');
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`${item.assetType}: ${item.percentageAllocation?.toFixed(1) || 0}%`, legendX + 12, legendY + 3);
    
    legendY += 12;
  });
};

/**
 * Draws a line chart for portfolio history
 */
const drawLineChart = (doc, historyData, startX, startY, chartWidth, chartHeight) => {
  if (!historyData || historyData.length === 0) return;

  const values = historyData.map(d => d.totalValue);
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;
  const valueRange = maxValue - minValue;

  // Draw chart background
  doc.setFillColor(248, 250, 252);
  doc.rect(startX, startY, chartWidth, chartHeight, 'F');

  // Draw border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(startX, startY, chartWidth, chartHeight, 'S');

  // Draw grid lines
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  for (let i = 1; i < 5; i++) {
    const y = startY + (chartHeight * i / 5);
    doc.line(startX, y, startX + chartWidth, y);
  }

  // Draw Y-axis labels
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  for (let i = 0; i <= 5; i++) {
    const value = maxValue - (valueRange * i / 5);
    const y = startY + (chartHeight * i / 5);
    doc.text(`$${(value / 1000).toFixed(1)}k`, startX - 2, y + 2, { align: 'right' });
  }

  // Draw the line
  if (historyData.length > 1) {
    const pointSpacing = chartWidth / (historyData.length - 1);
    
    // Draw filled area under the line
    doc.setFillColor(59, 130, 246, 0.2);
    let areaPoints = [];
    
    historyData.forEach((point, index) => {
      const x = startX + (index * pointSpacing);
      const normalizedValue = (point.totalValue - minValue) / valueRange;
      const y = startY + chartHeight - (normalizedValue * chartHeight);
      areaPoints.push([x, y]);
    });

    // Draw the line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);
    
    for (let i = 1; i < areaPoints.length; i++) {
      doc.line(areaPoints[i-1][0], areaPoints[i-1][1], areaPoints[i][0], areaPoints[i][1]);
    }

    // Draw points
    doc.setFillColor(59, 130, 246);
    areaPoints.forEach(([x, y]) => {
      doc.circle(x, y, 1.5, 'F');
    });
  }

  // Draw X-axis labels (dates)
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  const labelCount = Math.min(5, historyData.length);
  const labelStep = Math.floor(historyData.length / labelCount);
  
  for (let i = 0; i < historyData.length; i += labelStep) {
    const point = historyData[i];
    const x = startX + (i * chartWidth / (historyData.length - 1));
    const dateStr = new Date(point.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    doc.text(dateStr, x, startY + chartHeight + 8, { align: 'center' });
  }
};

/**
 * Generates and downloads a PDF report with portfolio data
 */
export const exportPortfolioPDF = async () => {
  try {
    // Fetch all required data in parallel
    const [summaryRes, holdingsRes, allocationRes, assetsRes, historyRes] = await Promise.all([
      getPortfolioSummary(),
      getPortfolioHoldings(),
      getPortfolioAllocation(),
      getAssets(),
      getAllPortfolioHistory().catch(() => ({ data: [] }))
    ]);

    const summary = summaryRes.data;
    const holdings = holdingsRes.data || [];
    const allocation = allocationRes.data?.allocations || [];
    const assets = assetsRes.data || [];
    const historyData = historyRes.data || [];

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Helper function to add section header
    const addSectionHeader = (title) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246); // Primary blue color
      doc.text(title, 14, yPosition);
      yPosition += 8;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    };

    // Helper function to format currency
    const formatCurrency = (value) => {
      return typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00';
    };

    // ==================== TITLE ====================
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('FinSight Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // ==================== PORTFOLIO SUMMARY ====================
    addSectionHeader('Portfolio Summary');

    const summaryData = [
      ['Total Portfolio Value', formatCurrency(summary?.totalPortfolioValue)],
      ['Total Invested', formatCurrency(summary?.totalInvestedValue)],
      ['Total Profit/Loss', formatCurrency(summary?.profitLoss)],
      ['Profit/Loss %', `${summary?.profitLossPercent?.toFixed(2) || '0.00'}%`],
      ['Number of Holdings', `${holdings.length}`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'left' }
      },
      margin: { left: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // ==================== ASSET ALLOCATION WITH PIE CHART ====================
    if (allocation.length > 0) {
      // Check if we need a new page
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader('Asset Allocation');

      // Draw pie chart
      const chartCenterX = 60;
      const chartCenterY = yPosition + 40;
      const chartRadius = 35;
      
      drawPieChart(doc, allocation, chartCenterX, chartCenterY, chartRadius);

      yPosition = chartCenterY + chartRadius + 15;

      // Also add allocation table
      const allocationTableData = allocation.map(item => [
        item.assetType || 'Unknown',
        formatCurrency(item.value),
        `${item.percentageAllocation?.toFixed(2) || '0.00'}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Asset Type', 'Total Value', 'Allocation %']],
        body: allocationTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // ==================== PORTFOLIO PERFORMANCE OVER TIME ====================
    if (historyData.length > 0) {
      // Check if we need a new page
      if (yPosition > 150) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader('Portfolio Value Over Time');

      const chartStartX = 30;
      const chartStartY = yPosition + 5;
      const chartWidth = pageWidth - 50;
      const chartHeight = 60;

      drawLineChart(doc, historyData, chartStartX, chartStartY, chartWidth, chartHeight);

      // Add summary stats below the chart
      yPosition = chartStartY + chartHeight + 20;
      
      if (historyData.length > 1) {
        const startValue = historyData[0].totalValue;
        const endValue = historyData[historyData.length - 1].totalValue;
        const change = endValue - startValue;
        const changePercent = ((change / startValue) * 100).toFixed(2);
        const highestValue = Math.max(...historyData.map(d => d.totalValue));
        const lowestValue = Math.min(...historyData.map(d => d.totalValue));

        const historyStatsData = [
          ['Period Start Value', formatCurrency(startValue)],
          ['Period End Value', formatCurrency(endValue)],
          ['Change', `${formatCurrency(change)} (${changePercent}%)`],
          ['Highest Value', formatCurrency(highestValue)],
          ['Lowest Value', formatCurrency(lowestValue)],
          ['Data Points', `${historyData.length}`]
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [],
          body: historyStatsData,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { halign: 'left' }
          },
          margin: { left: 14 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }
    }

    // ==================== PORTFOLIO HOLDINGS ====================
    if (holdings.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader('Portfolio Holdings');

      const holdingsTableData = holdings.map(holding => [
        holding.symbol || '',
        holding.assetType || '',
        holding.quantity?.toString() || '0',
        formatCurrency(holding.buyPrice),
        formatCurrency(holding.currentPrice),
        formatCurrency(holding.marketValue),
        formatCurrency(holding.profitLoss),
        `${holding.profitLossPercent?.toFixed(2) || '0.00'}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Symbol', 'Type', 'Qty', 'Buy Price', 'Current', 'Market Value', 'P/L', 'P/L %']],
        body: holdingsTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          6: { 
            cellWidth: 22,
            halign: 'right'
          },
          7: { 
            cellWidth: 18,
            halign: 'right'
          }
        },
        margin: { left: 14, right: 14 },
        didParseCell: function(data) {
          // Color profit/loss columns
          if (data.section === 'body') {
            if (data.column.index === 6 || data.column.index === 7) {
              const value = holdings[data.row.index]?.profitLoss || 0;
              if (value >= 0) {
                data.cell.styles.textColor = [16, 185, 129]; // Green
              } else {
                data.cell.styles.textColor = [239, 68, 68]; // Red
              }
            }
          }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // ==================== ASSET TABLE ====================
    if (assets.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader('Asset Table');

      const assetsTableData = assets.map(asset => [
        asset.symbol || '',
        asset.name || '',
        asset.assetType || '',
        asset.quantity?.toString() || '0',
        formatCurrency(asset.buyPrice)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Symbol', 'Name', 'Type', 'Quantity', 'Buy Price']],
        body: assetsTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: 14, right: 14 }
      });
    }

    // ==================== FOOTER ====================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | FinSight Report`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `Portfolio_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report: ' + error.message);
  }
};
