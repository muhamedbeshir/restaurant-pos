import mysql from 'mysql2/promise';

class DatabaseManager {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'restaurant_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    this.initializeTables();
  }

  async initializeTables() {
    const connection = await this.pool.getConnection();

    try {
      // Create database if not exists
      await connection.query(`CREATE DATABASE IF NOT EXISTS restaurant_db`);
      await connection.query(`USE restaurant_db`);

      // Categories table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          color VARCHAR(7) DEFAULT '#2563eb',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Products table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category_id INT,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          image VARCHAR(500),
          sku VARCHAR(50) UNIQUE,
          cost_price DECIMAL(10, 2),
          stock_quantity INT DEFAULT 0,
          min_stock INT DEFAULT 5,
          preparation_time INT DEFAULT 0,
          active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Orders table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          table_number INT NOT NULL,
          customer_name VARCHAR(100),
          customer_phone VARCHAR(20),
          customer_email VARCHAR(100),
          subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
          tax DECIMAL(10, 2) DEFAULT 0,
          discount DECIMAL(10, 2) DEFAULT 0,
          total DECIMAL(10, 2) NOT NULL DEFAULT 0,
          status ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
          payment_method ENUM('cash', 'card', 'mobile', 'credit') DEFAULT 'cash',
          payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Order items table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          cost_price DECIMAL(10, 2),
          subtotal DECIMAL(10, 2) NOT NULL,
          profit DECIMAL(10, 2),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Tables table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tables (
          id INT AUTO_INCREMENT PRIMARY KEY,
          number INT NOT NULL UNIQUE,
          name VARCHAR(50),
          capacity INT NOT NULL DEFAULT 4,
          section VARCHAR(50),
          status ENUM('available', 'occupied', 'reserved', 'cleaning') DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Customers table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) UNIQUE,
          email VARCHAR(100),
          address TEXT,
          birth_date DATE,
          loyalty_points INT DEFAULT 0,
          total_orders INT DEFAULT 0,
          total_spent DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Payments table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          method ENUM('cash', 'card', 'mobile', 'credit') NOT NULL,
          reference VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Insert default categories if empty
      const [catRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
      if ((catRows as any)[0].count === 0) {
        const categories = [
          ['Appetizers', '#ef4444', 'Starters and appetizers'],
          ['Main Course', '#f59e0b', 'Main dishes and entrees'],
          ['Drinks', '#3b82f6', 'Beverages and drinks'],
          ['Desserts', '#ec4899', 'Sweet treats and desserts'],
          ['Sides', '#10b981', 'Side dishes and extras']
        ];

        for (const cat of categories) {
          await connection.query(
            'INSERT INTO categories (name, color, description) VALUES (?, ?, ?)',
            cat
          );
        }
      }

      // Insert default tables if empty
      const [tableRows] = await connection.query('SELECT COUNT(*) as count FROM tables');
      if ((tableRows as any)[0].count === 0) {
        for (let i = 1; i <= 12; i++) {
          const section = i <= 4 ? 'Main Hall' : i <= 8 ? 'VIP' : 'Outdoor';
          await connection.query(
            'INSERT INTO tables (number, name, capacity, section) VALUES (?, ?, ?, ?)',
            [i, `Table ${i}`, i <= 4 ? 2 : i <= 8 ? 4 : 6, section]
          );
        }
      }
    } finally {
      connection.release();
    }
  }

  // Categories
  async getCategories(): Promise<any[]> {
    const [rows] = await this.pool.query('SELECT * FROM categories ORDER BY name');
    return rows as any[];
  }

  async createCategory(name: string, color: string, description?: string): Promise<any> {
    const [result] = await this.pool.query(
      'INSERT INTO categories (name, color, description) VALUES (?, ?, ?)',
      [name, color, description || null]
    );
    return result;
  }

  async updateCategory(id: number, data: any) {
    const fields = [];
    const values = [];

    if (data.name) { fields.push('name = ?'); values.push(data.name); }
    if (data.color) { fields.push('color = ?'); values.push(data.color); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await this.pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result;
  }

  async deleteCategory(id: number): Promise<any> {
    const [result] = await this.pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result;
  }

  // Products
  async getProducts(categoryId?: number): Promise<any[]> {
    if (categoryId) {
      const [rows] = await this.pool.query(
        'SELECT * FROM products WHERE category_id = ? AND active = 1',
        [categoryId]
      );
      return rows as any[];
    }
    const [rows] = await this.pool.query('SELECT * FROM products WHERE active = 1');
    return rows as any[];
  }

  async createProduct(data: any): Promise<any> {
    const [result] = await this.pool.query(
      `INSERT INTO products (category_id, name, description, price, image, sku, cost_price, stock_quantity, min_stock, preparation_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.categoryId,
        data.name,
        data.description || null,
        data.price,
        data.image || null,
        data.sku || null,
        data.costPrice || null,
        data.stockQuantity || 0,
        data.minStock || 5,
        data.preparationTime || 0
      ]
    );
    return result;
  }

  async updateProduct(id: number, data: any): Promise<any | null> {
    const fields = [];
    const values = [];

    if (data.categoryId !== undefined) { fields.push('category_id = ?'); values.push(data.categoryId); }
    if (data.name) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.image !== undefined) { fields.push('image = ?'); values.push(data.image); }
    if (data.sku !== undefined) { fields.push('sku = ?'); values.push(data.sku); }
    if (data.costPrice !== undefined) { fields.push('cost_price = ?'); values.push(data.costPrice); }
    if (data.stockQuantity !== undefined) { fields.push('stock_quantity = ?'); values.push(data.stockQuantity); }
    if (data.minStock !== undefined) { fields.push('min_stock = ?'); values.push(data.minStock); }
    if (data.preparationTime !== undefined) { fields.push('preparation_time = ?'); values.push(data.preparationTime); }

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await this.pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result;
  }

  async deleteProduct(id: number): Promise<any> {
    const [result] = await this.pool.query('UPDATE products SET active = 0 WHERE id = ?', [id]);
    return result;
  }

  // Orders
  async createOrder(data: any): Promise<{ insertId: number }> {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result = await this.pool.query(
      `INSERT INTO orders (order_number, table_number, customer_name, customer_phone, customer_email, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        data.tableNumber,
        data.customerName || null,
        data.customerPhone || null,
        data.customerEmail || null,
        data.notes || null
      ]
    );
    return { insertId: (result[0] as any).insertId };
  }

  async getOrder(orderId: number): Promise<any | null> {
    const [orders] = await this.pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if ((orders as any).length === 0) return null;

    const order = (orders as any)[0];
    const [items] = await this.pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return { ...order, items };
  }

  async getActiveOrders(): Promise<any[]> {
    const [rows] = await this.pool.query(
      'SELECT * FROM orders WHERE status != "completed" AND status != "cancelled" ORDER BY created_at DESC'
    );
    return rows as any[];
  }

  async getAllOrders(limit: number = 50): Promise<any[]> {
    const [rows] = await this.pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows as any[];
  }

  async addOrderItem(orderId: number, productId: number, quantity: number, notes?: string): Promise<any | null> {
    const [products] = await this.pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    const product = (products as any)[0];
    if (!product) return null;

    const subtotal = product.price * quantity;
    const profit = subtotal - (product.cost_price || 0) * quantity;

    const [result] = await this.pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, cost_price, subtotal, profit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, productId, quantity, product.price, product.cost_price || 0, subtotal, profit, notes || null]
    );

    // Update order total
    await this.updateOrderTotal(orderId);

    return result;
  }

  async updateOrderStatus(orderId: number, status: string) {
    await this.pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    // Update table status based on order status
    if (status === 'completed' || status === 'cancelled') {
      await this.pool.query(
        `UPDATE tables t JOIN orders o ON t.number = o.table_number
         SET t.status = 'available'
         WHERE o.id = ?`,
        [orderId]
      );
    }
  }

  async updateOrderTotal(orderId: number) {
    const [rows] = await this.pool.query('SELECT SUM(subtotal) as total FROM order_items WHERE order_id = ?', [orderId]);
    const total = (rows as any)[0].total || 0;

    // Calculate tax (e.g., 10%)
    const tax = total * 0.1;
    const finalTotal = total + tax;

    const [result] = await this.pool.query(
      'UPDATE orders SET subtotal = ?, tax = ?, total = ? WHERE id = ?',
      [total, tax, finalTotal, orderId]
    );

    return result;
  }

  // Tables
  async getTables(): Promise<any[]> {
    const [rows] = await this.pool.query('SELECT * FROM tables ORDER BY number');
    return rows as any[];
  }

  async updateTableStatus(tableId: number, status: string): Promise<void> {
    await this.pool.query(
      'UPDATE tables SET status = ? WHERE id = ?',
      [status, tableId]
    );
  }

  // Customers
  async getCustomers(): Promise<any[]> {
    const [rows] = await this.pool.query('SELECT * FROM customers ORDER BY name');
    return rows as any[];
  }

  async createCustomer(data: any): Promise<any> {
    const [result] = await this.pool.query(
      `INSERT INTO customers (name, phone, email, address, birth_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.name,
        data.phone || null,
        data.email || null,
        data.address || null,
        data.birthDate || null
      ]
    );
    return result;
  }

  // Statistics
  async getStats() {
    const [orders] = await this.pool.query('SELECT * FROM orders WHERE status != "completed" AND status != "cancelled"');
    const [products] = await this.pool.query('SELECT * FROM products WHERE active = 1');
    const [revenue] = await this.pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = "paid"');
    const [customers] = await this.pool.query('SELECT COUNT(*) as count FROM customers');

    return {
      activeOrders: (orders as any).length,
      totalProducts: (products as any).length,
      totalRevenue: (revenue as any)[0].total || 0,
      totalCustomers: (customers as any)[0].count
    };
  }

  async close() {
    await this.pool.end();
  }
}

export default DatabaseManager;
