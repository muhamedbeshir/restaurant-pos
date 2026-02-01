package main

import (
	"context"
	"database/sql"
	"fmt"
	"os/exec"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
)

// App struct
type App struct {
	ctx         context.Context
	db          *sql.DB
	settings    Settings
	currentLang string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when app starts. The context is saved
// so we can call runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.currentLang = "ar"

	// Initialize database
	err := a.initDatabase()
	if err != nil {
		fmt.Println("Database error:", err)
	}

	// Load settings
	a.loadSettings()

	fmt.Println("Restaurant POS Started!")
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Cleanup
	if a.db != nil {
		a.db.Close()
	}
}

// ============================================
// SETTINGS
// ============================================

type Settings struct {
	RestaurantName     string  `json:"restaurant_name"`
	RestaurantNameAr   string  `json:"restaurant_name_ar"`
	Currency           string  `json:"currency"`
	TaxRate           float64 `json:"tax_rate"`
	ServiceChargeRate  float64 `json:"service_charge_rate"`
	Language          string  `json:"language"`
	ThemeColor        string  `json:"theme_color"`
	PrintReceipt      bool    `json:"print_receipt"`
	PrintKitchen      bool    `json:"print_kitchen"`
}

// GetSettings returns current settings
func (a *App) GetSettings() Settings {
	return a.settings
}

// UpdateSettings updates app settings
func (a *App) UpdateSettings(settings Settings) error {
	a.settings = settings
	a.currentLang = settings.Language
	return a.saveSettings()
}

// GetLanguage returns current language
func (a *App) GetLanguage() string {
	return a.currentLang
}

// SetLanguage sets current language
func (a *App) SetLanguage(lang string) {
	a.currentLang = lang
	a.settings.Language = lang
}

// ============================================
// TRANSLATIONS
// ============================================

type Translation map[string]string

