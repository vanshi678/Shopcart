
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

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
        return <p>Loading your cart...</p>;
    }

    if (error && cartItems.length === 0) {
        return (
            <div>
                <h2>My Cart</h2>
                <p>Unable to load your cart.</p>
                <p>{error}</p>
                <button onClick={refreshCart}>Try Again</button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div>
                <h2>My Cart</h2>
                <p>Your cart is empty 🛒</p>
                <p>Looks like you haven't added anything yet.</p>
                <button onClick={() => navigate("/products")}>
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>My Cart</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {cartItems.map((item) => {
                const product = item.product;

                if (!product) return null;

                return (
                    <div
                        key={product._id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            padding: "16px 0",
                            borderBottom: "1px solid #ddd",
                            flexWrap: "wrap",
                        }}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{
                                width: "120px",
                                height: "100px",
                                objectFit: "cover",
                            }}
                        />

                        <div style={{ flex: 1 }}>
                            <h3>{product.name}</h3>
                            <p>₹{product.price}</p>

                            <div>
                                <button
                                    disabled={item.quantity <= 1}
                                    onClick={() =>
                                        handleQuantityChange(
                                            product._id,
                                            item.quantity - 1
                                        )
                                    }
                                >
                                    −
                                </button>

                                <span style={{ margin: "0 12px" }}>
                                    {item.quantity}
                                </span>

                                <button
                                    disabled={
                                        item.quantity >= product.stock
                                    }
                                    onClick={() =>
                                        handleQuantityChange(
                                            product._id,
                                            item.quantity + 1
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => handleRemove(product._id)}
                                style={{ marginTop: "8px" }}
                            >
                                Remove
                            </button>
                        </div>

                        <strong>
                            ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                        </strong>
                    </div>
                );
            })}

            <div style={{ marginTop: "24px" }}>
                <h2>Order Summary</h2>
                <p>Total items: {totalItems}</p>
                <p>
                    Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                </p>

                <button onClick={() => navigate("/checkout")}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;
