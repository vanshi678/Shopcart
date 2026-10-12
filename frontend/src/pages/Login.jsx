import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            await loginCustomer(formData);
            navigate("/home");
        } catch (error) {
            setError(
                error.response?.data?.message || "Login failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <span className="auth-logo">S</span>
                    <div>
                        <p className="auth-brand-name">ShopKart</p>
                        <p className="auth-brand-tag">Your everyday shopping place</p>
                    </div>
                </div>

                <div className="auth-title">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to ShopKart.</p>
                </div>

                {error && (
                    <div className="alert-error">
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Sign In
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link to="/">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;