func (a *App) GetTranslations(lang string) Translation {
	if lang == "en" {
		return Translation{
			"pos": "Point of Sale",
			"tables": "Tables",
			"kitchen": "Kitchen",
			"orders": "Orders",
			"payments": "Payments",
			"reports": "Reports",
			"inventory": "Inventory",
			"settings": "Settings",
			"cart": "Cart",
			"subtotal": "Subtotal",
			"tax": "Tax",
			"total": "Total",
			"checkout": "Checkout",
			"add": "Add",
			"remove": "Remove",
			"search": "Search",
			"save": "Save",
			"cancel": "Cancel",
			"delete": "Delete",
			"edit": "Edit",
			"print": "Print",
			"receipt": "Receipt",
			"cash": "Cash",
			"card": "Card",
			"payment": "Payment",
			"order": "Order",
			"table": "Table",
			"available": "Available",
			"occupied": "Occupied",
			"reserved": "Reserved",
			"pending": "Pending",
			"preparing": "Preparing",
			"ready": "Ready",
			"completed": "Completed",
			"cancelled": "Cancelled",
			"all": "All",
			"cart_empty": "Cart is empty",
			"order_success": "Order created successfully!",
			"saved": "Saved!",
			"daily_sales": "Daily Sales",
			"total_revenue": "Total Revenue",
			"total_orders": "Total Orders",
			"top_items": "Top Items",
			"low_stock": "Low Stock",
			"new_order": "New Order",
			"order_number": "Order #",
			"print_kitchen": "Print to Kitchen",
			"print_receipt": "Print Receipt",
			"refund": "Refund",
			"discount": "Discount",
			"menu": "Menu",
			"menu_items": "Menu Items",
			"categories": "Categories",
			"add_item": "Add Item",
			"item_name": "Item Name",
			"item_name_ar": "Item Name (Arabic)",
			"price": "Price",
			"cost": "Cost",
			"quantity": "Quantity",
			"status": "Status",
			"date": "Date",
			"time": "Time",
			"customer": "Customer",
			"phone": "Phone",
			"address": "Address",
			"notes": "Notes",
			"kitchen_notes": "Kitchen Notes",
			"payment_method": "Payment Method",
			"paid": "Paid",
			"unpaid": "Unpaid",
			"partial": "Partial",
			"amount": "Amount",
			"change": "Change",
			"tendered": "Tendered",
			"cancel_order": "Cancel Order",
			"complete_order": "Complete Order",
			"mark_ready": "Mark Ready",
			"mark_completed": "Mark Completed",
			"start_preparing": "Start Preparing",
			"cancel_item": "Cancel Item",
		}
	}

	// Arabic (default)
	return Translation{
		"pos": "شبكة البيع",
		"tables": "الطاولات",
		"kitchen": "المطبخ",
		"orders": "الطلبات",
		"payments": "المدفوعات",
		"reports": "التقارير",
		"inventory": "المخزون",
		"settings": "الإعدادات",
		"cart": "السلة",
		"subtotal": "المجموع الفرعي",
		"tax": "الضريبة",
		"total": "الإجمالي",
		"checkout": "دفع",
		"add": "إضافة",
		"remove": "حذف",
		"search": "بحث",
		"save": "حفظ",
		"cancel": "إلغاء",
		"delete": "حذف",
		"edit": "تعديل",
		"print": "طباعة",
		"receipt": "فاتورة",
		"cash": "كاش",
		"card": "بطاقة",
		"payment": "دفع",
		"order": "طلب",
		"table": "طاولة",
		"available": "متاح",
		"occupied": "مشغول",
		"reserved": "محجوز",
		"pending": "قيد الانتظار",
		"preparing": "جاري التحضير",
		"ready": "جاهز",
		"completed": "مكتمل",
		"cancelled": "ملغي",
		"all": "الكل",
		"cart_empty": "السلة فارغة",
		"order_success": "تم إنشاء الطلب بنجاح!",
		"saved": "تم الحفظ!",
		"daily_sales": "المبيعات اليومية",
		"total_revenue": "إجمالي الإيرادات",
		"total_orders": "إجمالي الطلبات",
		"top_items": "أكثر المبيعات",
		"low_stock": "مخزون منخفض",
		"new_order": "طلب جديد",
		"order_number": "طلب رقم",
		"print_kitchen": "طباعة للمطبخ",
		"print_receipt": "طباعة الفاتورة",
		"refund": "استرداد",
		"discount": "خصم",
		"menu": "القائمة",
		"menu_items": "عناصر القائمة",
		"categories": "الأقسام",
		"add_item": "إضافة عنصر",
		"item_name": "اسم العنصر",
		"item_name_ar": "اسم العنصر (عربي)",
		"price": "السعر",
		"cost": "التكلفة",
		"quantity": "الكمية",
		"status": "الحالة",
		"date": "التاريخ",
		"time": "الوقت",
		"customer": "العميل",
		"phone": "الهاتف",
		"address": "العنوان",
		"notes": "ملاحظات",
		"kitchen_notes": "ملاحظات المطبخ",
		"payment_method": "طريقة الدفع",
		"paid": "مدفوع",
		"unpaid": "غير مدفوع",
		"partial": "جزئي",
		"amount": "المبلغ",
		"change": "الباقي",
		"tendered": "المدفوع",
		"cancel_order": "إلغاء الطلب",
		"complete_order": "إكمال الطلب",
		"mark_ready": "تحديد جاهز",
		"mark_completed": "تحديد مكتمل",
		"start_preparing": "بدء التحضير",
		"cancel_item": "إلغاء العنصر",
	}
}

// ============================================
// DATABASE
// ============================================

func (a *App) initDatabase() error {
	// MySQL connection string
	dsn := "root:@tcp(localhost:3306)/restaurant_pos?parseTime=true"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return err
	}

	// Test connection
	err = db.Ping()
	if err != nil {
		// If connection fails, use SQLite instead (for offline mode)
		return a.initSQLite()
	}

	a.db = db
	return nil
}

