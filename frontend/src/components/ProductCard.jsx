import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
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
        </div>
    );
};

export default ProductCard;