import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        const response = await getMyOrders();

        if (active) {
          setOrders(response.data.orders || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your orders."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="p-8 text-center">
        Loading your orders...
      </p>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="mb-3 text-2xl font-bold">
          Unable to load orders
        </h1>
        <p role="alert" className="mb-5 text-red-600">
          {error}
        </p>
        <Link
          to="/products"
          className="text-indigo-600 hover:underline"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Orders
            </h1>
            <p className="mt-2 text-gray-500">
              View your purchases and payment status.
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">
              No orders yet
            </h2>
            <p className="mb-6 text-gray-500">
              Your placed orders will appear here.
            </p>
            <Link
              to="/products"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-xl bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>
                    <p className="break-all font-medium text-gray-900">
                      {order._id}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                      {order.status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 py-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item._id || `${item.product}-${index}`}
                      className="flex justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="font-medium text-gray-900">
                        ₹
                        {(
                          Number(item.price) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                  <p className="text-lg font-bold text-gray-900">
                    Total: ₹
                    {Number(order.totalAmount).toFixed(2)}
                  </p>

                  <Link
                    to={`/order-success/${order._id}`}
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    View Order Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;