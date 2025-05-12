const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM menu_items");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, description, price, image_url } = req.body;
  try {
    const [result] = await db.query("INSERT INTO menu_items (name, description, price, image_url) VALUES (?, ?, ?, ?)", [name, description, price, image_url]);
    res.json({ id: result.insertId, name, description, price, image_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
