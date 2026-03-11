const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const analyticsService = require('../services/analytics.service');

// @route   GET /api/analytics/profit-loss
// @desc    Get profit and loss statement
// @access  Private
router.get('/profit-loss', protect, checkPermission('analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    const profitLoss = await analyticsService.getProfitLoss(start, end);

    res.json({
      success: true,
      data: profitLoss
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analytics/sales-summary
// @desc    Get sales summary
// @access  Private
router.get('/sales-summary', protect, checkPermission('analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await analyticsService.getSalesSummary(start, end);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analytics/stock-variance
// @desc    Get stock variance report
// @access  Private
router.get('/stock-variance', protect, checkPermission('analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const variance = await analyticsService.getStockVariance(start, end);

    res.json({
      success: true,
      data: variance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analytics/inventory-valuation
// @desc    Get inventory valuation
// @access  Private
router.get('/inventory-valuation', protect, checkPermission('analytics'), async (req, res) => {
  try {
    const valuation = await analyticsService.getInventoryValuation();

    res.json({
      success: true,
      data: valuation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analytics/hourly-sales
// @desc    Get hourly sales pattern
// @access  Private
router.get('/hourly-sales', protect, checkPermission('analytics'), async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date ? new Date(date) : new Date();

    const hourlySales = await analyticsService.getHourlySales(selectedDate);

    res.json({
      success: true,
      data: hourlySales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard overview
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get today's and month's data
    const [todaySales, monthSales, todayProfitLoss, monthProfitLoss, inventory] = await Promise.all([
      analyticsService.getSalesSummary(today, tomorrow),
      analyticsService.getSalesSummary(monthStart, tomorrow),
      analyticsService.getProfitLoss(today, tomorrow),
      analyticsService.getProfitLoss(monthStart, tomorrow),
      analyticsService.getInventoryValuation()
    ]);

    res.json({
      success: true,
      data: {
        today: {
          sales: todaySales,
          profitLoss: todayProfitLoss
        },
        month: {
          sales: monthSales,
          profitLoss: monthProfitLoss
        },
        inventory
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
