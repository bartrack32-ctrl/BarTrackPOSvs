const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'waste', 'adjustment', 'return', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  supplier: {
    name: String,
    phone: String,
    email: String
  },
  reference: {
    type: String, // Invoice number, PO number, etc.
    trim: true
  },
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  variance: {
    type: Number,
    default: 0
  },
  expectedQuantity: Number,
  actualQuantity: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate variance for stock adjustments
stockMovementSchema.pre('save', function(next) {
  if (this.type === 'adjustment' && this.expectedQuantity && this.actualQuantity) {
    this.variance = this.actualQuantity - this.expectedQuantity;
  }
  
  this.totalCost = this.quantity * this.unitCost;
  next();
});

// Index for efficient querying
stockMovementSchema.index({ menuItem: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
