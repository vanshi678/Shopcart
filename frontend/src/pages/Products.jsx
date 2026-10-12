import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await getProducts({
                    search,
                    category,
                });

                setProducts(response.data.products);
            } catch (error) {
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, category]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="sk-loading">
                    <div className="sk-spinner" />
                    <span>Loading products…</span>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="products-page">
                    <div className="empty-state">
                        <div className="empty-state-icon">⚠️</div>
                        <h2>Something went wrong</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="products-page">
                <div className="products-header">
                    <h1>ShopKart Products</h1>
                    <p>Discover our curated collection</p>
                </div>

                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                />

                {products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h2>No products found</h2>
                        <p>Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Products;