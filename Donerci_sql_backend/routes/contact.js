const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );
    res.json({ id: result.insertId, name, email, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
