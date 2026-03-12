const twilio = require('twilio');

// Check if Twilio credentials are valid
const hasTwilioCredentials = 
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER;

let client = null;

if (hasTwilioCredentials) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
  } catch (error) {
    console.warn('⚠️  Twilio initialization failed:', error.message);
    console.log('📱 Running in demo mode - SMS alerts will be logged instead');
  }
} else {
  console.log('💡 Twilio not configured - SMS alerts will be logged to console');
  console.log('   To enable SMS: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env');
}

class SMSService {
  // Send SMS notification
  async sendSMS(to, message) {
    // Demo mode - log instead of sending
    if (!client) {
      console.log('📱 [DEMO SMS]');
      console.log('   To:', to);
      console.log('   Message:', message);
      return { success: true, demo: true, message: 'SMS logged in demo mode' };
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      
      console.log('✅ SMS sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      console.log('📱 [FALLBACK] Logging message instead');
      console.log('   To:', to);
      console.log('   Message:', message);
      return { success: false, error: error.message, logged: true };
    }
  }

  // Low stock alert
  async sendLowStockAlert(item, recipientPhone) {
    const message = `🔔 Low Stock Alert!\n\nItem: ${item.name}\nCurrent Stock: ${item.stockQuantity} ${item.unit}\nReorder Level: ${item.reorderLevel}\n\nPlease restock soon!`;
    return await this.sendSMS(recipientPhone, message);
  }

  // Sale notification
  async sendSaleNotification(sale, recipientPhone) {
    const message = `💰 New Sale Alert!\n\nInvoice: ${sale.invoiceNumber}\nTotal: $${sale.total.toFixed(2)}\nItems: ${sale.items.length}\nPayment: ${sale.paymentMethod}\n\nThank you!`;
    return await this.sendSMS(recipientPhone, message);
  }

  // Daily summary
  async sendDailySummary(summary, recipientPhone) {
    const message = `📊 Daily Summary\n\nTotal Sales: $${summary.totalSales.toFixed(2)}\nOrders: ${summary.orderCount}\nProfit: $${summary.profit.toFixed(2)}\n\nGreat day!`;
    return await this.sendSMS(recipientPhone, message);
  }

  // Stock variance alert
  async sendVarianceAlert(item, variance, recipientPhone) {
    const message = `⚠️ Stock Variance Alert!\n\nItem: ${item.name}\nVariance: ${variance} ${item.unit}\n\nPlease investigate.`;
    return await this.sendSMS(recipientPhone, message);
  }

  // Customer notification
  async sendCustomerNotification(phone, orderStatus, invoiceNumber) {
    const message = `🍺 BarTrack POS\n\nYour order ${invoiceNumber} is ${orderStatus}.\n\nThank you for your business!`;
    return await this.sendSMS(phone, message);
  }
}

module.exports = new SMSService();
