# Restaurant POS System - Lightweight & Multilingual

## 📋 Project Overview
**Name:** Restaurant POS (Point of Sale)
**Type:** Lightweight, multi-device restaurant management system
**Languages:** 🇪🇬 Arabic (Egypt) + 🇬🇧 English
**Tech:** Vanilla JS, MySQL, Node.js

---

## 🏗️ Architecture (Lightweight Stack)

### Tech Stack - Fast & Compatible

**Backend:**
- Node.js + Express.js (or Hono.js - ultra-light)
- TypeScript
- **MySQL 8.0+** (instead of PostgreSQL)
- Knex.js or sql.js (lightweight query builder)
- Redis (optional - for caching)

**Frontend (No Framework - Vanilla JS):**
- Vanilla JavaScript (ES6+)
- **Alpine.js** (lightweight reactivity ~15KB)
- TailwindCSS (via CDN - no build step)
- Chart.js (for reports)
- HTMX (optional - for dynamic content)
- Socket.io client

**Why This Stack?**
- ✅ Works on ANY device (even low-end)
- ✅ No build tools needed
- ✅ Fast loading
- ✅ Easy to deploy
- ✅ MySQL widely supported
- ✅ Works offline with PWA

---

## 🗄️ Database Schema (MySQL)

```sql
-- ========================================
-- TABLES & SCHEMA
-- ========================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Users & Authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    role ENUM('super_admin', 'manager', 'cashier', 'waiter', 'kitchen', 'bar') DEFAULT 'staff',
    phone VARCHAR(20),
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant Settings
CREATE TABLE restaurant_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'EGP',
    tax_rate DECIMAL(5,4) DEFAULT 0.1400,
    service_charge DECIMAL(5,4) DEFAULT 0.1000,
    is_open BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'ar',
    theme_color VARCHAR(20) DEFAULT '#10b981',
    receipt_header TEXT,
    receipt_footer TEXT,
    settings JSON,  -- Custom settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    icon VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    discount_price DECIMAL(10,2),
    discount_type ENUM('percentage', 'fixed'),
    discount_until DATETIME,
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity INT,
    low_stock_alert INT DEFAULT 10,
    image VARCHAR(500),
    color VARCHAR(20),
    preparation_time INT,  -- minutes
    is_modifier_only BOOLEAN DEFAULT FALSE,
    order_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_is_available (is_available),
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modifiers (Add-ons)
CREATE TABLE modifiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    type ENUM('required', 'optional', 'multiple') DEFAULT 'optional',
    min_select INT DEFAULT 0,
    max_select INT,
    category_id INT,
    menu_item_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modifier Options
CREATE TABLE modifier_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    modifier_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (modifier_id) REFERENCES modifiers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Combo Deals
CREATE TABLE combos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    items JSON NOT NULL,  -- [{"menu_item_id": 1, "quantity": 2}, ...]
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    name_ar VARCHAR(100),
    section VARCHAR(100),
    capacity INT DEFAULT 4,
    qr_code VARCHAR(500),
    status ENUM('available', 'occupied', 'reserved', 'dirty', 'maintenance') DEFAULT 'available',
    current_order_id INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    table_id INT,
    user_id INT NOT NULL,
    type ENUM('dine_in', 'takeaway', 'delivery', 'online') DEFAULT 'dine_in',
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',

    -- Customer
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,

    -- Totals
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining DECIMAL(10,2) DEFAULT 0,

    -- Payment
    payment_status ENUM('unpaid', 'partial', 'paid', 'refunded') DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),

    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,

    -- Notes
    notes TEXT,
    kitchen_notes TEXT,

    -- Voice note (optional feature)
    voice_note_url VARCHAR(500),

    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_table_id (table_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    menu_item_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    modifiers JSON,  -- [{"modifier_id": 1, "name": "Extra Cheese", "price": 5}, ...]
    status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments & Transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('sale', 'refund', 'tip') DEFAULT 'sale',
    method ENUM('cash', 'card', 'mobile_wallet', 'credit', 'split') DEFAULT 'cash',
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(255),
    cash_tendered DECIMAL(10,2),
    change_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory / Stock
CREATE TABLE stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    unit VARCHAR(50),  -- kg, liter, piece
    current_stock DECIMAL(10,2) DEFAULT 0,
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR(255),
    is_low_stock BOOLEAN DEFAULT FALSE,
    last_reorder_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_is_low_stock (is_low_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Movements
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_item_id INT NOT NULL,
    type ENUM('in', 'out', 'adjustment', 'wastage', 'transfer') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    cost_per_unit DECIMAL(10,2),
    reason TEXT,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE CASCADE,
    INDEX idx_stock_item_id (stock_item_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff Shifts
CREATE TABLE shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    orders_count INT DEFAULT 0,
    total_sales DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily Reports
CREATE TABLE daily_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE UNIQUE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    gross_profit DECIMAL(10,2) DEFAULT 0,

    -- Orders by type
    dine_in_orders INT DEFAULT 0,
    takeaway_orders INT DEFAULT 0,
    delivery_orders INT DEFAULT 0,

    -- Payments
    cash_payments DECIMAL(10,2) DEFAULT 0,
    card_payments DECIMAL(10,2) DEFAULT 0,
    wallet_payments DECIMAL(10,2) DEFAULT 0,

    -- By category
    sales_by_category JSON,

    -- Top items
    top_items JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    entity_id INT,
    changes JSON,
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers & Loyalty
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    address TEXT,
    points INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    visits_count INT DEFAULT 0,
    birthday DATE,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservations
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    table_id INT,
    party_size INT NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    status ENUM('pending', 'confirmed', 'seated', 'cancelled', 'no_show') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
    INDEX idx_reservation_time (reservation_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Receipt Templates (Custom)
CREATE TABLE receipt_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    template_html TEXT NOT NULL,
    css_styles TEXT,
    show_logo BOOLEAN DEFAULT TRUE,
    show_qr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discounts & Promotions
CREATE TABLE discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    type ENUM('percentage', 'fixed', 'buy_x_get_y') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    apply_to ENUM('all', 'categories', 'items') DEFAULT 'all',
    apply_to_ids JSON,
    start_date DATETIME,
    end_date DATETIME,
    max_usage INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Printers Configuration
CREATE TABLE printers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('receipt', 'kitchen', 'bar') NOT NULL,
    ip_address VARCHAR(45),
    port INT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    print_categories JSON,  -- Categories to print on this printer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 Features Breakdown (Multilingual & Enhanced)

### 1. **POS Terminal (شبكة البيع)**

**Features:**
- Grid menu display
- Category filtering
- Quick search (supports Arabic & English)
- Favorite items
- Combo deals
- Modifier selection
- Quantity adjustment
- Real-time cart
- Tax calculation (customizable)
- Service charge (customizable)
- Discount application (promo codes)
- Split bill (multiple ways)
- Multiple payment methods
- Receipt printing

**Language Support:**
- Full Arabic (Egypt) UI
- Full English UI
- RTL/LTR switch
- Search in both languages

---

### 2. **Table Management (إدارة الطاولات)**

**Features:**
- Visual table layout
- Drag-and-drop seating
- Table status (available, occupied, reserved, etc.)
- Merge tables
- Split tables
- Transfer tables
- QR code generation for self-ordering
- Table notes
- Table history

**Language Support:**
- Table names in Arabic & English
- Section names in both languages

---

### 3. **Kitchen Display System (KDS - شاشة المطبخ)**

**Features:**
- Real-time order updates via WebSocket
- Order priority sorting
- Item status tracking
- Timer per item (elapsed time)
- Audio alerts
- Bulk actions
- Color coding by priority
- Kitchen notes

**Language Support:**
- Order items in kitchen language
- Modifiers in kitchen language

---

### 4. **Cashier Dashboard (لوحة الكاشير)**

**Features:**
- Quick checkout
- Cash drawer management
- Shift tracking
- Performance metrics
- Quick shortcuts (keyboard shortcuts)
- Order search by number
- Refund handling

---

### 5. **Reports & Analytics (التقارير)**

**Features:**
- Daily sales report
- Weekly/Monthly report
- Top selling items
- Least selling items
- Revenue by category
- Revenue by payment method
- Revenue by staff
- Peak hours analysis
- Low stock alerts
- Profit margins
- Export to PDF/Excel

**Language Support:**
- Reports in Arabic & English
- Currency formatting

---

### 6. **Inventory Management (إدارة المخزون)**

**Features:**
- Stock tracking
- Low stock alerts
- Reorder suggestions
- Waste tracking
- Supplier management
- Stock adjustments
- Movement history

**Language Support:**
- Items in both languages
- Units in Arabic/English

---

### 7. **Staff Management (إدارة الموظفين)**

**Features:**
- Role-based access
- Shift scheduling
- Performance tracking
- Commission calculation
- Attendance tracking

---

### 8. **Customers & Loyalty (العملاء والولاء)**

**Features:**
- Customer database
- Loyalty points system
- Visits tracking
- Birthday offers
- Customer preferences
- SMS notifications

---

### 9. **Reservations (الحجوزات)**

**Features:**
- Reservation calendar
- Table assignment
- Party size tracking
- Reservation status
- Customer notifications
- No-show tracking

---

### 10. **Discounts & Promotions (الخصومات والعروض)**

**Features:**
- Percentage discounts
- Fixed amount discounts
- Buy X Get Y
- Promo codes
- Time-based promotions
- Category-specific discounts
- Minimum order requirements

---

### 11. **Settings Page (الإعدادات)** ⭐ Enhanced

**Features:**
- Restaurant info (name, logo, address)
- Tax rate customization
- Service charge customization
- Currency selection
- Language selection (Ar/En)
- Theme color customization
- Receipt customization
- Printer configuration
- Payment methods configuration
- Working hours
- Auto-print settings
- Sound settings
- Notification settings
- Backup & restore
- Data export

**Language Support:**
- Full settings in both languages

---

### 12. **Voice Notes for Orders (ملاحظات صوتية)** ⭐ Extra Feature

**Features:**
- Record voice notes for orders
- Attach to specific orders
- Kitchen can listen
- Storage management

---

### 13. **Quick Shortcuts (اختصارات سريعة)** ⭐ Extra Feature

**Features:**
- Keyboard shortcuts for common actions
- F1-F12 customizable shortcuts
- Numpad shortcuts
- Quick item shortcuts

---

### 14. **Offline Support (دعم العمل بدون إنترنت)** ⭐ Extra Feature

**Features:**
- PWA (Progressive Web App)
- Offline mode
- Sync when online
- Local cache

---

### 15. **Multiple Receipt Templates (قوالب فواتير متعددة)** ⭐ Extra Feature

**Features:**
- Create custom receipt templates
- HTML/CSS templates
- Different printers (kitchen, receipt)
- Print QR codes on receipts

---

## 📁 Project Structure

```
restaurant-pos/
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection
│   │   ├── redis.js             # Redis (optional)
│   │   └── websocket.js         # Socket.io
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── menu.controller.js
│   │   ├── orders.controller.js
│   │   ├── tables.controller.js
│   │   ├── payments.controller.js
│   │   ├── reports.controller.js
│   │   ├── inventory.controller.js
│   │   ├── staff.controller.js
│   │   ├── customers.controller.js
│   │   ├── reservations.controller.js
│   │   ├── discounts.controller.js
│   │   ├── settings.controller.js
│   │   └── printers.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   └── index.js            # Database models
│   ├── routes/
│   │   └── index.js
│   ├── services/
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   ├── inventory.service.js
│   │   └── report.service.js
│   ├── utils/
│   │   ├── translations.js     # Arabic/English
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── websocket/
│   │   └── handlers.js
│   ├── public/                   # Frontend files
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   ├── pos.js
│   │   │   ├── tables.js
│   │   │   ├── kitchen.js
│   │   │   ├── orders.js
│   │   │   ├── payments.js
│   │   │   ├── reports.js
│   │   │   ├── inventory.js
│   │   │   ├── staff.js
│   │   │   ├── customers.js
│   │   │   ├── reservations.js
│   │   │   ├── discounts.js
│   │   │   ├── settings.js
│   │   │   └── translations.js
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   └── images/
│   │   └── sounds/
│   │       └── alert.mp3
│   ├── sql/
│   │   └── schema.sql
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🌐 Translations Structure

