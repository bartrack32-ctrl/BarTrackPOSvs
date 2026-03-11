const app = document.getElementById("app");

// Application State
const state = {
    currentView: 'dashboard',
    user: null,
    sales: [],
    menu: [],
    stock: []
};

// Render Header
function renderHeader() {
    return `
        <div class="header">
            <h1>
                <span style="font-size: 32px;">🍺</span>
                BarTrack POS
            </h1>
            <div class="user-info">
                <span>Welcome, Admin</span>
                <button class="btn btn-secondary" onclick="logout()">Logout</button>
            </div>
        </div>
    `;
}

// Render Dashboard
function renderDashboard() {
    return `
        <div class="dashboard">
            <div class="card">
                <h3>Today's Sales</h3>
                <div class="value">$2,450.00</div>
                <div class="change">↗ +12.5% from yesterday</div>
            </div>
            
            <div class="card">
                <h3>Total Orders</h3>
                <div class="value">87</div>
                <div class="change">↗ +8 orders</div>
            </div>
            
            <div class="card">
                <h3>Profit Margin</h3>
                <div class="value">45.2%</div>
                <div class="change">↗ +2.3%</div>
            </div>
            
            <div class="card">
                <h3>Low Stock Items</h3>
                <div class="value" style="color: var(--danger-color);">12</div>
                <div class="change negative">⚠ Needs attention</div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 15px; color: var(--text-secondary);">Quick Actions</h2>
        <div class="menu">
            <button onclick="changeView('sales')">📊 Sales Management</button>
            <button onclick="changeView('menu')">🍽️ Menu Management</button>
            <button onclick="changeView('stock')">📦 Stock Management</button>
            <button onclick="changeView('analytics')">📈 Analytics & Reports</button>
            <button onclick="changeView('bank')">🏦 Bank Reconciliation</button>
            <button onclick="changeView('settings')">⚙️ Settings</button>
        </div>
        
        <h2 style="margin: 30px 0 15px; color: var(--text-secondary);">Table Status</h2>
        <div class="tables">
            <button class="occupied">T1</button>
            <button>T2</button>
            <button class="reserved">T3</button>
            <button>T4</button>
            <button class="occupied">T5</button>
            <button>T6</button>
            <button>T7</button>
            <button>T8</button>
            <button class="occupied">T9</button>
            <button>T10</button>
        </div>
    `;
}

