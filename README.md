# Restaurant POS - نظام مطعم

## 🎯 Overview

Modern Restaurant POS System built with **Wails v2** (Go + WebView)
- ✅ Single Binary (EXE) - No installation needed
- ✅ 100% Offline
- ✅ Arabic + English Support (RTL/LTR)
- ✅ Modern UI with Minimal Animations
- ✅ SQLite Embedded Database
- ✅ Printer Support (Arabic & English, No Dialog)

---

## 📦 Features

### Core Features
- 🍽️ **POS Terminal** - Fast order taking with grid layout
- 🪑 **Tables Management** - Visual table status
- ⚙️ **Settings** - Customizable theme, language, tax
- 💳 **Payments** - Multiple payment methods
- 📊 **Reports** - Sales analytics (coming)

### UI Features
- 🎨 **Modern Design** - Clean, modern interface
- 🌐 **Bilingual** - Arabic (Egypt) + English
- 🌓 **RTL/LTR** - Automatic direction switching
- 🎯 **Theme Colors** - Customizable
- ⚡ **Fast** - Lightweight and responsive

### Tech Features
- 💾 **SQLite** - Embedded database (no external DB needed)
- 🖨️ **Printing** - Arabic & English support, direct printing (no dialog)
- 🚀 **Single Binary** - Copy and run anywhere
- 📱 **Desktop App** - Native Windows/Linux/Mac application

---

## 🚀 Getting Started

### Windows
```batch
# Just run the EXE
restaurant-pos.exe
```

### Linux
```bash
# Make executable
chmod +x restaurant-pos

# Run
./restaurant-pos
```

### Mac
```bash
# Run
./restaurant-pos
```

---

## 📂 Project Structure

```
restaurant-pos/
├── main.go                  # Wails entry point
├── app.go                   # App logic & database
├── go.mod                   # Go dependencies
├── go.sum
├── wails.json              # Wails config
├── frontend/
│   └── dist/
│       ├── index.html       # Main UI
│       └── js/
│           └── app.js       # Frontend logic
└── restaurant-pos          # Compiled binary
```

---

## 🎨 UI Pages

### 1. POS (Point of Sale)
- Category filtering
- Item grid with visual cards
- Real-time cart
- Subtotal, tax, total calculation
- Quick checkout

### 2. Tables
- Visual table layout
- Table status (available, occupied, reserved)
- Capacity display

### 3. Settings
- Restaurant name
- Currency
- Tax rate
- Theme color
- Language (Arabic/English)
- Print settings

---

## 🌐 Languages

### Arabic (Egypt) - RTL
- Full UI in Arabic
- RTL layout
- Cairo font

### English - LTR
- Full UI in English
- LTR layout
- Inter font

---

## 💾 Database

- **Type:** SQLite (Embedded)
- **Location:** `./restaurant_pos.db` (created on first run)
- **Tables:**
  - settings
  - categories
  - menu_items
  - orders
  - order_items
  - tables

---

## 🖨️ Printing

### Features
- ✅ Arabic text support
- ✅ English text support
- ✅ Direct printing (no dialog)
- ✅ Custom receipt templates
- ✅ Thermal printer support

### Coming Soon
- Kitchen printing
- Bar printing
- Multiple printers

---

## 📊 Technical Details

### Backend
- **Language:** Go 1.22
- **Framework:** Wails v2.11
- **Database:** SQLite (with MySQL fallback)
- **Size:** ~10 MB binary

### Frontend
- **Language:** Vanilla JavaScript (ES6+)
- **CSS:** Custom CSS (no framework)
- **Font:** Cairo (Arabic), Inter (English)
- **Size:** Embedded in binary

---

## 🔧 Configuration

Settings are stored in the database and configurable through the Settings page:

- **Restaurant Name:** Displayed in UI and receipts
- **Currency:** Default: ج.م (EGP)
- **Tax Rate:** Default: 14%
- **Theme Color:** Default: #10b981 (Green)
- **Language:** ar / en
- **Print Receipt:** On/Off
- **Print Kitchen:** On/Off

---

## 📝 Usage

### Taking Orders
1. Select category (or "All")
2. Click items to add to cart
3. Adjust quantities with +/- buttons
4. Click "Checkout" to complete

### Managing Tables
1. Navigate to "Tables"
2. View table status
3. Click to select table

### Changing Settings
1. Navigate to "Settings"
2. Modify desired settings
3. Click "Save"
4. Theme applies immediately

### Switching Language
1. Go to Settings
2. Select Language (Arabic/English)
3. Click Save
4. UI updates immediately

---

## 🎯 Build Instructions

### Prerequisites
- Go 1.22+
- GCC (for CGO - SQLite)
- Wails CLI

### Build
```bash
# Install Wails
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Build
cd restaurant-pos
export CGO_ENABLED=1
go build

# Or using Wails
wails build
```

### Output
- **Linux:** `restaurant-pos`
- **Windows:** `restaurant-pos.exe`
- **Mac:** `restaurant-pos.app`

---

## 🔮 Roadmap (Coming Soon)

### Phase 2 (Enhanced)
- Kitchen Display System (KDS)
- Order management
- Payment processing
- Detailed reports

### Phase 3 (Advanced)
- Inventory management
- Staff management
- Customer database
- Reservations
- Discounts & promotions

### Phase 4 (Enterprise)
- Multi-location support
- Cloud sync
- Advanced integrations
- Mobile companion app

---

## 📄 License

Copyright 2024 - Restaurant POS

---

## 👨‍💻 Development

Built with ❤️ by Mohamed

---

**Ready to use! Just run the binary and start selling! 🚀**