```javascript
// utils/translations.js
const translations = {
    ar: {
        // General
        welcome: 'مرحباً',
        dashboard: 'لوحة التحكم',
        settings: 'الإعدادات',
        logout: 'تسجيل خروج',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        search: 'بحث',

        // POS
        pos: 'شبكة البيع',
        cart: 'السلة',
        total: 'الإجمالي',
        subtotal: 'المجموع الفرعي',
        tax: 'الضريبة',
        service_charge: 'رسوم الخدمة',
        discount: 'خصم',
        payment: 'دفع',
        cash: 'كاش',
        card: 'بطاقة',
        receipt: 'فاتورة',
        print: 'طباعة',

        // Tables
        tables: 'الطاولات',
        available: 'متاح',
        occupied: 'مشغول',
        reserved: 'محجوز',
        dirty: 'غير نظيف',
        table: 'طاولة',
        section: 'قسم',

        // Orders
        orders: 'الطلبات',
        order: 'طلب',
        pending: 'قيد الانتظار',
        preparing: 'جاري التحضير',
        ready: 'جاهز',
        served: 'مقدم',
        completed: 'مكتمل',
        cancelled: 'ملغي',

        // Kitchen
        kitchen: 'المطبخ',
        kds: 'شاشة المطبخ',
        priority: 'الأولوية',
        high: 'عالي',
        urgent: 'طاريء',

        // Reports
        reports: 'التقارير',
        sales: 'المبيعات',
        revenue: 'الإيرادات',
        profit: 'الربح',
        top_items: 'أكثر المبيعات',
        low_stock: 'مخزون منخفض',

        // Inventory
        inventory: 'المخزون',
        stock: 'المخزون',
        in_stock: 'متوفر',
        out_of_stock: 'غير متوفر',
        movement: 'حركة',
        wastage: 'هدر',

        // Customers
        customers: 'العملاء',
        customer: 'عميل',
        loyalty: 'الولاء',
        points: 'نقاط',
        visits: 'زيارات',

        // Reservations
        reservations: 'الحجوزات',
        reservation: 'حجز',
        party_size: 'عدد الأشخاص',
        time: 'الوقت',
        date: 'التاريخ',

        // Discounts
        discounts: 'الخصومات',
        promo_code: 'رمز الخصم',
        promotion: 'عرض',

        // Settings
        restaurant_info: 'معلومات المطعم',
        tax_rate: 'نسبة الضريبة',
        service_charge_rate: 'نسبة رسوم الخدمة',
        currency: 'العملة',
        language: 'اللغة',
        theme_color: 'لون الثيم',
        printer: 'الطابعة',
        receipt_template: 'قالب الفاتورة',
        working_hours: 'ساعات العمل',
        notifications: 'الإشعارات',
        sound: 'الصوت',
        backup: 'النسخ الاحتياطي',
        export: 'تصدير',
    },
    en: {
        // General
        welcome: 'Welcome',
        dashboard: 'Dashboard',
        settings: 'Settings',
        logout: 'Logout',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',

        // POS
        pos: 'Point of Sale',
        cart: 'Cart',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax',
        service_charge: 'Service Charge',
        discount: 'Discount',
        payment: 'Payment',
        cash: 'Cash',
        card: 'Card',
        receipt: 'Receipt',
        print: 'Print',

        // Tables
        tables: 'Tables',
        available: 'Available',
        occupied: 'Occupied',
        reserved: 'Reserved',
        dirty: 'Dirty',
        table: 'Table',
        section: 'Section',

        // Orders
        orders: 'Orders',
        order: 'Order',
        pending: 'Pending',
        preparing: 'Preparing',
        ready: 'Ready',
        served: 'Served',
        completed: 'Completed',
        cancelled: 'Cancelled',

        // Kitchen
        kitchen: 'Kitchen',
        kds: 'Kitchen Display System',
        priority: 'Priority',
        high: 'High',
        urgent: 'Urgent',

        // Reports
        reports: 'Reports',
        sales: 'Sales',
        revenue: 'Revenue',
        profit: 'Profit',
        top_items: 'Top Items',
        low_stock: 'Low Stock',

        // Inventory
        inventory: 'Inventory',
        stock: 'Stock',
        in_stock: 'In Stock',
        out_of_stock: 'Out of Stock',
        movement: 'Movement',
        wastage: 'Wastage',

        // Customers
        customers: 'Customers',
        customer: 'Customer',
        loyalty: 'Loyalty',
        points: 'Points',
        visits: 'Visits',

        // Reservations
        reservations: 'Reservations',
        reservation: 'Reservation',
        party_size: 'Party Size',
        time: 'Time',
        date: 'Date',

        // Discounts
        discounts: 'Discounts',
        promo_code: 'Promo Code',
        promotion: 'Promotion',

        // Settings
        restaurant_info: 'Restaurant Info',
        tax_rate: 'Tax Rate',
        service_charge_rate: 'Service Charge Rate',
        currency: 'Currency',
        language: 'Language',
        theme_color: 'Theme Color',
        printer: 'Printer',
        receipt_template: 'Receipt Template',
        working_hours: 'Working Hours',
        notifications: 'Notifications',
        sound: 'Sound',
        backup: 'Backup',
        export: 'Export',
    }
};

// Helper function
function t(key, lang = 'ar') {
    return translations[lang][key] || key;
}
```

