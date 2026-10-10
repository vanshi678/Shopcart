import { useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();

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
      <div className="navbar-left">
        <div className="navbar-logo">S</div>

        <div>
          <div className="navbar-brand">ShopKart</div>
          <div className="navbar-subtitle">Simple. Smart. Shopping.</div>
        </div>
      </div>

      <div className="navbar-right">
        <span className="navbar-welcome">My Account</span>
        <button
          onClick={() => navigate("/products")}
          className="logout-button"
        >
          Products
        </button>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;