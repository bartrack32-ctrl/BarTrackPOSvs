const mongoose = require('mongoose');

const bankTransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'fee', 'interest'],
    required: true
  },
  category: {
    type: String,
    enum: ['sales', 'purchase', 'salary', 'rent', 'utilities', 'tax', 'other'],
    default: 'other'
  },
  amount: {
    type: Number,
    required: true
  },
  balance: {
    type: Number
  },
  bankAccount: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    trim: true
  },
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciledDate: {
    type: Date
  },
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  matchedSale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
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
bankTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
bankTransactionSchema.index({ date: -1 });
bankTransactionSchema.index({ bankAccount: 1, date: -1 });
bankTransactionSchema.index({ reconciled: 1 });

module.exports = mongoose.model('BankTransaction', bankTransactionSchema);
