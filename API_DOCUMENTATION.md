# BarTrack POS - API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "admin",
  "phone": "+1234567890",
  "permissions": ["sales", "stock", "menu"]
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60d5f9f8f8f8f8f8f8f8f8f8",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "permissions": ["sales", "stock", "menu"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60d5f9f8f8f8f8f8f8f8f8f8",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60d5f9f8f8f8f8f8f8f8f8f8",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

## Sales Endpoints

### Create Sale
```http
POST /api/sales
```

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "items": [
    {
      "menuItem": "60d5f9f8f8f8f8f8f8f8f8f8",
      "quantity": 2,
      "discount": 0
    },
    {
      "menuItem": "60d5f9f8f8f8f8f8f8f8f8f9",
      "quantity": 1,
      "discount": 2.50
    }
  ],
  "paymentMethod": "cash",
  "customer": {
    "name": "Customer Name",
    "phone": "+1234567890",
    "email": "customer@example.com"
  },
  "tableNumber": "T1",
  "orderType": "dine-in",
  "discount": 5.00,
  "notes": "Extra ice"
}
```

**Response:**
```json
{
  "success": true,
  "sale": {
    "_id": "60d5f9f8f8f8f8f8f8f8f8fa",
    "invoiceNumber": "INV-202603-00001",
    "items": [...],
    "subtotal": 45.00,
    "tax": 4.50,
    "discount": 5.00,
    "total": 44.50,
    "paymentMethod": "cash",
    "status": "completed",
    "createdAt": "2026-03-11T10:30:00.000Z"
  }
}
```

### Get All Sales
```http
GET /api/sales?startDate=2026-03-01&endDate=2026-03-11&limit=50&page=1
```

**Query Parameters:**
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)
- `paymentMethod` (optional): Filter by payment method
- `status` (optional): Filter by status
- `limit` (optional): Number of results per page (default: 50)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "total": 230,
  "page": 1,
  "pages": 5,
  "sales": [...]
}
```

### Get Single Sale
```http
GET /api/sales/:id
```

