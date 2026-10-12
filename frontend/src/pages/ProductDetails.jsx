import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMsg, setCartMsg] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response.data.product);
            } catch (error) {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (addingToCart || product.stock < 1) return;
        setAddingToCart(true);
        setCartMsg("");
        const success = await addToCart(product._id);
        setCartMsg(success ? "✓ Added to cart!" : "Could not add to cart.");
        setAddingToCart(false);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="sk-loading">
                    <div className="sk-spinner" />
                    <span>Loading product…</span>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="product-detail-page">
                    <div className="empty-state">
                        <div className="empty-state-icon">⚠️</div>
                        <h2>Product not found</h2>
                        <p>{error}</p>
                        <button className="btn-primary" style={{ maxWidth: 200, margin: "0 auto" }} onClick={() => navigate("/products")}>
                            Back to Products
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const inStock = product.stock > 0;

    return (
        <>
            <Navbar />
            <div className="product-detail-page">
                <div className="product-detail-grid">
                    <img
                        className="product-detail-image"
                        src={product.image}
                        alt={product.name}
                    />

                    <div className="product-detail-info">
                        <p className="product-detail-category">{product.category}</p>
                        <h1 className="product-detail-name">{product.name}</h1>
                        <p className="product-detail-price">
                            ₹{product.price.toLocaleString("en-IN")}
                        </p>

                        <span className={`product-detail-stock product-badge ${inStock ? "badge-instock" : "badge-outofstock"}`}>
                            {inStock ? "✓ In Stock" : "Out of Stock"}
                        </span>

                        <p className="product-detail-desc">{product.description}</p>

                        <div className="product-detail-actions">
                            <button
                                className="btn-primary"
                                onClick={handleAddToCart}
                                disabled={addingToCart || !inStock}
                            >
                                {addingToCart ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
                            </button>

                            {cartMsg && (
                                <p className={`product-feedback ${cartMsg.startsWith("✓") ? "success" : "error"}`}>
                                    {cartMsg}
                                </p>
                            )}

                            <button className="btn-details" onClick={() => navigate("/products")}>
                                ← Back to Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;