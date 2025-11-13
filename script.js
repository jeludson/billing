// Default menu items with free food images from Unsplash (completely free)
const defaultMenuItems = [
    { id: 1, name: 'Idly', price: 25.00, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', description: 'Soft rice cakes' },
    { id: 2, name: 'Puttu', price: 30.00, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', description: 'Steamed rice cake' },
    { id: 3, name: 'Dosa', price: 40.00, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', description: 'Crispy rice crepe' },
    { id: 4, name: 'Vada', price: 20.00, image: 'https://images.unsplash.com/photo-1606503153255-59d8b8b2a8e1?w=800&q=80', description: 'Fried lentil fritter' },
    { id: 5, name: 'Porrota', price: 15.00, image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&q=80', description: 'Flaky layered flatbread' },
    { id: 6, name: 'Samosa', price: 10.00, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80', description: 'Fried pastry with filling' },
    { id: 7, name: 'Appam', price: 35.00, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', description: 'Fermented rice pancake' },
    { id: 8, name: 'Poori', price: 20.00, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80', description: 'Deep fried bread' },
    { id: 9, name: 'Tea', price: 10.00, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80', description: 'Hot tea' },
    { id: 10, name: 'Coffee', price: 15.00, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80', description: 'Hot coffee' }
];

// Initialize data
let menuItems = [];
let cart = [];
let bills = []; // Store all bills history
let nextItemId = 11; // Start from 11 since we have 10 default items
let nextBillId = 1; // For bill IDs
let currentBillView = 'daily'; // 'daily' or 'monthly'

// DOM Elements - will be initialized after DOM loads
let menuGrid, cartItems, totalAmount, itemModal, itemForm, qrModal;
let addItemBtn, closeModal, closeQrModal, cancelBtn, clearBtn, payBtn, printBtn, modalTitle;
let dailyBillBtn, monthlyBillBtn, billsList, billDetailModal, closeBillModal;

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    // Get DOM elements first
    menuGrid = document.getElementById('menuGrid');
    cartItems = document.getElementById('cartItems');
    totalAmount = document.getElementById('totalAmount');
    itemModal = document.getElementById('itemModal');
    itemForm = document.getElementById('itemForm');
    qrModal = document.getElementById('qrModal');
    addItemBtn = document.getElementById('addItemBtn');
    closeModal = document.getElementById('closeModal');
    closeQrModal = document.getElementById('closeQrModal');
    cancelBtn = document.getElementById('cancelBtn');
    clearBtn = document.getElementById('clearBtn');
    payBtn = document.getElementById('payBtn');
    printBtn = document.getElementById('printBtn');
    modalTitle = document.getElementById('modalTitle');
    dailyBillBtn = document.getElementById('dailyBillBtn');
    monthlyBillBtn = document.getElementById('monthlyBillBtn');
    billsList = document.getElementById('billsList');
    billDetailModal = document.getElementById('billDetailModal');
    closeBillModal = document.getElementById('closeBillModal');
    
    // Check if DOM elements are available
    if (!menuGrid || !cartItems || !totalAmount) {
        console.error('Required DOM elements not found! Retrying...');
        setTimeout(initializeApp, 100);
        return;
    }
    
    // Load data from localStorage or use defaults
    const storedItems = localStorage.getItem('menuItems');
    if (storedItems && storedItems.trim() !== '') {
        try {
            const parsed = JSON.parse(storedItems);
            if (Array.isArray(parsed) && parsed.length > 0) {
                menuItems = parsed;
            } else {
                menuItems = [...defaultMenuItems];
                localStorage.setItem('menuItems', JSON.stringify(menuItems));
            }
        } catch (e) {
            console.error('Error parsing stored items:', e);
            menuItems = [...defaultMenuItems];
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
        }
    } else {
        // No stored items, use defaults
        menuItems = [...defaultMenuItems];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
    
    const storedCart = localStorage.getItem('cart');
    cart = (storedCart && storedCart.trim() !== '') ? JSON.parse(storedCart) : [];
    
    // Load bills history
    const storedBills = localStorage.getItem('bills');
    bills = (storedBills && storedBills.trim() !== '') ? JSON.parse(storedBills) : [];
    nextBillId = bills.length > 0 ? Math.max(...bills.map(b => b.id), 0) + 1 : 1;
    
    nextItemId = Math.max(...menuItems.map(item => item.id), 0) + 1;
    
    console.log('Menu items loaded:', menuItems.length);
    console.log('Bills loaded:', bills.length);
    
    // Initialize the app
    init();
}

function init() {
    if (!menuGrid) {
        console.error('menuGrid not found');
        return;
    }
    renderMenu();
    renderCart();
    setupEventListeners();
    renderBills();
    saveToLocalStorage();
    console.log('App initialized with', menuItems.length, 'menu items');
}

function setupEventListeners() {
    addItemBtn.addEventListener('click', () => openItemModal());
    closeModal.addEventListener('click', () => closeItemModal());
    closeQrModal.addEventListener('click', () => closeQrModalFunc());
    if (closeBillModal) closeBillModal.addEventListener('click', () => closeBillDetailModal());
    cancelBtn.addEventListener('click', () => closeItemModal());
    itemForm.addEventListener('submit', handleItemSubmit);
    clearBtn.addEventListener('click', clearCart);
    payBtn.addEventListener('click', () => { saveBill(); showQRCode(); });
    printBtn.addEventListener('click', printBill);
    
    if (dailyBillBtn) dailyBillBtn.addEventListener('click', () => switchBillView('daily'));
    if (monthlyBillBtn) monthlyBillBtn.addEventListener('click', () => switchBillView('monthly'));
    
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) closeItemModal();
        if (e.target === qrModal) closeQrModalFunc();
        if (e.target === billDetailModal) closeBillDetailModal();
    });
}

// CRUD Operations for Menu Items
function renderMenu() {
    if (!menuGrid) {
        console.error('menuGrid element not found');
        return;
    }
    
    menuGrid.innerHTML = '';
    
    if (!menuItems || menuItems.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: #999;">No menu items. Click "Add Item" to add items.</p>';
        return;
    }
    
    console.log('Rendering', menuItems.length, 'menu items');
    
    menuItems.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        menuItemDiv.setAttribute('data-item-id', item.id);
        // Use free responsive images - fallback to Picsum if image fails
        const fallbackUrl = `https://picsum.photos/seed/${item.name.toLowerCase()}/${screen.width > 768 ? 400 : 300}/${screen.width > 768 ? 400 : 300}`;
        const imageUrl = item.image || fallbackUrl;
        
        menuItemDiv.innerHTML = `
            <picture class="menu-item-picture">
                <source media="(max-width: 480px)" 
                        srcset="${imageUrl} 1x">
                <source media="(max-width: 768px)" 
                        srcset="${imageUrl} 1x">
                <img src="${imageUrl}" 
                     alt="${item.name}" 
                     class="menu-item-image"
                     loading="lazy"
                     decoding="async"
                     sizes="(max-width: 480px) 150px, (max-width: 768px) 200px, 250px"
                     onerror="this.onerror=null; this.src='${fallbackUrl}'">
            </picture>
            <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
                <div class="menu-item-actions" onclick="event.stopPropagation()">
                    <button class="btn-edit" onclick="openItemModal(${item.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteMenuItem(${item.id})">Delete</button>
                    <button class="btn-add" onclick="event.stopPropagation(); addToCart(${item.id})" style="flex: 1; margin-top: 5px;">Add</button>
                </div>
            </div>
        `;
        
        // Make entire card clickable to add to cart
        menuItemDiv.addEventListener('click', function(e) {
            // Only add to cart if click is not on buttons
            if (!e.target.closest('.menu-item-actions')) {
                addToCart(item.id);
            }
        });
        
        menuGrid.appendChild(menuItemDiv);
    });
}

function openItemModal(itemId = null) {
    modalTitle.textContent = itemId ? 'Edit Menu Item' : 'Add Menu Item';
    itemForm.reset();
    document.getElementById('itemId').value = itemId || '';
    
    if (itemId) {
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemImage').value = item.image;
            document.getElementById('itemDescription').value = item.description || '';
        }
    }
    
    itemModal.style.display = 'block';
}

function closeItemModal() {
    itemModal.style.display = 'none';
    itemForm.reset();
}

function handleItemSubmit(e) {
    e.preventDefault();
    
    const itemId = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const image = document.getElementById('itemImage').value || 
                  `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`;
    const description = document.getElementById('itemDescription').value;
    
    if (itemId) {
        // Update existing item
        const index = menuItems.findIndex(i => i.id === parseInt(itemId));
        if (index !== -1) {
            menuItems[index] = { ...menuItems[index], name, price, image, description };
        }
    } else {
        // Add new item
        menuItems.push({ id: nextItemId++, name, price, image, description });
    }
    
    saveToLocalStorage();
    renderMenu();
    closeItemModal();
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        menuItems = menuItems.filter(item => item.id !== id);
        cart = cart.filter(item => item.id !== id);
        saveToLocalStorage();
        renderMenu();
        renderCart();
    }
}

// Cart Operations
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    const cartItem = cart.find(c => c.id === itemId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    saveToLocalStorage();
    renderCart();
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveToLocalStorage();
    renderCart();
}

function updateQuantity(itemId, change) {
    const cartItem = cart.find(c => c.id === itemId);
    if (!cartItem) return;
    
    cartItem.quantity += change;
    if (cartItem.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    saveToLocalStorage();
    renderCart();
}

function renderCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        totalAmount.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div>₹${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
            </div>
            <div class="cart-item-total">₹${itemTotal.toFixed(2)}</div>
        `;
        cartItems.appendChild(cartItemDiv);
    });
    
    totalAmount.textContent = total.toFixed(2);
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        saveToLocalStorage();
        renderCart();
    }
}

// QR Code Payment
function showQRCode() {
    if (cart.length === 0) {
        alert('Cart is empty. Please add items to cart.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('qrAmount').textContent = total.toFixed(2);
    
    // Generate UPI payment link
    const upiId = 'restaurant@upi'; // Replace with actual UPI ID
    const amount = total.toFixed(2);
    const upiLink = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Restaurant Payment`;
    
    // Clear existing QR code
    document.getElementById('qrcode').innerHTML = '';
    
    // Generate QR code
    new QRCode(document.getElementById('qrcode'), {
        text: upiLink,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    qrModal.style.display = 'block';
}

function closeQrModalFunc() {
    qrModal.style.display = 'none';
    document.getElementById('qrcode').innerHTML = '';
}

// Save Bill
function saveBill() {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const dateTime = now.toISOString();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const bill = {
        id: nextBillId++,
        items: JSON.parse(JSON.stringify(cart)), // Deep copy
        total: total,
        date: date,
        time: time,
        dateTime: dateTime,
        year: year,
        month: month,
        day: day,
        monthYear: `${year}-${String(month).padStart(2, '0')}`,
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    };
    
    bills.push(bill);
    saveToLocalStorage();
    renderBills();
    
    return bill;
}

// Bill Print
function printBill() {
    if (cart.length === 0) {
        alert('Cart is empty. Please add items to cart.');
        return;
    }
    
    const bill = saveBill();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    
    document.getElementById('billDate').textContent = date;
    document.getElementById('billTime').textContent = time;
    document.getElementById('billId').textContent = `#${bill.id}`;
    document.getElementById('billTotal').textContent = total.toFixed(2);
    
    const billItemsBody = document.getElementById('billItems');
    billItemsBody.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${itemTotal.toFixed(2)}</td>
        `;
        billItemsBody.appendChild(row);
    });
    
    // Clear cart after printing
    cart = [];
    saveToLocalStorage();
    renderCart();
    renderBills();
    
    // Print
    window.print();
}

// Bills History Functions
function switchBillView(view) {
    currentBillView = view;
    
    if (dailyBillBtn && monthlyBillBtn) {
        if (view === 'daily') {
            dailyBillBtn.classList.add('active');
            monthlyBillBtn.classList.remove('active');
        } else {
            monthlyBillBtn.classList.add('active');
            dailyBillBtn.classList.remove('active');
        }
    }
    
    renderBills();
}

function renderBills() {
    if (!billsList) return;
    
    billsList.innerHTML = '';
    
    if (!bills || bills.length === 0) {
        billsList.innerHTML = '<p class="empty-bills">No bills found</p>';
        return;
    }
    
    let filteredBills = [];
    const now = new Date();
    
    if (currentBillView === 'daily') {
        // Show today's bills
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        filteredBills = bills.filter(bill => bill.dateKey === today);
        filteredBills.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    } else {
        // Show monthly bills grouped by month
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        filteredBills = bills.filter(bill => bill.monthYear === currentMonth);
        filteredBills.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        
        // Group by date
        const groupedBills = {};
        filteredBills.forEach(bill => {
            if (!groupedBills[bill.dateKey]) {
                groupedBills[bill.dateKey] = [];
            }
            groupedBills[bill.dateKey].push(bill);
        });
        
        // Render grouped monthly bills
        const sortedDates = Object.keys(groupedBills).sort((a, b) => b.localeCompare(a));
        let monthlyTotal = 0;
        
        sortedDates.forEach(dateKey => {
            const dayBills = groupedBills[dateKey];
            const dayTotal = dayBills.reduce((sum, b) => sum + b.total, 0);
            monthlyTotal += dayTotal;
            
            const dateParts = dateKey.split('-');
            const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'bill-day-group';
            dayDiv.innerHTML = `
                <div class="bill-day-header">
                    <h3>${dateStr}</h3>
                    <span class="bill-day-total">Total: ₹${dayTotal.toFixed(2)}</span>
                </div>
                <div class="bill-day-bills">
                    ${dayBills.map(bill => createBillCard(bill)).join('')}
                </div>
            `;
            billsList.appendChild(dayDiv);
        });
        
        if (sortedDates.length > 0) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'monthly-summary';
            summaryDiv.innerHTML = `
                <div class="summary-card">
                    <h3>Monthly Summary</h3>
                    <p>Total Bills: <strong>${filteredBills.length}</strong></p>
                    <p>Total Amount: <strong>₹${monthlyTotal.toFixed(2)}</strong></p>
                </div>
            `;
            billsList.insertBefore(summaryDiv, billsList.firstChild);
        }
        
        return;
    }
    
    if (filteredBills.length === 0) {
        billsList.innerHTML = `<p class="empty-bills">No ${currentBillView === 'daily' ? 'daily' : 'monthly'} bills found</p>`;
        return;
    }
    
    // Render individual bills
    filteredBills.forEach(bill => {
        const billCard = document.createElement('div');
        billCard.className = 'bill-card';
        billCard.innerHTML = createBillCard(bill);
        billsList.appendChild(billCard);
    });
}

function createBillCard(bill) {
    const itemsCount = bill.items.reduce((sum, item) => sum + item.quantity, 0);
    return `
        <div class="bill-card-info">
            <div class="bill-card-header">
                <div>
                    <span class="bill-id">Bill #${bill.id}</span>
                    <span class="bill-date-time">${bill.date} ${bill.time}</span>
                </div>
                <span class="bill-amount">₹${bill.total.toFixed(2)}</span>
            </div>
            <div class="bill-card-details">
                <p><strong>Items:</strong> ${itemsCount} item(s)</p>
                <button class="btn-view-bill" onclick="viewBillDetails(${bill.id})">View Details</button>
            </div>
        </div>
    `;
}

function viewBillDetails(billId) {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    const detailContent = document.getElementById('billDetailContent');
    if (!detailContent) return;
    
    const itemsList = bill.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    detailContent.innerHTML = `
        <div class="bill-detail-info">
            <p><strong>Bill ID:</strong> #${bill.id}</p>
            <p><strong>Date:</strong> ${bill.date}</p>
            <p><strong>Time:</strong> ${bill.time}</p>
        </div>
        <table class="bill-detail-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsList}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>Grand Total</strong></td>
                    <td><strong>₹${bill.total.toFixed(2)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
    
    if (billDetailModal) {
        billDetailModal.style.display = 'block';
    }
}

function closeBillDetailModal() {
    if (billDetailModal) {
        billDetailModal.style.display = 'none';
    }
}

// Make functions globally available
window.viewBillDetails = viewBillDetails;

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('bills', JSON.stringify(bills));
}

// Notification system
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// Make functions globally available
window.openItemModal = openItemModal;
window.deleteMenuItem = deleteMenuItem;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;

