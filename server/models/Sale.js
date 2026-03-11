const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  cost: Number,
  discount: {
    type: Number,
    default: 0
  },
  total: Number
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile', 'credit', 'other'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'cancelled'],
    default: 'completed'
  },
  customer: {
    name: String,
    phone: String,
    email: String
  },
  tableNumber: {
    type: String
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'dine-in'
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Calculate totals before saving
saleSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = (item.price * item.quantity) - item.discount;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate final total
  this.total = this.subtotal + this.tax - this.discount;
  
  next();
});

// Generate invoice number
saleSchema.statics.generateInvoiceNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const lastSale = await this.findOne()
    .sort({ createdAt: -1 })
    .select('invoiceNumber');
  
  let sequence = 1;
  if (lastSale && lastSale.invoiceNumber) {
    const lastSequence = parseInt(lastSale.invoiceNumber.split('-')[2]);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }
  
  return `INV-${year}${month}-${String(sequence).padStart(5, '0')}`;
};

module.exports = mongoose.model('Sale', saleSchema);
