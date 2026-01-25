import express from "express";
import db from "../db.js"; // or wherever your db connection lives

const router = express.Router();

/**
 * GET total savings (sum of all tabungan.saved)
 * /savings/total
 */
router.get("/total", (req, res) => {
  const sql = "SELECT COALESCE(SUM(saved), 0) AS totalSavings FROM tabungan";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

export default router;
