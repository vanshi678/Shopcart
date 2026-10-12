import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../services/api";
import Navbar from "../components/Navbar";

function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        const response = await getOrderById(id);

        if (active) {
          setOrder(response.data.order);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="sk-loading">
          <div className="sk-spinner" />
          <span>Loading order details…</span>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon">⚠️</div>
          <h2>Unable to load order</h2>
          <p>{error || "Order not found."}</p>
          <Link to="/orders" style={{ color: "var(--accent-light)", fontWeight: 700 }}>
            View My Orders
          </Link>
        </div>
      </>
    );
  }

  const paid = order.paymentStatus === "PAID";

  return (
    <>
      <Navbar />
      <div className="order-success-page">
        <div className="order-success-card">
          {/* Top hero */}
          <div className="order-success-top">
            <div className={`success-icon ${paid ? "paid" : "pending"}`}>
              {paid ? "✓" : "!"}
            </div>

            <h1>{paid ? "Order Placed!" : "Payment Pending"}</h1>

            <p>
              {paid
                ? "Thank you for shopping with ShopKart."
                : "We could not confirm your payment yet. Check your order status before trying again."}
            </p>
          </div>

          {/* Order meta */}
          <div className="order-meta-section">
            <h2>Order Info</h2>

            <div className="meta-row">
              <span>Order ID</span>
              <span>{order._id}</span>
            </div>
            <div className="meta-row">
              <span>Payment</span>
              <span style={{ color: paid ? "var(--success)" : "var(--warning)" }}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="meta-row">
              <span>Order Status</span>
              <span>{order.status}</span>
            </div>
            <div className="meta-row bold">
              <span>Total</span>
              <span>₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="order-items-section">
            <h2>Items Ordered</h2>

            {order.items.map((item, index) => (
              <div
                key={item._id || `${item.product}-${index}`}
                className="order-item-row"
              >
                <div>
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-qty">Qty: {item.quantity}</p>
                </div>
                <p className="order-item-price">
                  ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="order-address-section">
            <h2>Delivery Address</h2>
            <p className="order-address-text">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.addressLine1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Actions */}
          <div className="order-success-actions">
            <Link to="/orders" className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 14 }}>
              View My Orders
            </Link>

            <Link to="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderSuccess;