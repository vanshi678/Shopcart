import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/api";
import Navbar from "../components/Navbar";

// Load Razorpay's checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    );

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      existingScript.addEventListener(
        "load",
        () => resolve(true),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function Checkout() {
  const { cartItems, subtotal, loading, refreshCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateShippingAddress = () => {
    const values = Object.values(shippingAddress);

    if (values.some((value) => !value.trim())) {
      return "Please fill in all shipping details.";
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return "Enter a valid 10-digit phone number.";
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return "Enter a valid 6-digit pincode.";
    }

    if (cartItems.length === 0) {
      return "Your cart is empty.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateShippingAddress();

    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    try {
      // Load Razorpay Checkout.
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection and try again."
        );
      }

      // The backend validates the cart and calculates the amount.
      const response = await createPaymentOrder({
        ...shippingAddress,
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      });

      const {
        orderId,
        razorpayOrderId,
        amount,
        currency,
        keyId,
      } = response.data;

      if (
        !orderId ||
        !razorpayOrderId ||
        !amount ||
        !currency ||
        !keyId
      ) {
        throw new Error(
          "The server returned incomplete payment details."
        );
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "ShopKart",
        description: "Shopping order",
        order_id: razorpayOrderId,

        handler: async (paymentResponse) => {
          try {
            setError("Verifying your payment…");

            // The backend verifies the signature before placing the order.
            await verifyPayment({
              orderId,
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature,
            });

            await refreshCart();

            navigate(`/order-success/${orderId}`, {
              replace: true,
            });
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
                "We couldn't confirm your payment. Please check your order status before trying to pay again."
            );
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);
            setError(
              "Payment window closed. Your cart has not been cleared."
            );
          },
        },

        theme: {
          color: "#8b5cf6",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (paymentResponse) => {
        setProcessing(false);
        setError(
          paymentResponse.error?.description ||
            "Payment failed. Your cart has not been cleared."
        );
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start checkout. Please try again."
      );

      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="sk-loading">
          <div className="sk-spinner" />
          <span>Loading your cart…</span>
        </div>
      </>
    );
  }

  const fields = [
    ["fullName", "Full Name", "text", "name"],
    ["phone", "Phone Number (10 digits)", "tel", "tel"],
    ["addressLine1", "Address", "text", "street-address"],
    ["city", "City", "text", "address-level2"],
    ["state", "State", "text", "address-level1"],
    ["pincode", "Pincode (6 digits)", "text", "postal-code"],
  ];

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-inner">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/cart")}
            disabled={processing}
          >
            ← Back to Cart
          </button>

          <h1>Checkout</h1>
          <p>Enter your delivery details and review your order.</p>

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <button
                className="btn-primary"
                style={{ maxWidth: 200, margin: "0 auto" }}
                onClick={() => navigate("/products")}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="checkout-grid">
              <form
                onSubmit={handleSubmit}
                className="checkout-form-card"
              >
                <h2>Shipping Address</h2>

                {fields.map(([name, label, type, autoComplete]) => (
                  <div className="field-group" key={name}>
                    <label className="checkout-label" htmlFor={name}>
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      value={shippingAddress[name]}
                      onChange={handleChange}
                      required
                      disabled={processing}
                      autoComplete={autoComplete}
                      className="checkout-input"
                      placeholder={label}
                    />
                  </div>
                ))}

                {error && (
                  <div className="alert-warning">
                    ⚠ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing || cartItems.length === 0}
                  className="btn-primary"
                >
                  {processing ? "Processing…" : "Continue to Payment →"}
                </button>
              </form>

              <aside className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div style={{ marginBottom: 16 }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.product?._id}
                      className="summary-row"
                    >
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                        {item.product?.name || "Product"} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary-row total">
                  <span>Estimated Total</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  The server calculates the final price and checks product stock before creating your payment order.
                </p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Checkout;