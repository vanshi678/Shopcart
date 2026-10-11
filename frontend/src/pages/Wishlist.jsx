
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";

const Wishlist = () => {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getWishlist();
            setWishlist(response.data.wishlist);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not load your wishlist."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId) => {
        if (removingId) return;

        setRemovingId(productId);
        setError("");

        try {
            await removeFromWishlist(productId);

            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not remove this product."
            );
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return <p>Loading your wishlist...</p>;
    }

    return (
        <div>
            <h1>My Wishlist ♡</h1>

            {error && (
                <div>
                    <p style={{ color: "red" }}>{error}</p>
                    <button onClick={fetchWishlist}>Retry</button>
                </div>
            )}

            {wishlist.length === 0 && !error ? (
                <div>
                    <h2>Your wishlist is empty</h2>
                    <p>Save products you love and find them here.</p>
                    <button onClick={() => navigate("/products")}>
                        Browse Products
                    </button>
                </div>
            ) : (
                wishlist.map((product) => (
                    <div key={product._id}>
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
                            {product.stock > 0
                                ? "In Stock"
                                : "Out of Stock"}
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/products/${product._id}`)
                            }
                        >
                            View Details
                        </button>

                        <button
                            onClick={() => handleRemove(product._id)}
                            disabled={removingId === product._id}
                        >
                            {removingId === product._id
                                ? "Removing..."
                                : "Remove"}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default Wishlist;
