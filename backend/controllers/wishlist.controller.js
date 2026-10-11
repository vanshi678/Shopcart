
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Add a product to the logged-in customer's wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check whether the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the logged-in customer
    const customer = await Customer.findById(req.user._id);

    // Prevent duplicate wishlist entries
    if (customer.wishlist.some((id) => id.equals(product._id))) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    customer.wishlist.push(product._id);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// Get the logged-in customer's wishlist
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .populate("wishlist");

    return res.status(200).json({
      success: true,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// Remove a product from the logged-in customer's wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user._id);

    // Check whether the product is in the wishlist
    const exists = customer.wishlist.some((id) =>
      id.equals(productId)
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    customer.wishlist = customer.wishlist.filter(
      (id) => !id.equals(productId)
    );

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
