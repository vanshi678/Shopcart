
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import Navbar from "../components/Navbar";

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
        return (
            <>
                <Navbar />
                <div className="sk-loading">
                    <div className="sk-spinner" />
                    <span>Loading your wishlist…</span>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="wishlist-page">
                <div className="page-header">
                    <h1>My Wishlist ♡</h1>
                    <p>Products you&apos;ve saved for later</p>
                </div>

                {error && (
                    <div style={{ maxWidth: 1100, margin: "0 auto 20px" }}>
                        <div className="alert-error">
                            <span>⚠</span> {error}
                            <button
                                style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 700 }}
                                onClick={fetchWishlist}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {wishlist.length === 0 && !error ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💜</div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save products you love and find them here.</p>
                        <button
                            className="btn-primary"
                            style={{ maxWidth: 200, margin: "0 auto" }}
                            onClick={() => navigate("/products")}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map((product) => (
                            <div className="product-card" key={product._id}>
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
                                            className="btn-wishlist"
                                            onClick={() => handleRemove(product._id)}
                                            disabled={removingId === product._id}
                                        >
                                            {removingId === product._id ? "Removing…" : "✕ Remove"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Wishlist;
