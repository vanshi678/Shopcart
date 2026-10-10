const Product = require("../models/product.model");

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image) {
            return res.status(400).json({
                success: false,
                message: "Name, description, category and image are required",
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0",
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative",
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock,
        });

        return res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
};
const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;

        const query = {};

        if (search) {
            query.name = {
                $regex: search,
                $options: "i",
            };
        }

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query);

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
};