const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, checkPermission } = require('../middleware/auth');

// @route   POST /api/menu
// @desc    Create menu item
// @access  Private
router.post('/', protect, checkPermission('menu'), async (req, res) => {
  try {
    const menuItem = await MenuItem.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, isAvailable, search } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      menuItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private
router.put('/:id', protect, checkPermission('menu'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private
router.delete('/:id', protect, checkPermission('menu'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      success: true,
      message: 'Menu item deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/menu/categories/list
// @desc    Get all categories
// @access  Private
router.get('/categories/list', protect, async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category');

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
