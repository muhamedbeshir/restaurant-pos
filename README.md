# 🍽️ Restaurant POS - Premium Management System

A modern, full-featured restaurant Point of Sale (POS) system built with Electron, React, TypeScript, and MySQL.

## ✨ Features

- 📊 **Dashboard** - Real-time statistics and overview
- 🛒 **Point of Sale** - Fast and intuitive order taking
- 📋 **Order Management** - Track and manage all orders
- 🍽️ **Menu Management** - Full control over categories and products
- 🪑 **Table Management** - Visual table layout and status tracking
- 💾 **MySQL Database** - Robust, scalable data storage
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux

## 📸 Screenshots

Coming soon...

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/muhamedbeshir/restaurant-pos.git
cd restaurant-pos
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Database

1. Create a MySQL database:
```sql
CREATE DATABASE restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
DB_PORT=3306
```

### Step 4: Build the Application

```bash
npm run build
```

### Step 5: Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## 📦 Building for Distribution

### Windows

```bash
npm run dist -- --win
```

### macOS

```bash
npm run dist -- --mac
```

### Linux

```bash
npm run dist -- --linux
```

The installer files will be generated in the `dist/` directory.

## 🗄️ Database Schema

The system includes the following tables:

- **categories** - Product categories
- **products** - Menu items with pricing, stock, and cost
- **orders** - Order information with status tracking
- **order_items** - Individual items in each order
- **tables** - Restaurant tables with status
- **customers** - Customer information and loyalty
- **payments** - Payment records

Tables are automatically created on first launch.

## 🎯 Usage Guide

### Taking an Order

1. Click on a category to view products
2. Click on products to add them to the cart
3. Select a table number
4. Click "Checkout" to place the order

### Managing Orders

1. Go to the "Orders" section
2. Click on an order to view details
3. Update the order status (pending → preparing → ready → served)
4. View order items and totals

### Managing Menu

1. Go to the "Menu" section
2. Click "+ Add Category" or "+ Add Product"
3. Fill in the details and save
4. Edit or delete items as needed

### Managing Tables

1. Go to the "Tables" section
2. Click on a table to view details
3. Update status (available, occupied, reserved, cleaning)
4. View current orders for each table

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `` |
| `DB_NAME` | Database name | `restaurant_db` |
| `DB_PORT` | MySQL port | `3306` |

### Customization

- **Colors**: Modify `tailwind.config.js`
- **Tax Rate**: Update in `src/database.ts` (currently 10%)
- **Default Data**: Modify initialization in `src/database.ts`

## 🛠️ Development

### Project Structure

```
restaurant-pos/
├── src/
│   ├── components/       # React components
│   │   ├── Sidebar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── POSInterface.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── MenuManagement.tsx
│   │   └── TableManagement.tsx
│   ├── App.tsx           # Main app component
│   ├── index.tsx          # Entry point
│   ├── index.css          # Global styles
│   └── database.ts        # Database manager
├── public/                # Static files
├── main.js                # Electron main process
├── package.json           # Dependencies and scripts
└── webpack.config.js      # Webpack configuration
```

### Adding New Features

1. Create a new component in `src/components/`
2. Add navigation in `src/components/Sidebar.tsx`
3. Render the component in `src/App.tsx`

## 🐛 Troubleshooting

### Database Connection Error

- Ensure MySQL is running
- Check credentials in `.env`
- Verify database exists

### Port Already in Use

- Check if another application is using the port
- Kill the process or change the port in configuration

### Build Errors

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Muhamed Beshir**

- GitHub: [@muhamedbeshir](https://github.com/muhamedbeshir)
- Project: [Restaurant POS](https://github.com/muhamedbeshir/restaurant-pos)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Electron Team - For the amazing framework
- React Team - For the UI library
- MySQL - For the robust database
- Tailwind CSS - For the styling framework

---

Made with ❤️ by Muhamed Beshir