---

## 🎨 UI/UX - Multilingual Support

**RTL/LTR Handling:**
- Automatic direction based on language
- Mirrored layouts
- Arabic fonts (Cairo, Tajawal)
- English fonts (Inter, Roboto)

**Color Themes:**
- Customizable theme color
- Light/Dark mode
- High contrast option

---

## 📱 PWA Features (Works Offline)

**Service Worker:**
- Cache static assets
- Offline page
- Background sync

**Manifest:**
- Installable on mobile
- App icon
- Display modes

---

## 🔌 API Endpoints

```
Authentication
- POST   /api/auth/register
- POST   /api/auth/login
- POST   /api/auth/logout
- GET    /api/auth/me

Menu
- GET    /api/menu/categories
- GET    /api/menu/items
- POST   /api/menu/categories
- PUT    /api/menu/categories/:id
- DELETE /api/menu/categories/:id
- POST   /api/menu/items
- PUT    /api/menu/items/:id
- DELETE /api/menu/items/:id

Orders
- GET    /api/orders
- POST   /api/orders
- PUT    /api/orders/:id
- DELETE /api/orders/:id
- POST   /api/orders/:id/status

Tables
- GET    /api/tables
- PUT    /api/tables/:id/status
- PUT    /api/tables/:id/transfer

Payments
- POST   /api/payments
- POST   /api/payments/refund

Reports
- GET    /api/reports/daily
- GET    /api/reports/weekly
- GET    /api/reports/monthly

Inventory
- GET    /api/inventory
- POST   /api/inventory/movement

Customers
- GET    /api/customers
- POST   /api/customers
- POST   /api/customers/:id/points

Reservations
- GET    /api/reservations
- POST   /api/reservations
- PUT    /api/reservations/:id/status

Discounts
- GET    /api/discounts
- POST   /api/discounts
- PUT    /api/discounts/:id

Settings
- GET    /api/settings
- PUT    /api/settings
- GET    /api/settings/receipt-templates
- POST   /api/settings/receipt-templates

Printers
- GET    /api/printers
- POST   /api/printers
- POST   /api/printers/:id/test

Language
- GET    /api/language
- PUT    /api/language
```

---

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS prevention
- CORS configuration
- Audit logging

---

## 🎯 Implementation Phases

### Phase 1: Core (MVP) - 2-3 weeks
- Authentication & authorization
- Basic menu management
- Order creation & management
- Basic payments
- Simple reports
- **Arabic + English UI**

### Phase 2: Enhanced - 2-3 weeks
- Table management
- Kitchen display
- Modifiers & combos
- Advanced reports
- Inventory basics
- **Settings page**

### Phase 3: Advanced - 2-3 weeks
- Inventory full features
- Staff management
- Reservations
- Discounts & promotions
- **Multiple receipt templates**

### Phase 4: Extra Features - 2 weeks
- Voice notes for orders
- Quick shortcuts
- Offline support (PWA)
- Customer loyalty
- **Printers configuration**

---

## 📊 Database Size Estimate

- ~18 tables
- ~15 indexes
- Estimated storage: ~500 MB - 2 GB/year for medium restaurant

---

## ⚡ Performance

- No build step (fast loading)
- CDN for assets
- Redis caching
- Database indexing
- Lazy loading

---

**Next Steps:** Ready to build! 🚀 Tell me which page to start with or if you want any changes.
