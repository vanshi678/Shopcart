import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

export const registerCustomer = (customerData) => {
  return api.post("/customers/register", customerData);
};

export const loginCustomer = (loginData) => {
  return api.post("/customers/login", loginData);
};

export const getMyProfile = () => {
  return api.get("/customers/me");
};

export const logoutCustomer = () => {
  return api.post("/customers/logout");
};

export const getProducts = (params) => {
  return api.get("/api/products", {
    params,
  });
};

export const getProductById = (id) => {
  return api.get(`/api/products/${id}`);
};



export const getWishlist = () => {
  return api.get("/api/wishlist");
};

export const addToWishlist = (productId) => {
  return api.post(`/api/wishlist/${productId}`);
};

export const removeFromWishlist = (productId) => {
  return api.delete(`/api/wishlist/${productId}`);
};

export const getCart = () => api.get("/api/cart");

export const addToCart = (productId) =>
  api.post(`/api/cart/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/api/cart/${productId}`, { quantity });

export const removeFromCart = (productId) =>
  api.delete(`/api/cart/${productId}`);



export default api;