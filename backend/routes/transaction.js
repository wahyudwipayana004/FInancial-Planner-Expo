const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// CREATE TRANSACTION
router.post("/transactions", auth, (req, res) => {
  const { type, category, amount } = req.body;
  const userId = req.user.id;

  const sql = `
    INSERT INTO transactions (user_id, type, category, amount, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [userId, type, category || null, amount], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to add transaction" });
    }
    res.json({ message: "Transaction added" });
  });
});

// GET EXPENSE SUMMARY (last 30 days)
router.get("/expense-summary", auth, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE type = 'pengeluaran'
      AND user_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY category
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json(err);

    const summary = {
      shopping: 0,
      food: 0,
      bills: 0,
    };

    rows.forEach((row) => {
      if (summary[row.category] !== undefined) {
        summary[row.category] = Number(row.total);
      }
    });

    res.json(summary);
  });
});

module.exports = router;
