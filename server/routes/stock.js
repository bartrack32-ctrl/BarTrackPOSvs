const express = require('express');
const router = express.Router();
const StockMovement = require('../models/StockMovement');
const MenuItem = require('../models/MenuItem');
const { protect, checkPermission } = require('../middleware/auth');
const smsService = require('../services/sms.service');

// @route   POST /api/stock/movement
// @desc    Record stock movement
// @access  Private
router.post('/movement', protect, checkPermission('stock'), async (req, res) => {
  try {
    const { menuItemId, type, quantity, unitCost, supplier, reference, reason, notes } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const previousQuantity = menuItem.stockQuantity;
    let newQuantity = previousQuantity;

    // Calculate new quantity based on movement type
    switch (type) {
      case 'purchase':
      case 'return':
        newQuantity = previousQuantity + quantity;
        break;
      case 'waste':
      case 'sale':
        newQuantity = previousQuantity - quantity;
        break;
      case 'adjustment':
        newQuantity = quantity; // Direct adjustment
        break;
      case 'transfer':
        // Handle transfer logic here
        break;
      default:
        return res.status(400).json({ error: 'Invalid movement type' });
    }

    // Update menu item stock
    menuItem.stockQuantity = newQuantity;
    await menuItem.save();

    // Create stock movement record
    const movement = await StockMovement.create({
      menuItem: menuItemId,
      type,
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity,
      newQuantity,
      unitCost: unitCost || menuItem.cost,
      supplier,
      reference,
      reason,
      notes,
      performedBy: req.user.id
    });

    // Check for low stock
    if (newQuantity <= menuItem.reorderLevel) {
      const managerPhone = process.env.MANAGER_PHONE;
      if (managerPhone) {
        await smsService.sendLowStockAlert(menuItem, managerPhone);
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('stock-update', { menuItem, movement });

    res.status(201).json({
      success: true,
      movement,
      menuItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/stock/adjustment
// @desc    Record stock adjustment with variance tracking
// @access  Private
router.post('/adjustment', protect, checkPermission('stock'), async (req, res) => {
  try {
    const { menuItemId, expectedQuantity, actualQuantity, reason, notes } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const previousQuantity = menuItem.stockQuantity;
    const variance = actualQuantity - expectedQuantity;

    // Update stock
    menuItem.stockQuantity = actualQuantity;
    await menuItem.save();

    // Create movement record
    const movement = await StockMovement.create({
      menuItem: menuItemId,
      type: 'adjustment',
      quantity: Math.abs(actualQuantity - previousQuantity),
      previousQuantity,
      newQuantity: actualQuantity,
      expectedQuantity,
      actualQuantity,
      variance,
      reason,
      notes,
      performedBy: req.user.id
    });

    // Send variance alert if significant
    if (Math.abs(variance) > 5) { // Alert for variance > 5 units
      const managerPhone = process.env.MANAGER_PHONE;
      if (managerPhone) {
        await smsService.sendVarianceAlert(menuItem, variance, managerPhone);
      }
    }

    res.status(201).json({
      success: true,
      movement,
      menuItem,
      variance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stock/movements
// @desc    Get stock movements
// @access  Private
router.get('/movements', protect, checkPermission('stock'), async (req, res) => {
  try {
    const { menuItemId, type, startDate, endDate, limit = 50 } = req.query;

    const query = {};
    
    if (menuItemId) query.menuItem = menuItemId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate('menuItem', 'name category sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: movements.length,
      movements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stock/low-stock
// @desc    Get items with low stock
// @access  Private
router.get('/low-stock', protect, checkPermission('stock'), async (req, res) => {
  try {
    const lowStockItems = await MenuItem.find({
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
      isActive: true
    }).sort({ stockQuantity: 1 });

    res.json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stock/valuation
// @desc    Get inventory valuation
// @access  Private
router.get('/valuation', protect, checkPermission('stock'), async (req, res) => {
  try {
    const items = await MenuItem.find({ isActive: true });

    let totalValue = 0;
    let totalCost = 0;
    const categoryBreakdown = {};

    items.forEach(item => {
      const itemValue = item.price * item.stockQuantity;
      const itemCost = item.cost * item.stockQuantity;
      
      totalValue += itemValue;
      totalCost += itemCost;

      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = {
          value: 0,
          cost: 0,
          count: 0
        };
      }

      categoryBreakdown[item.category].value += itemValue;
      categoryBreakdown[item.category].cost += itemCost;
      categoryBreakdown[item.category].count++;
    });

    res.json({
      success: true,
      totalValue: totalValue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      potentialProfit: (totalValue - totalCost).toFixed(2),
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
