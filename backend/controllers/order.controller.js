const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentOrder = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate(
      "cart.product"
    );

    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    const shippingAddress = req.body.shippingAddress;

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        message: "Please provide a complete shipping address",
      });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        message: "Pincode must contain exactly 6 digits",
      });
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          message: "A product in your cart no longer exists",
        });
      }

      const quantity = cartItem.quantity;

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        product.stock < quantity
      ) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: `Invalid price for ${product.name}`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
        image: product.image || "",
      });

      totalAmount += price * quantity;
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    if (!Number.isSafeInteger(Math.round(totalAmount * 100)) ||
        totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount",
      });
    }

    const order = await Order.create({
      user: customer._id,
      items,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        message: "Payment order created successfully",
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (paymentError) {
      await Order.findByIdAndDelete(order._id);
      throw paymentError;
    }
  } catch (error) {
    console.error("Create payment order error:", error.message);

    return res.status(500).json({
      message: "Unable to create payment order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment verification details",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "This order has already been paid",
      });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return res.status(400).json({
        message: "This order cannot be paid",
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: "Payment order does not match",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Recheck stock before placing the order.
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    // Reduce stock only after verifying the payment signature.
    for (const item of order.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(409).json({
          message: `Stock changed for ${item.name}. Contact support for payment assistance.`,
        });
      }
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    await Customer.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    return res.status(200).json({
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);

    return res.status(500).json({
      message: "Unable to verify payment",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    console.error("Get order details error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch order details",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};