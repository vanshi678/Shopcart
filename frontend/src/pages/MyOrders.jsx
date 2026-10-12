import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/api";
import Navbar from "../components/Navbar";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        const response = await getMyOrders();

        if (active) {
          setOrders(response.data.orders || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your orders."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="sk-loading">
          <div className="sk-spinner" />
          <span>Loading your orders…</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="orders-page">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h2>Unable to load orders</h2>
            <p>{error}</p>
            <Link to="/products" style={{ marginTop: 4, color: "var(--accent-light)", fontWeight: 700 }}>
              Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="orders-page">
        <div className="orders-inner">
          <div className="orders-header">
            <div>
              <h1>My Orders</h1>
              <p>View your purchases and payment status.</p>
            </div>

            <Link to="/products" className="link-details">
              Continue Shopping →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Your placed orders will appear here.</p>
              <Link
                to="/products"
                className="btn-primary"
                style={{ maxWidth: 200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order._id}>
                  <div className="order-card-head">
                    <div>
                      <p className="order-id-label">Order ID</p>
                      <p className="order-id-value">{order._id}</p>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="order-badges">
                      <span className="badge badge-status">{order.status}</span>
                      <span className={`badge ${order.paymentStatus === "PAID" ? "badge-paid" : "badge-pending"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-body">
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

                  <div className="order-card-foot">
                    <p className="order-total">
                      Total: ₹{Number(order.totalAmount).toFixed(2)}
                    </p>

                    <Link
                      to={`/order-success/${order._id}`}
                      className="link-details"
                    >
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyOrders;