const db = require('../db');

async function test() {
  try {
    console.log('Testing dashboard queries...');
    const start = Date.now();
    const [
      [statsRows],
      [recentSales],
      [topCategories],
      [dailySales]
    ] = await Promise.all([
      db.query(`
        SELECT 
          (SELECT IFNULL(SUM(final_total),0) FROM sales WHERE DATE(created_at) = CURDATE()) AS todayRevenue,
          (SELECT COUNT(*) FROM sales WHERE DATE(created_at) = CURDATE()) AS todaySales,
          (SELECT COUNT(*) FROM customers) AS totalCustomers,
          (SELECT COUNT(*) FROM products WHERE stock <= threshold) AS lowStock,
          (SELECT IFNULL(SUM(final_total),0) FROM sales WHERE YEAR(created_at) = YEAR(CURDATE()) AND WEEK(created_at) = WEEK(CURDATE())) AS weekRevenue,
          (SELECT IFNULL(SUM(final_total),0) FROM sales WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())) AS monthRevenue
      `),
      db.query(`
        SELECT s.id, s.final_total AS grand_total, s.payment_method, s.created_at AS sale_date, c.name AS customer_name
        FROM sales s LEFT JOIN customers c ON s.customer_id = c.id
        ORDER BY s.id DESC LIMIT 5
      `),
      db.query(`
        SELECT p.category, SUM(si.quantity) AS total_items_sold, SUM(si.quantity * si.price) AS total_revenue
        FROM sale_items si JOIN products p ON si.product_id = p.id
        GROUP BY p.category ORDER BY total_revenue DESC LIMIT 5
      `),
      db.query(`
        SELECT DATE(created_at) AS date, COUNT(*) AS sales_count, SUM(final_total) AS revenue
        FROM sales WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at) ORDER BY date DESC
      `)
    ]);
    const end = Date.now();
    console.log('Queries finished in', end - start, 'ms');
    console.log('Stats:', statsRows[0]);
    console.log('Recent Sales Count:', recentSales.length);
    console.log('Top Categories Count:', topCategories.length);
    console.log('Daily Sales Count:', dailySales.length);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
