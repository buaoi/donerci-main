const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { customer_name, total, items } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (customer_name, total) VALUES (?, ?)",
      [customer_name, total]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)",
        [orderId, item.menu_item_id, item.quantity]
      );
    }

    await connection.commit();
    res.json({ orderId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
