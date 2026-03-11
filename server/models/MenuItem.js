const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Beer', 'Wine', 'Spirits', 'Cocktails', 'Soft Drinks', 'Food', 'Snacks', 'Other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: 0
  },
  image: {
    type: String,
    default: '/images/default-item.png'
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  unit: {
    type: String,
    enum: ['bottle', 'can', 'glass', 'shot', 'liter', 'ml', 'piece', 'serving'],
    default: 'piece'
  },
  ingredients: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    quantity: Number,
    unit: String
  }],
  allergens: [String],
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  tags: [String],
  preparationTime: {
    type: Number, // in minutes
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
menuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate profit margin
menuItemSchema.virtual('profitMargin').get(function() {
  if (this.price && this.cost) {
    return ((this.price - this.cost) / this.price * 100).toFixed(2);
  }
  return 0;
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
