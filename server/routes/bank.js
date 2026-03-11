const express = require('express');
const router = express.Router();
const BankTransaction = require('../models/BankTransaction');
const Sale = require('../models/Sale');
const { protect, checkPermission } = require('../middleware/auth');

// @route   POST /api/bank/transactions
// @desc    Create bank transaction
// @access  Private
router.post('/transactions', protect, checkPermission('bank'), async (req, res) => {
  try {
    const transaction = await BankTransaction.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/bank/transactions
// @desc    Get bank transactions
// @access  Private
router.get('/transactions', protect, checkPermission('bank'), async (req, res) => {
  try {
    const { startDate, endDate, bankAccount, reconciled, limit = 50 } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (bankAccount) query.bankAccount = bankAccount;
    if (reconciled !== undefined) query.reconciled = reconciled === 'true';

    const transactions = await BankTransaction.find(query)
      .populate('reconciledBy', 'name email')
      .populate('matchedSale')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/bank/transactions/:id/reconcile
// @desc    Reconcile bank transaction
// @access  Private
router.put('/transactions/:id/reconcile', protect, checkPermission('bank'), async (req, res) => {
  try {
    const { matchedSaleId, notes } = req.body;

    const transaction = await BankTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.reconciled) {
      return res.status(400).json({ error: 'Transaction already reconciled' });
    }

    // Verify matched sale if provided
    if (matchedSaleId) {
      const sale = await Sale.findById(matchedSaleId);
      if (!sale) {
        return res.status(404).json({ error: 'Matched sale not found' });
      }
      transaction.matchedSale = matchedSaleId;
    }

    transaction.reconciled = true;
    transaction.reconciledDate = new Date();
    transaction.reconciledBy = req.user.id;
    if (notes) transaction.notes = notes;

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction reconciled successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/bank/reconciliation-report
// @desc    Get reconciliation report
// @access  Private
router.get('/reconciliation-report', protect, checkPermission('bank'), async (req, res) => {
  try {
    const { startDate, endDate, bankAccount } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (bankAccount) query.bankAccount = bankAccount;

    const [reconciled, unreconciled, allTransactions] = await Promise.all([
      BankTransaction.find({ ...query, reconciled: true }),
      BankTransaction.find({ ...query, reconciled: false }),
      BankTransaction.find(query)
    ]);

    const totalDeposits = allTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = allTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const unreconciledAmount = unreconciled.reduce((sum, t) => {
      return sum + (t.type === 'deposit' ? t.amount : -t.amount);
    }, 0);

    res.json({
      success: true,
      report: {
        totalTransactions: allTransactions.length,
        reconciled: reconciled.length,
        unreconciled: unreconciled.length,
        totalDeposits: totalDeposits.toFixed(2),
        totalWithdrawals: totalWithdrawals.toFixed(2),
        netAmount: (totalDeposits - totalWithdrawals).toFixed(2),
        unreconciledAmount: unreconciledAmount.toFixed(2),
        reconciliationRate: allTransactions.length > 0 
          ? ((reconciled.length / allTransactions.length) * 100).toFixed(2) 
          : 0
      },
      unreconciledTransactions: unreconciled
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/bank/auto-reconcile
// @desc    Auto-reconcile transactions with sales
// @access  Private
router.post('/auto-reconcile', protect, checkPermission('bank'), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const unreconciledTransactions = await BankTransaction.find({
      reconciled: false,
      type: 'deposit',
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    const sales = await Sale.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      paymentMethod: { $in: ['card', 'mobile'] }
    });

    let matched = 0;

    for (const transaction of unreconciledTransactions) {
      // Try to match by amount and date
      const matchedSale = sales.find(sale => {
        const saleDate = new Date(sale.createdAt);
        const transDate = new Date(transaction.date);
        const sameDay = saleDate.toDateString() === transDate.toDateString();
        const sameAmount = Math.abs(sale.total - transaction.amount) < 0.01;
        
        return sameDay && sameAmount;
      });

      if (matchedSale) {
        transaction.matchedSale = matchedSale._id;
        transaction.reconciled = true;
        transaction.reconciledDate = new Date();
        transaction.reconciledBy = req.user.id;
        transaction.notes = 'Auto-reconciled by system';
        await transaction.save();
        matched++;
      }
    }

    res.json({
      success: true,
      message: `Auto-reconciled ${matched} transactions`,
      matched,
      total: unreconciledTransactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