func (a *App) initSQLite() error {
	// SQLite fallback for offline mode
	dsn := "./restaurant_pos.db"
	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return err
	}

	// Test connection
	err = db.Ping()
	if err != nil {
		return err
	}

	a.db = db

	// Create tables if they don't exist
	err = a.createTables()
	if err != nil {
		return err
	}

	return nil
}

func (a *App) createTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS settings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			key TEXT UNIQUE,
			value TEXT,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			name_ar TEXT NOT NULL,
			display_order INTEGER DEFAULT 0,
			is_active BOOLEAN DEFAULT 1,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS menu_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			name_ar TEXT NOT NULL,
			category_id INTEGER,
			price REAL NOT NULL,
			cost_price REAL,
			is_available BOOLEAN DEFAULT 1,
			image TEXT,
			color TEXT,
			order_count INTEGER DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (category_id) REFERENCES categories(id)
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_number TEXT UNIQUE NOT NULL,
			table_id INTEGER,
			type TEXT DEFAULT 'dine_in',
			status TEXT DEFAULT 'pending',
			subtotal REAL DEFAULT 0,
			tax_amount REAL DEFAULT 0,
			total REAL DEFAULT 0,
			paid_amount REAL DEFAULT 0,
			payment_status TEXT DEFAULT 'unpaid',
			customer_name TEXT,
			customer_phone TEXT,
			customer_address TEXT,
			notes TEXT,
			kitchen_notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			completed_at TIMESTAMP,
			cancelled_at TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS order_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_id INTEGER NOT NULL,
			menu_item_id INTEGER NOT NULL,
			menu_item_name TEXT NOT NULL,
			quantity INTEGER DEFAULT 1,
			unit_price REAL NOT NULL,
			status TEXT DEFAULT 'pending',
			notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS tables (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			number TEXT UNIQUE NOT NULL,
			name TEXT,
			capacity INTEGER DEFAULT 4,
			status TEXT DEFAULT 'available',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS payments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_id INTEGER NOT NULL,
			method TEXT NOT NULL,
			amount REAL NOT NULL,
			cash_tendered REAL,
			change_amount REAL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
		)`,
	}

	for _, query := range queries {
		_, err := a.db.Exec(query)
		if err != nil {
			return err
		}
	}

	return nil
}

// ============================================
// SAVE/LOAD SETTINGS
// ============================================

func (a *App) saveSettings() error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}

	// Save settings to database
	query := `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`

	tx, err := a.db.Begin()
	if err != nil {
		return err
	}

	// Save each setting individually
	_, err = tx.Exec(query, "restaurant_name", a.settings.RestaurantName, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "restaurant_name_ar", a.settings.RestaurantNameAr, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "currency", a.settings.Currency, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "tax_rate", a.settings.TaxRate, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "service_charge_rate", a.settings.ServiceChargeRate, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "language", a.settings.Language, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "theme_color", a.settings.ThemeColor, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "print_receipt", a.settings.PrintReceipt, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(query, "print_kitchen", a.settings.PrintKitchen, time.Now())
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (a *App) loadSettings() {
	if a.db == nil {
		// Default settings
		a.settings = Settings{
			RestaurantName:    "مطعم",
			RestaurantNameAr:  "مطعم",
			Currency:          "ج.م",
			TaxRate:          0.14,
			ServiceChargeRate: 0.10,
			Language:         "ar",
			ThemeColor:       "#10b981",
			PrintReceipt:      true,
			PrintKitchen:      true,
		}
		return
	}

	// Load settings from database
	query := `SELECT key, value FROM settings`
	rows, err := a.db.Query(query)
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var key, value string
		err = rows.Scan(&key, &value)
		if err != nil {
			continue
		}

		switch key {
		case "restaurant_name":
			a.settings.RestaurantName = value
		case "restaurant_name_ar":
			a.settings.RestaurantNameAr = value
		case "currency":
			a.settings.Currency = value
		case "language":
			a.settings.Language = value
			a.currentLang = value
		case "theme_color":
			a.settings.ThemeColor = value
		}
	}

	// Set defaults if not loaded
	if a.settings.RestaurantName == "" {
		a.settings.RestaurantName = "مطعم"
		a.settings.RestaurantNameAr = "مطعم"
		a.settings.Currency = "ج.م"
		a.settings.TaxRate = 0.14
		a.settings.ServiceChargeRate = 0.10
		a.settings.Language = "ar"
		a.currentLang = "ar"
		a.settings.ThemeColor = "#10b981"
		a.settings.PrintReceipt = true
		a.settings.PrintKitchen = true
	}
}

// ============================================
// ORDERS
// ============================================

type Order struct {
	ID              int     `json:"id"`
	OrderNumber     string  `json:"order_number"`
	TableID         *int    `json:"table_id"`
	Type            string  `json:"type"`
	Status          string  `json:"status"`
	Subtotal        float64 `json:"subtotal"`
	TaxAmount       float64 `json:"tax_amount"`
	Total           float64 `json:"total"`
	PaidAmount      float64 `json:"paid_amount"`
	PaymentStatus   string  `json:"payment_status"`
	CustomerName    string  `json:"customer_name"`
	CustomerPhone   string  `json:"customer_phone"`
	CustomerAddress string  `json:"customer_address"`
	Notes           string  `json:"notes"`
	KitchenNotes    string  `json:"kitchen_notes"`
	CreatedAt       string  `json:"created_at"`
	CompletedAt     *string `json:"completed_at"`
	Items           []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID             int     `json:"id"`
	OrderID        int     `json:"order_id"`
	MenuItemID     int     `json:"menu_item_id"`
	MenuItemName   string  `json:"menu_item_name"`
	Quantity       int     `json:"quantity"`
	UnitPrice      float64 `json:"unit_price"`
	Status         string  `json:"status"`
	Notes          string  `json:"notes"`
	CreatedAt      string  `json:"created_at"`
}

// GetOrders returns all orders
func (a *App) GetOrders() ([]Order, error) {
	query := `SELECT id, order_number, table_id, type, status, subtotal, tax_amount,
	             total, paid_amount, payment_status, customer_name, customer_phone,
	             customer_address, notes, kitchen_notes,
	             datetime(created_at, 'localtime') as created_at,
	             completed_at
			  FROM orders ORDER BY created_at DESC LIMIT 50`

	rows, err := a.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		err = rows.Scan(&o.ID, &o.OrderNumber, &o.TableID, &o.Type, &o.Status,
			&o.Subtotal, &o.TaxAmount, &o.Total, &o.PaidAmount,
			&o.PaymentStatus, &o.CustomerName, &o.CustomerPhone,
			&o.CustomerAddress, &o.Notes, &o.KitchenNotes,
			&o.CreatedAt, &o.CompletedAt)
		if err != nil {
			continue
		}
		orders = append(orders, o)
	}

	return orders, nil
}

// CreateOrder creates a new order
func (a *App) CreateOrder(orderData string) (int, error) {
	// This is simplified - in production, parse JSON properly
	orderNumber := fmt.Sprintf("ORD-%d", time.Now().Unix())

	query := `INSERT INTO orders (order_number, status, created_at)
			  VALUES (?, ?, datetime('now', 'localtime'))`

	result, err := a.db.Exec(query, orderNumber, "pending")
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	return int(id), err
}

// UpdateOrderStatus updates order status
func (a *App) UpdateOrderStatus(orderID int, status string) error {
	query := `UPDATE orders SET status = ? WHERE id = ?`
	_, err := a.db.Exec(query, status, orderID)

	// Update completed_at if status is completed
	if status == "completed" {
		query := `UPDATE orders SET completed_at = datetime('now', 'localtime') WHERE id = ?`
		_, err = a.db.Exec(query, orderID)
	}

	return err
}

// ============================================
// PRINTING
// ============================================

type PrintRequest struct {
	Type     string `json:"type"`     // "receipt" or "kitchen"
	OrderID  int    `json:"order_id"`
	Content  string `json:"content"`
	Printer  string `json:"printer"`
}

// PrintReceipt - طباعة فاتورة (عربي وإنجليزي بدون دايلوج)
func (a *App) PrintReceipt(orderNumber string, data string) error {
	// Generate HTML receipt
	receiptHTML := a.generateReceiptHTML(orderNumber, data)

	// Save to temporary file
	tempFile := "/tmp/receipt.html"
	err := a.saveToFile(tempFile, receiptHTML)
	if err != nil {
		return err
	}

	// Print using Windows print command (direct, no dialog)
	// For Linux/Mac, we use lp or lpr
	cmd := exec.Command("lp", "-d", "default", tempFile)
	err = cmd.Run()

	if err != nil {
		// Fallback: Try browser print (will show dialog)
		return fmt.Errorf("print failed: %v", err)
	}

	return nil
}

// PrintToKitchen - طباعة للمطبخ
func (a *App) PrintToKitchen(orderData string) error {
	// Generate kitchen ticket
	kitchenHTML := a.generateKitchenHTML(orderData)

	// Save to temporary file
	tempFile := "/tmp/kitchen.html"
	err := a.saveToFile(tempFile, kitchenHTML)
	if err != nil {
		return err
	}

	// Print to kitchen printer
	cmd := exec.Command("lp", "-d", "kitchen", tempFile)
	err = cmd.Run()

	return err
}

// GenerateReceiptHTML generates HTML receipt
func (a *App) generateReceiptHTML(orderNumber string, data string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html dir="%s">
<head>
    <meta charset="UTF-8">
    <title>%s</title>
    <style>
        body { font-family: 'Cairo', Arial, sans-serif; width: 80mm; margin: 0; padding: 10px; }
        .header { text-align: center; margin-bottom: 10px; }
        .header h1 { font-size: 16px; margin: 5px 0; }
        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .item-name { flex: 1; }
        .item-price { text-align: right; }
        .total { text-align: right; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>%s</h1>
        <p>%s</p>
    </div>
    <div class="line"></div>
    %s
    <div class="line"></div>
    <div class="footer">
        <p>%s</p>
        <p>%s</p>
    </div>
</body>
</html>`,
		map[bool]string{true: "rtl", false: "ltr"}[a.currentLang == "ar"],
		a.translations()["receipt"] || "فاتورة",
		a.settings.RestaurantName,
		orderNumber,
		data,
		a.settings.RestaurantName,
		fmt.Sprintf("Date: %s", time.Now().Format("2006-01-02 15:04")),
		"Thank you!",
	)
}

