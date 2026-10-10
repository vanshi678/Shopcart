import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/api";

const ProductDetails = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return <p>Loading product...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <img
                src={product.image}
                alt={product.name}
            />
            <h1>{product.name}</h1>
            <p>₹{product.price}</p>
            <p>{product.category}</p>
            <p>{product.description}</p>
            <p>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            <button>Add to Cart</button>
        </div>
    );
};

export default ProductDetails;