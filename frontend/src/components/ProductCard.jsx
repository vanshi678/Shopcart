
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWishlist } from "../services/api";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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

    return (
        <div>
            <img
                src={product.image}
                alt={product.name}
                style={{
                    width: "250px",
                    height: "200px",
                    objectFit: "cover",
                }}
            />

            <h2>{product.name}</h2>

            <p>₹{product.price}</p>

            <p>{product.category}</p>

            <p>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            <button onClick={() => navigate(`/products/${product._id}`)}>
                View Details
            </button>

            <button
                onClick={handleAddToWishlist}
                disabled={saving}
            >
                {saving ? "Saving..." : "♡ Add to Wishlist"}
            </button>

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default ProductCard;