// GenerateKitchenHTML generates kitchen ticket
func (a *App) generateKitchenHTML(orderData string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <title>Kitchen Order</title>
    <style>
        body { font-family: Arial, sans-serif; width: 80mm; margin: 0; padding: 10px; }
        .header { text-align: center; margin-bottom: 10px; }
        .order-number { font-size: 18px; font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        .item { margin: 10px 0; }
        .item-name { font-weight: bold; font-size: 14px; }
        .item-qty { font-size: 18px; font-weight: bold; }
        .urgent { background: #ff0000; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <p>KITCHEN ORDER</p>
        <p class="order-number">#%s</p>
    </div>
    <div class="line"></div>
    %s
    <div class="line"></div>
</body>
</html>`,
		time.Now().Format("150405"),
		orderData,
	)
}

// Helper: Save to file
func (a *App) saveToFile(filename, content string) error {
	return nil // Simplified - would use os.WriteFile
}

// Helper: Get translations
func (a *App) translations() Translation {
	return a.GetTranslations(a.currentLang)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

func (a *App) GenerateOrderNumber() string {
	return fmt.Sprintf("ORD-%d", time.Now().Unix())
}

func (a *App) GetCurrentTime() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

func (a *App) GetTodayDate() string {
	return time.Now().Format("2006-01-02")
}
