const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const MenuItem = require('../models/MenuItem');
const StockMovement = require('../models/StockMovement');
const { protect, checkPermission } = require('../middleware/auth');
const smsService = require('../services/sms.service');

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', protect, checkPermission('sales'), async (req, res) => {
  try {
    const { items, paymentMethod, customer, tableNumber, orderType, discount, notes } = req.body;

    // Generate invoice number
    const invoiceNumber = await Sale.generateInvoiceNumber();

    // Populate item details and check stock
    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.menuItem} not found` });
      }

      if (menuItem.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${menuItem.name}. Available: ${menuItem.stockQuantity}` 
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      saleItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        cost: menuItem.cost,
        discount: item.discount || 0,
        total: itemTotal - (item.discount || 0)
      });

      // Update stock
      menuItem.stockQuantity -= item.quantity;
      await menuItem.save();

      // Record stock movement
      await StockMovement.create({
        menuItem: menuItem._id,
        type: 'sale',
        quantity: item.quantity,
        previousQuantity: menuItem.stockQuantity + item.quantity,
        newQuantity: menuItem.stockQuantity,
        unitCost: menuItem.cost,
        reference: invoiceNumber,
        performedBy: req.user.id
      });

      // Check for low stock and send SMS alert
      if (menuItem.stockQuantity <= menuItem.reorderLevel) {
        // In production, get manager phone from settings
        const managerPhone = process.env.MANAGER_PHONE;
        if (managerPhone) {
          await smsService.sendLowStockAlert(menuItem, managerPhone);
        }
      }
    }

    // Calculate tax (assuming 10% tax rate)
    const tax = subtotal * 0.10;

    // Create sale
    const sale = await Sale.create({
      invoiceNumber,
      items: saleItems,
      subtotal,
      tax,
      discount: discount || 0,
      total: subtotal + tax - (discount || 0),
      paymentMethod,
      customer,
      tableNumber,
      orderType,
      cashier: req.user.id,
      notes,
      status: 'completed',
      completedAt: new Date()
    });

    // Send sale notification
    const ownerPhone = process.env.OWNER_PHONE;
    if (ownerPhone && sale.total > 100) { // Only for sales over $100
      await smsService.sendSaleNotification(sale, ownerPhone);
    }

    // Emit real-time update via socket.io
    const io = req.app.get('io');
    io.emit('new-sale', sale);

    res.status(201).json({
      success: true,
      sale
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', protect, checkPermission('sales'), async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod, status, limit = 50, page = 1 } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;

    const sales = await Sale.find(query)
      .populate('cashier', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      count: sales.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      sales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', protect, checkPermission('sales'), async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('cashier', 'name email')
      .populate('items.menuItem');

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({
      success: true,
      sale
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/sales/:id/refund
// @desc    Refund a sale
// @access  Private
router.put('/:id/refund', protect, checkPermission('sales'), async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (sale.paymentStatus === 'refunded') {
      return res.status(400).json({ error: 'Sale already refunded' });
    }

    // Restore stock
    for (const item of sale.items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (menuItem) {
        menuItem.stockQuantity += item.quantity;
        await menuItem.save();

        // Record stock movement
        await StockMovement.create({
          menuItem: menuItem._id,
          type: 'return',
          quantity: item.quantity,
          previousQuantity: menuItem.stockQuantity - item.quantity,
          newQuantity: menuItem.stockQuantity,
          reference: sale.invoiceNumber,
          reason: 'Sale refund',
          performedBy: req.user.id
        });
      }
    }

    sale.paymentStatus = 'refunded';
    await sale.save();

    res.json({
      success: true,
      message: 'Sale refunded successfully',
      sale
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
