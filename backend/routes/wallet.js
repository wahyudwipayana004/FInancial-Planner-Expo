const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET wallet summary for logged-in user
router.get("/summary", auth, (req, res) => {
  const userId = req.user.id;

  const incomeSql = `
    SELECT COALESCE(SUM(amount), 0) AS income
    FROM transactions
    WHERE type = 'pemasukan' AND user_id = ?
  `;

  const expenseSql = `
    SELECT COALESCE(SUM(amount), 0) AS expense
    FROM transactions
    WHERE type = 'pengeluaran' AND user_id = ?
  `;

  db.query(incomeSql, [userId], (err, incomeResult) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(expenseSql, [userId], (err, expenseResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const income = Number(incomeResult[0].income) || 0;
      const expense = Number(expenseResult[0].expense) || 0;
      const balance = income - expense;

      res.json({
        income,
        expense,
        balance,
      });
    });
  });
});

// POST new transaction (income or expense)
router.post("/transactions", auth, (req, res) => {
  const userId = req.user.id;
  const { type, category, amount } = req.body;

  if (!type || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid transaction" });
  }

  const sql = `
    INSERT INTO transactions (user_id, type, category, amount, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [userId, type, category || null, amount], (err) => {
    if (err) {
      console.error("Failed to add transaction:", err);
      return res.status(500).json({ message: "Failed to add transaction" });
    }

    res.json({ message: "Transaction added" });
  });
});

// GET expense summary (last 30 days) per category
router.get("/expenses-by-category", auth, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT category, SUM(amount) AS total
    FROM transactions
    WHERE type = 'pengeluaran'
      AND user_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY category
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

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
