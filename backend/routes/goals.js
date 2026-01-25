const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET ALL GOALS for this user
router.get("/", auth, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT * FROM tabungan WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    },
  );
});

// GET SINGLE GOAL
router.get("/:id", auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query(
    "SELECT * FROM tabungan WHERE id = ? AND user_id = ?",
    [id, userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result[0])
        return res.status(404).json({ message: "Goal not found" });

      const goal = result[0];

      res.json({
        ...goal,
        target: Number(goal.target) || 0,
        saved: Number(goal.saved) || 0,
      });
    },
  );
});

// CREATE GOAL
// CREATE NEW GOAL
router.post("/", auth, (req, res) => {
  const { title, target } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!title || !target) {
    return res.status(400).json({ message: "Title and target required" });
  }

  db.query(
    "INSERT INTO tabungan (user_id, title, target, saved, created_at) VALUES (?, ?, ?, 0, NOW())",
    [userId, title, Number(target)],
    (err, result) => {
      if (err) return res.status(500).json(err);

      // Fetch the row we just inserted
      db.query(
        "SELECT * FROM tabungan WHERE id = ? AND user_id = ?",
        [result.insertId, userId],
        (err2, rows) => {
          if (err2) return res.status(500).json(err2);
          res.json(rows[0]); // return the full goal object
        },
      );
    },
  );
});

// ADD MONEY
router.post("/:id/deposit", auth, (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.user.id;

  // Make sure the goal belongs to the user
  db.query(
    "SELECT * FROM tabungan WHERE id = ? AND user_id = ?",
    [id, userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(403).json({ message: "Not allowed" });

      db.query(
        "UPDATE tabungan SET saved = saved + ? WHERE id = ?",
        [amount, id],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          // Optional: add internal transaction
          db.query(
            "INSERT INTO transactions (user_id, type, category, amount, created_at) VALUES (?, 'pengeluaran', 'tabungan', ?, NOW())",
            [userId, amount],
            (err3) => {
              if (err3) return res.status(500).json(err3);
              res.json({ success: true });
            },
          );
        },
      );
    },
  );
});

// DELETE GOAL
router.delete("/:id", auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query(
    "DELETE FROM tabungan WHERE id = ? AND user_id = ?",
    [id, userId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    },
  );
});

module.exports = router;
