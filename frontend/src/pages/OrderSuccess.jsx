import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../services/api";

function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        const response = await getOrderById(id);

        if (active) {
          setOrder(response.data.order);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <p className="p-8 text-center">
        Loading order details...
      </p>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="mb-3 text-2xl font-bold">
          Unable to load order
        </h1>

        <p className="mb-6 text-gray-600">
          {error || "Order not found."}
        </p>

        <Link
          to="/orders"
          className="text-indigo-600 hover:underline"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const paid = order.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            {paid ? "✓" : "!"}
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {paid ? "Order Placed!" : "Payment Pending"}
          </h1>

          <p className="text-gray-600">
            {paid
              ? "Thank you for shopping with ShopKart."
              : "We could not confirm your payment yet. Check your order status before trying again."}
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-xl bg-gray-50 p-5">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Order ID</span>
            <span className="break-all text-right font-medium">
              {order._id}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Payment</span>
            <span className="font-medium">
              {order.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Order Status</span>
            <span className="font-medium">
              {order.status}
            </span>
          </div>

          <div className="flex justify-between gap-4 border-t pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">
              ₹{Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold">
          Items Ordered
        </h2>

        <div className="mb-8 space-y-4">
          {order.items.map((item, index) => (
            <div
              key={item._id || `${item.product}-${index}`}
              className="flex justify-between gap-4 border-b pb-3"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="font-medium">
                ₹
                {(
                  Number(item.price) * item.quantity
                ).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">
            Delivery Address
          </h2>

          <p className="text-gray-600">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine1}
            <br />
            {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} -{" "}
            {order.shippingAddress.pincode}
            <br />
            Phone: {order.shippingAddress.phone}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="flex-1 rounded-lg bg-indigo-600 px-5 py-3 text-center font-semibold text-white hover:bg-indigo-700"
          >
            View My Orders
          </Link>

          <Link
            to="/products"
            className="flex-1 rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;