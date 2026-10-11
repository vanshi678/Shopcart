
const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

// All wishlist routes require authentication
router.use(protect);

// GET /wishlist
router.get("/", getWishlist);

// POST /wishlist/:productId
router.post("/:productId", addToWishlist);

// DELETE /wishlist/:productId
router.delete("/:productId", removeFromWishlist);

module.exports = router;
