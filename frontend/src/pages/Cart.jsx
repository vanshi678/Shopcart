
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Cart = () => {
    const {
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        refreshCart,
        updateQuantity,
        removeFromCart,
    } = useCart();

    const navigate = useNavigate();

    const handleQuantityChange = async (productId, quantity) => {
        await updateQuantity(productId, quantity);
    };

    const handleRemove = async (productId) => {
        await removeFromCart(productId);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="sk-loading">
                    <div className="sk-spinner" />
                    <span>Loading your cart…</span>
                </div>
            </>
        );
    }

    if (error && cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page">
                    <div className="empty-state">
                        <div className="empty-state-icon">⚠️</div>
                        <h2>Unable to load cart</h2>
                        <p>{error}</p>
                        <button className="btn-primary" style={{ maxWidth: 180, margin: "0 auto" }} onClick={refreshCart}>
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="cart-page">
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven&apos;t added anything yet.</p>
                        <button
                            className="btn-primary"
                            style={{ maxWidth: 200, margin: "0 auto" }}
                            onClick={() => navigate("/products")}
                        >
                            Browse Products
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="cart-page">
                {error && (
                    <p className="product-feedback error" style={{ marginBottom: 16 }}>{error}</p>
                )}

                <div className="cart-grid">
                    <div className="cart-items-section">
                        <div className="cart-section-header">
                            My Cart &nbsp;·&nbsp; <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                        </div>

                        {cartItems.map((item) => {
                            const product = item.product;
                            if (!product) return null;

                            return (
                                <div className="cart-item" key={product._id}>
                                    <img
                                        className="cart-item-img"
                                        src={product.image}
                                        alt={product.name}
                                    />

                                    <div className="cart-item-info">
                                        <p className="cart-item-name">{product.name}</p>
                                        <p className="cart-item-price">₹{product.price.toLocaleString("en-IN")} each</p>

                                        <div className="cart-qty-row">
                                            <button
                                                className="qty-btn"
                                                disabled={item.quantity <= 1}
                                                onClick={() =>
                                                    handleQuantityChange(product._id, item.quantity - 1)
                                                }
                                            >
                                                −
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                disabled={item.quantity >= product.stock}
                                                onClick={() =>
                                                    handleQuantityChange(product._id, item.quantity + 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            className="btn-remove"
                                            onClick={() => handleRemove(product._id)}
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <p className="cart-item-total">
                                        ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <aside className="summary-card">
                        <h2 className="summary-title">Order Summary</h2>

                        <div className="summary-row">
                            <span>Items ({totalItems})</span>
                            <span>₹{subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span style={{ color: "var(--success)" }}>Free</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{subtotal.toLocaleString("en-IN")}</span>
                        </div>

                        <button className="btn-checkout" onClick={() => navigate("/checkout")}>
                            Proceed to Checkout →
                        </button>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default Cart;
