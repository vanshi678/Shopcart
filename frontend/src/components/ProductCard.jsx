
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    const handleAddToWishlist = async () => {
        if (saving) return;

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await addToWishlist(product._id);
            setMessage(response.data.message || "Added to wishlist!");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not add product to wishlist."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAddToCart = async () => {
        if (addingToCart) return;

        setAddingToCart(true);
        setCartMessage("");
        setCartError("");

        try {
            const success = await addToCart(product._id);

            if (success) {
                setCartMessage("Added to cart!");
            } else {
                setCartError("Could not add product to cart.");
            }
        } catch {
            setCartError("Could not add product to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image-wrap">
                <img
                    src={product.image}
                    alt={product.name}
                />
                <span className={`product-badge ${product.stock > 0 ? "badge-instock" : "badge-outofstock"}`}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
            </div>

            <div className="product-body">
                <p className="product-category">{product.category}</p>
                <h2 className="product-name">{product.name}</h2>
                <p className="product-price">
                    <span>₹</span>{product.price.toLocaleString("en-IN")}
                </p>

                <div className="product-actions">
                    <button
                        className="btn-details"
                        onClick={() => navigate(`/products/${product._id}`)}
                    >
                        View Details
                    </button>

                    <button
                        className="btn-add-cart"
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock < 1}
                    >
                        {addingToCart ? "Adding…" : "Add to Cart"}
                    </button>

                    {cartMessage && (
                        <p className="product-feedback success">{cartMessage}</p>
                    )}
                    {cartError && (
                        <p className="product-feedback error">{cartError}</p>
                    )}

                    <button
                        className="btn-wishlist"
                        onClick={handleAddToWishlist}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "♡ Wishlist"}
                    </button>

                    {message && (
                        <p className="product-feedback success">{message}</p>
                    )}
                    {error && (
                        <p className="product-feedback error">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
