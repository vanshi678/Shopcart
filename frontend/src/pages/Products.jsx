import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

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
    }, [search,category]);

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <SearchBar
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
            />
            <h1>ShopKart Products</h1>

            {products.length === 0 ? (
                <p>No products found</p>
            ) : (
                products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                    />
                ))
            )}
        </div>
    );
};

export default Products;