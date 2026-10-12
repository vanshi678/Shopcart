import { useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      navigate("/login");
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate("/home")}>
        <div className="navbar-logo">S</div>
        <div>
          <div className="navbar-brand">ShopKart</div>
          <div className="navbar-subtitle">Simple. Smart. Shopping.</div>
        </div>
      </div>

      <div className="navbar-right">
        <button onClick={() => navigate("/home")} className="nav-btn">
          My Account
        </button>

        <button onClick={() => navigate("/products")} className="nav-btn">
          Products
        </button>

        <button onClick={() => navigate("/wishlist")} className="nav-btn">
          ♡ Wishlist
        </button>

        <button onClick={() => navigate("/cart")} className="nav-btn cart-btn">
          🛒
          <span className="cart-badge">{totalItems}</span>
        </button>

        <button onClick={() => navigate("/orders")} className="nav-btn">
          Orders
        </button>

        <button onClick={handleLogout} className="nav-btn logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;