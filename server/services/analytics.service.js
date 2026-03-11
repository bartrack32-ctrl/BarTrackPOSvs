const Sale = require('../models/Sale');
const MenuItem = require('../models/MenuItem');
const StockMovement = require('../models/StockMovement');

class AnalyticsService {
  // Get profit and loss statement
  async getProfitLoss(startDate, endDate) {
    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    }).populate('items.menuItem');

    let totalRevenue = 0;
    let totalCost = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    sales.forEach(sale => {
      totalRevenue += sale.subtotal;
      totalTax += sale.tax || 0;
      totalDiscount += sale.discount || 0;

      sale.items.forEach(item => {
        totalCost += (item.cost || 0) * item.quantity;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalDiscount;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    return {
      period: { startDate, endDate },
      revenue: {
        gross: totalRevenue,
        tax: totalTax,
        discount: totalDiscount,
        net: totalRevenue + totalTax - totalDiscount
      },
      costs: {
        cogs: totalCost, // Cost of Goods Sold
        total: totalCost
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: profitMargin
      },
      transactions: sales.length
    };
  }

  // Get sales summary
  async getSalesSummary(startDate, endDate) {
    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalSales: 0,
      totalOrders: sales.length,
      averageOrderValue: 0,
      paymentMethods: {},
      orderTypes: {},
      topSellingItems: []
    };

    const itemSales = {};

    sales.forEach(sale => {
      summary.totalSales += sale.total;

      // Count payment methods
      summary.paymentMethods[sale.paymentMethod] = 
        (summary.paymentMethods[sale.paymentMethod] || 0) + 1;

      // Count order types
      summary.orderTypes[sale.orderType] = 
        (summary.orderTypes[sale.orderType] || 0) + 1;

      // Track item sales
      sale.items.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.total;
      });
    });

    summary.averageOrderValue = summary.totalOrders > 0 
      ? (summary.totalSales / summary.totalOrders).toFixed(2) 
      : 0;

    // Get top 10 selling items
    summary.topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return summary;
  }

  // Get stock variance report
  async getStockVariance(startDate, endDate) {
    const variances = await StockMovement.find({
      type: 'adjustment',
      createdAt: { $gte: startDate, $lte: endDate },
      variance: { $ne: 0 }
    }).populate('menuItem performedBy');

    const totalVariance = variances.reduce((sum, v) => sum + Math.abs(v.variance), 0);
    
    const varianceByCategory = {};
    variances.forEach(v => {
      const category = v.menuItem?.category || 'Unknown';
      if (!varianceByCategory[category]) {
        varianceByCategory[category] = {
          count: 0,
          totalVariance: 0,
          items: []
        };
      }
      varianceByCategory[category].count++;
      varianceByCategory[category].totalVariance += Math.abs(v.variance);
      varianceByCategory[category].items.push({
        name: v.menuItem?.name,
        variance: v.variance,
        date: v.createdAt,
        performedBy: v.performedBy?.name
      });
    });

    return {
      period: { startDate, endDate },
      totalVariances: variances.length,
      totalVarianceValue: totalVariance,
      byCategory: varianceByCategory,
      recentVariances: variances.slice(0, 20)
    };
  }

  // Get inventory valuation
  async getInventoryValuation() {
    const items = await MenuItem.find({ isActive: true });

    let totalValue = 0;
    let totalCost = 0;
    const categories = {};

    items.forEach(item => {
      const itemValue = item.price * item.stockQuantity;
      const itemCost = item.cost * item.stockQuantity;
      
      totalValue += itemValue;
      totalCost += itemCost;

      if (!categories[item.category]) {
        categories[item.category] = {
          count: 0,
          value: 0,
          cost: 0,
          quantity: 0
        };
      }

      categories[item.category].count++;
      categories[item.category].value += itemValue;
      categories[item.category].cost += itemCost;
      categories[item.category].quantity += item.stockQuantity;
    });

    return {
      totalItems: items.length,
      totalValue: totalValue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      potentialProfit: (totalValue - totalCost).toFixed(2),
      byCategory: categories
    };
  }

  // Get hourly sales pattern
  async getHourlySales(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'completed'
    });

    const hourlyData = Array(24).fill(0).map((_, i) => ({
      hour: i,
      sales: 0,
      revenue: 0,
      orders: 0
    }));

    sales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      hourlyData[hour].sales += sale.total;
      hourlyData[hour].revenue += sale.total;
      hourlyData[hour].orders++;
    });

    return hourlyData;
  }
}

module.exports = new AnalyticsService();