// Render Sales View
function renderSales() {
    return `
        <h2 style="margin-bottom: 20px;">💰 Sales Management</h2>
        
        <div class="card" style="margin-bottom: 20px;">
            <h3>Create New Sale</h3>
            <div class="form-group">
                <label>Select Items</label>
                <select id="itemSelect">
                    <option>Beer - Corona $5.00</option>
                    <option>Wine - Merlot $8.00</option>
                    <option>Cocktail - Mojito $12.00</option>
                    <option>Whiskey - Jack Daniels $15.00</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" value="1" min="1">
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select>
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Mobile Payment</option>
                </select>
            </div>
            <button class="btn btn-success" style="margin-right: 10px;">Complete Sale</button>
            <button class="btn btn-secondary" onclick="changeView('dashboard')">Cancel</button>
        </div>
        
        <div class="card">
            <h3>Recent Sales</h3>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr style="text-align: left; color: var(--text-secondary);">
                        <th>Invoice</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>INV-202603-00087</td>
                        <td>3</td>
                        <td>$45.00</td>
                        <td>Card</td>
                        <td>10:30 AM</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Render Menu Management
function renderMenu() {
    return `
        <h2 style="margin-bottom: 20px;">🍽️ Menu Management</h2>
        
        <div class="card">
            <h3>Add New Menu Item</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" placeholder="Enter item name">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select>
                        <option>Beer</option>
                        <option>Wine</option>
                        <option>Spirits</option>
                        <option>Cocktails</option>
                        <option>Soft Drinks</option>
                        <option>Food</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Cost ($)</label>
                    <input type="number" step="0.01" placeholder="0.00">
                </div>
            </div>
            <button class="btn btn-primary">Add Item</button>
        </div>
    `;
}

// Render Stock Management
function renderStock() {
    return `
        <h2 style="margin-bottom: 20px;">📦 Stock Management</h2>
        
        <div class="dashboard">
            <div class="card">
                <h3>Total Inventory Value</h3>
                <div class="value">$25,450</div>
            </div>
            <div class="card">
                <h3>Low Stock Alert</h3>
                <div class="value" style="color: var(--danger-color);">12</div>
            </div>
            <div class="card">
                <h3>Stock Variance</h3>
                <div class="value">-2.3%</div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h3>Low Stock Items - Reorder Required</h3>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr style="text-align: left; color: var(--text-secondary);">
                        <th>Item</th>
                        <th>Current Stock</th>
                        <th>Reorder Level</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Corona Beer</td>
                        <td style="color: var(--danger-color);">5</td>
                        <td>20</td>
                        <td><button class="btn btn-primary" style="padding: 8px 16px;">Reorder</button></td>
                    </tr>
                    <tr>
                        <td>Jack Daniels</td>
                        <td style="color: var(--danger-color);">3</td>
                        <td>10</td>
                        <td><button class="btn btn-primary" style="padding: 8px 16px;">Reorder</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Render Analytics
function renderAnalytics() {
    return `
        <h2 style="margin-bottom: 20px;">📈 Profit & Loss Analysis</h2>
        
        <div class="dashboard">
            <div class="card">
                <h3>Gross Revenue</h3>
                <div class="value">$45,230</div>
                <div class="change">This Month</div>
            </div>
            <div class="card">
                <h3>Total Costs</h3>
                <div class="value">$24,800</div>
                <div class="change">This Month</div>
            </div>
            <div class="card">
                <h3>Net Profit</h3>
                <div class="value" style="color: var(--secondary-color);">$20,430</div>
                <div class="change">Profit Margin: 45.2%</div>
            </div>
            <div class="card">
                <h3>Best Selling Item</h3>
                <div class="value" style="font-size: 20px;">Corona Beer</div>
                <div class="change">234 units sold</div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h3>Top Selling Items This Month</h3>
            <div style="margin-top: 15px;">
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Corona Beer</span>
                        <span>234 units - $1,170</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--dark-bg); border-radius: 4px;">
                        <div style="width: 90%; height: 100%; background: var(--primary-color); border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Mojito Cocktail</span>
                        <span>156 units - $1,872</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--dark-bg); border-radius: 4px;">
                        <div style="width: 75%; height: 100%; background: var(--secondary-color); border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Bank Reconciliation
function renderBank() {
    return `
        <h2 style="margin-bottom: 20px;">🏦 Bank Reconciliation</h2>
        
        <div class="dashboard">
            <div class="card">
                <h3>Total Deposits</h3>
                <div class="value">$42,350</div>
            </div>
            <div class="card">
                <h3>Reconciled</h3>
                <div class="value" style="color: var(--secondary-color);">87%</div>
            </div>
            <div class="card">
                <h3>Pending</h3>
                <div class="value" style="color: var(--warning-color);">$5,420</div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h3>Unreconciled Transactions</h3>
            <button class="btn btn-primary" style="margin: 15px 0;">Auto-Reconcile</button>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr style="text-align: left; color: var(--text-secondary);">
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2026-03-11</td>
                        <td>Card Payment</td>
                        <td>$245.00</td>
                        <td><button class="btn btn-success" style="padding: 6px 12px;">Reconcile</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Change View Function
function changeView(view) {
    state.currentView = view;
    render();
}

// Logout Function
function logout() {
    alert('Logging out...');
    location.reload();
}

// Main Render Function
function render() {
    let content = '';
    
    switch(state.currentView) {
        case 'sales':
            content = renderSales();
            break;
        case 'menu':
            content = renderMenu();
            break;
        case 'stock':
            content = renderStock();
            break;
        case 'analytics':
            content = renderAnalytics();
            break;
        case 'bank':
            content = renderBank();
            break;
        default:
            content = renderDashboard();
    }
    
    app.innerHTML = `
        ${renderHeader()}
        ${content}
        
        <!-- 24/7 Support Widget -->
        <div class="support-widget" onclick="openSupport()" title="24/7 Support">
            <span style="font-size: 28px;">💬</span>
        </div>
    `;
}

// Open Support Function
function openSupport() {
    alert('24/7 Support\n\nEmail: support@bartrackpos.com\nPhone: +1-234-567-890\nLive Chat: Available');
}

// Initialize App
render();

// Make functions globally available
window.changeView = changeView;
window.logout = logout;
window.openSupport = openSupport;