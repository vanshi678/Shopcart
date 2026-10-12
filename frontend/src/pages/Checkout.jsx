import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/api";

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
            setError("Verifying your payment...");

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
          color: "#4F46E5",
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
      <p className="p-8 text-center">
        Loading your cart...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="mb-6 text-sm font-medium text-indigo-600 hover:underline"
          disabled={processing}
        >
          ← Back to Cart
        </button>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <p className="mb-8 text-gray-500">
          Enter your delivery details and review your order.
        </p>

        {cartItems.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-gray-600">
              Your cart is empty.
            </p>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-xl bg-white p-6 shadow-sm md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Shipping Address
              </h2>

              {[
                ["fullName", "Full Name", "text"],
                ["phone", "10-digit Phone Number", "tel"],
                ["addressLine1", "Address", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "6-digit Pincode", "text"],
              ].map(([name, label, type]) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
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
                    autoComplete={
                      name === "fullName"
                        ? "name"
                        : name === "phone"
                          ? "tel"
                          : name === "addressLine1"
                            ? "street-address"
                            : name === "city"
                              ? "address-level2"
                              : name === "state"
                                ? "address-level1"
                                : "postal-code"
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  />
                </div>
              ))}

              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-amber-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={processing || cartItems.length === 0}
                className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing
                  ? "Processing..."
                  : "Continue to Payment"}
              </button>
            </form>

            <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="mb-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product?._id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-600">
                      {item.product?.name || "Product"} ×{" "}
                      {item.quantity}
                    </span>

                    <span className="font-medium text-gray-900">
                      ₹
                      {(
                        (item.product?.price || 0) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t pt-4 font-semibold">
                <span>Estimated Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                The server calculates the final price and checks
                product stock before creating your payment order.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;