**Response:**
```json
{
  "success": true,
  "sale": {
    "_id": "60d5f9f8f8f8f8f8f8f8f8fa",
    "invoiceNumber": "INV-202603-00001",
    "items": [...],
    "total": 44.50,
    "cashier": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Refund Sale
```http
PUT /api/sales/:id/refund
```

**Response:**
```json
{
  "success": true,
  "message": "Sale refunded successfully",
  "sale": {...}
}
```

---

## Menu Endpoints

### Create Menu Item
```http
POST /api/menu
```

**Request Body:**
```json
{
  "name": "Corona Beer",
  "category": "Beer",
  "subcategory": "Lager",
  "description": "Mexican lager beer",
  "price": 5.00,
  "cost": 2.50,
  "sku": "BEER-001",
  "barcode": "1234567890",
  "stockQuantity": 100,
  "reorderLevel": 20,
  "unit": "bottle",
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "menuItem": {
    "_id": "60d5f9f8f8f8f8f8f8f8f8f8",
    "name": "Corona Beer",
    "category": "Beer",
    "price": 5.00,
    "cost": 2.50,
    "stockQuantity": 100
  }
}
```

### Get All Menu Items
```http
GET /api/menu?category=Beer&search=corona&isAvailable=true
```

**Query Parameters:**
- `category` (optional): Filter by category
- `isAvailable` (optional): Filter by availability
- `search` (optional): Search by name or description

**Response:**
```json
{
  "success": true,
  "count": 25,
  "menuItems": [...]
}
```

### Update Menu Item
```http
PUT /api/menu/:id
```

**Request Body:**
```json
{
  "price": 6.00,
  "stockQuantity": 150,
  "isAvailable": true
}
```

### Delete Menu Item
```http
DELETE /api/menu/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted"
}
```

---

## Stock Endpoints

### Record Stock Movement
```http
POST /api/stock/movement
```

**Request Body:**
```json
{
  "menuItemId": "60d5f9f8f8f8f8f8f8f8f8f8",
  "type": "purchase",
  "quantity": 50,
  "unitCost": 2.50,
  "supplier": {
    "name": "ABC Distributors",
    "phone": "+1234567890",
    "email": "supplier@example.com"
  },
  "reference": "PO-001",
  "notes": "Weekly delivery"
}
```

**Movement Types:**
- `purchase`: Add stock (incoming)
- `sale`: Remove stock (outgoing)
- `waste`: Record wastage
- `adjustment`: Stock correction
- `return`: Customer or supplier return
- `transfer`: Transfer between locations

**Response:**
```json
{
  "success": true,
  "movement": {
    "_id": "60d5f9f8f8f8f8f8f8f8f8fb",
    "menuItem": "60d5f9f8f8f8f8f8f8f8f8f8",
    "type": "purchase",
    "quantity": 50,
    "previousQuantity": 100,
    "newQuantity": 150
  },
  "menuItem": {
    "stockQuantity": 150
  }
}
```

### Record Stock Adjustment
```http
POST /api/stock/adjustment
```

**Request Body:**
```json
{
  "menuItemId": "60d5f9f8f8f8f8f8f8f8f8f8",
  "expectedQuantity": 100,
  "actualQuantity": 95,
  "reason": "Daily count discrepancy",
  "notes": "5 bottles missing"
}
```

**Response:**
```json
{
  "success": true,
  "movement": {...},
  "menuItem": {...},
  "variance": -5
}
```

### Get Stock Movements
```http
GET /api/stock/movements?menuItemId=xxx&type=purchase&limit=50
```

### Get Low Stock Items
```http
GET /api/stock/low-stock
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "items": [
    {
      "name": "Corona Beer",
      "stockQuantity": 5,
      "reorderLevel": 20,
      "category": "Beer"
    }
  ]
}
```

### Get Inventory Valuation
```http
GET /api/stock/valuation
```

**Response:**
```json
{
  "success": true,
  "totalValue": "25450.00",
  "totalCost": "12800.00",
  "potentialProfit": "12650.00",
  "categoryBreakdown": {
    "Beer": {
      "value": 5000.00,
      "cost": 2500.00,
      "count": 50
    }
  }
}
```

---

## Analytics Endpoints

### Get Profit & Loss
```http
GET /api/analytics/profit-loss?startDate=2026-03-01&endDate=2026-03-11
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-11"
    },
    "revenue": {
      "gross": 45230.00,
      "tax": 4523.00,
      "discount": 1200.00,
      "net": 48553.00
    },
    "costs": {
      "cogs": 24800.00,
      "total": 24800.00
    },
    "profit": {
      "gross": 20430.00,
      "net": 19230.00,
      "margin": "42.53"
    },
    "transactions": 234
  }
}
```

### Get Sales Summary
```http
GET /api/analytics/sales-summary?startDate=2026-03-01&endDate=2026-03-11
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 48553.00,
    "totalOrders": 234,
    "averageOrderValue": "207.49",
    "paymentMethods": {
      "cash": 120,
      "card": 90,
      "mobile": 24
    },
    "orderTypes": {
      "dine-in": 180,
      "takeaway": 40,
      "delivery": 14
    },
    "topSellingItems": [...]
  }
}
```

### Get Stock Variance Report
```http
GET /api/analytics/stock-variance?startDate=2026-03-01&endDate=2026-03-11
```

### Get Dashboard Overview
```http
GET /api/analytics/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "sales": {...},
      "profitLoss": {...}
    },
    "month": {
      "sales": {...},
      "profitLoss": {...}
    },
    "inventory": {...}
  }
}
```

---

## Bank Reconciliation Endpoints

### Create Bank Transaction
```http
POST /api/bank/transactions
```

**Request Body:**
```json
{
  "date": "2026-03-11",
  "description": "Card payment - Customer Name",
  "type": "deposit",
  "category": "sales",
  "amount": 245.00,
  "bankAccount": "Main Business Account",
  "reference": "TXN-12345"
}
```

### Get Bank Transactions
```http
GET /api/bank/transactions?startDate=2026-03-01&reconciled=false
```

### Reconcile Transaction
```http
PUT /api/bank/transactions/:id/reconcile
```

**Request Body:**
```json
{
  "matchedSaleId": "60d5f9f8f8f8f8f8f8f8f8fa",
  "notes": "Matched to sale INV-202603-00087"
}
```

### Auto-Reconcile
```http
POST /api/bank/auto-reconcile
```

**Request Body:**
```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-11"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-reconciled 45 transactions",
  "matched": 45,
  "total": 78
}
```

---

## User Management Endpoints

### Get All Users
```http
GET /api/users
```

### Get Single User
```http
GET /api/users/:id
```

### Update User
```http
PUT /api/users/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "manager",
  "permissions": ["sales", "stock"]
}
```

### Delete User
```http
DELETE /api/users/:id
```

### Toggle User Status
```http
PUT /api/users/:id/toggle-status
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API rate limits (recommended for production):
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## Webhooks (Future Feature)

Subscribe to events:
- `sale.created`
- `stock.low`
- `sale.refunded`
- `variance.detected`

---

For more information, visit our [documentation](https://docs.bartrackpos.com).
