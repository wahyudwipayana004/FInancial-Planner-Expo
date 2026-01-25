const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const auth = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// MySQL connection
// =======================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "financial",
});

db.connect((err) => {
  if (err) return console.error("DB error:", err);
  console.log("MySQL connected");
});

// =======================
// TABUNGAN (GOALS)
// =======================

// GET all goals (for all users)
app.get("/tabungan", auth, (req, res) => {
  db.query(
    "SELECT * FROM tabungan WHERE user_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    },
  );
});

// GET single goal
app.get("/tabungan/:id", auth, (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM tabungan WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0)
        return res.status(404).json({ message: "Goal not found" });
      res.json(results[0]);
    },
  );
});

// CREATE goal
app.post("/tabungan", auth, (req, res) => {
  const { title, target } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!title || !target || isNaN(target)) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const sql =
    "INSERT INTO tabungan (user_id, title, target, saved, created_at) VALUES (?, ?, ?, 0, NOW())";
  db.query(sql, [userId, title, Number(target)], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", err });

    // Fetch the newly created goal
    db.query(
      "SELECT * FROM tabungan WHERE id = ? AND user_id = ?",
      [result.insertId, userId],
      (err2, rows) => {
        if (err2)
          return res.status(500).json({ message: "DB fetch error", err2 });

        res.json(rows[0]); // full goal object
      },
    );
  });
});

// ADD MONEY
app.post("/tabungan/:id/deposit", auth, (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Invalid amount" });

  // Update tabungan only if it belongs to the user
  const updateTabungan =
    "UPDATE tabungan SET saved = saved + ? WHERE id = ? AND user_id = ?";
  db.query(updateTabungan, [amount, id, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Tabungan error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Goal not found" });

    // Record expense (internal transfer)
    const insertTransaction =
      "INSERT INTO transactions (user_id, type, category, amount, created_at) VALUES (?, 'pengeluaran', 'tabungan', ?, NOW())";
    db.query(insertTransaction, [req.user.id, amount], (err2) => {
      if (err2) return res.status(500).json({ message: "Transaction error" });
      res.json({ message: "Deposit success" });
    });
  });
});

// DELETE goal
app.delete("/tabungan/:id", auth, (req, res) => {
  const { id } = req.params;
  db.query(
    "DELETE FROM tabungan WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "ID not found" });
      res.json({ message: "Tabungan deleted" });
    },
  );
});

// =======================
// WALLET SUMMARY
// =======================
app.get("/wallet/summary", auth, (req, res) => {
  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'pemasukan' THEN amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'pengeluaran' THEN amount END), 0) AS expense
    FROM transactions
    WHERE user_id = ?
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Wallet error" });
    const income = Number(results[0].income);
    const expense = Number(results[0].expense);
    res.json({ income, expense, balance: income - expense });
  });
});

// EXPENSES BY CATEGORY (wallet chart)
app.get("/wallet/expenses-by-category", auth, (req, res) => {
  const sql = `
    SELECT category, SUM(amount) AS total
    FROM transactions
    WHERE type = 'pengeluaran'
      AND user_id = ?
      AND category IN ('shopping', 'bills', 'food')
    GROUP BY category
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Chart error" });
    res.json(results);
  });
});

// =======================
// TRANSACTIONS
// =======================
app.post("/transactions", auth, (req, res) => {
  const { type, category, amount } = req.body;
  if (!type || !amount || amount <= 0)
    return res.status(400).json({ message: "Invalid transaction data" });

  const sql =
    "INSERT INTO transactions (user_id, type, category, amount, created_at) VALUES (?, ?, ?, ?, NOW())";
  db.query(
    sql,
    [req.user.id, type, category || null, amount],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ id: result.insertId, type, category, amount });
    },
  );
});

// =======================
// TOTAL SAVINGS (for wallet display)
app.get("/savings/total", auth, (req, res) => {
  db.query(
    "SELECT COALESCE(SUM(saved),0) AS totalSavings FROM tabungan WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(results[0]);
    },
  );
});

// =======================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
