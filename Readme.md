# 🛒 ShopKart — Full-Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application built using React, Node.js, Express.js, and MongoDB. It allows users to browse products, manage their wishlist and shopping cart, securely complete checkout using Razorpay, and track their orders.

## ✨ Features

### 🔐 Authentication
- Customer registration and login
- JWT-based authentication
- HttpOnly cookie-based session handling
- Protected routes and customer-specific data

### ❤️ Wishlist
- Add products to the wishlist
- View saved products
- Remove products from the wishlist
- Prevent duplicate wishlist entries
- Persist wishlist data in MongoDB

### 🛍️ Shopping Cart
- Add products to the cart
- Update product quantities
- Remove products from the cart
- Validate product stock
- Calculate total item count and subtotal
- Maintain shared cart state using React Context
- Persist cart data in MongoDB

### 💳 Checkout and Payments
- Shipping address form
- Razorpay payment gateway integration
- Server-side price calculation
- Payment signature verification
- Stock validation during checkout
- Cart clearing after successful payment processing

### 📦 Order Management
- Create and store orders
- Save product details and purchase prices as order snapshots
- View order history in My Orders
- View individual order details
- Track payment and order statuses
- Restrict order access to the authenticated customer

### 🎨 User Interface
- Responsive product browsing experience
- Product search and product detail pages
- Login and registration pages
- Cart, wishlist, checkout, and order pages
- Shared navigation and cart item count

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development and build tooling |
| JavaScript | Application logic |
| Axios | HTTP requests to the backend |
| React Context API | Shared cart state management |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcrypt | Password hashing |
| Razorpay | Payment gateway integration |
| Git and GitHub | Version control |

## 📁 Project Structure

```text
Shopcart/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a compatible MongoDB instance
- Razorpay account with Test Mode credentials
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vanshi678/Shopcart.git
cd Shopcart
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and configure the required environment variables.

```env
PORT=5000
dbURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Replace the placeholder values with your own credentials. Use the actual environment variable names expected by your backend code.

**Security:** Never commit your `.env` file or expose your Razorpay Key Secret in frontend code.

### 3. Start the backend

From the `backend` directory, run:

```bash
npm run dev
```

If your project does not define a `dev` script, start the server using the command configured in your backend `package.json`, such as:

```bash
node index.js
```

### 4. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal, usually:

```text
http://localhost:5173
```

Ensure the frontend API configuration and Vite proxy match the backend port and route setup.

## 🔄 Application Workflow

1. Register or log in to your account.
2. Browse products and view product details.
3. Add products to your wishlist or shopping cart.
4. Update quantities and review the subtotal.
5. Proceed to checkout and enter shipping details.
6. The backend validates the cart and calculates the payment amount.
7. Complete the payment through Razorpay.
8. The backend verifies the payment response before finalizing the order.
9. View the confirmed order in Order Success and My Orders.

## 🔌 API Overview

The following endpoints are part of the project's cart and order functionality. They require authentication unless stated otherwise.

### Cart APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/cart` | Retrieve the cart |
| POST | `/api/cart/:productId` | Add a product |
| PATCH | `/api/cart/:productId` | Update quantity |
| DELETE | `/api/cart/:productId` | Remove a product |

### Order and Payment APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/orders/create-payment-order` | Create a pending order and Razorpay order |
| POST | `/api/orders/verify-payment` | Verify payment details |
| GET | `/api/orders` | Retrieve the logged-in customer's orders |
| GET | `/api/orders/:id` | Retrieve an individual order |

The `/api` prefix reflects the frontend's configured API/proxy path. Adjust it if your deployment uses a different route configuration.

Wishlist and authentication endpoints are also implemented in the backend.

## 🔒 Security Practices

- Passwords are hashed using bcrypt.
- JWT authentication is used to protect private endpoints.
- HttpOnly cookies are used for authentication.
- Customer identity is derived from verified authentication rather than trusting a frontend-supplied user ID.
- Checkout totals are calculated on the backend.
- Product stock is validated by the backend.
- Payment signatures are verified server-side.
- Orders are checked for customer ownership.
- Environment variables and payment secrets must not be committed to version control.

> For production deployment, payment processing should additionally include reliable payment-status reconciliation, webhook handling, idempotency, and robust inventory transaction handling.

## 🧠 Key Concepts Demonstrated

This project demonstrates practical implementation of:

- REST API design
- React hooks and Context API
- Frontend and server-state synchronization
- MongoDB references and Mongoose `populate()`
- JWT authentication and authorization
- Protected routes
- Server-side validation and error handling
- Derived cart state and subtotal calculations
- Payment gateway integration
- Order snapshots and persistent order history
- Git and GitHub version control

## 🧪 Testing

Recommended manual tests include:

- Registration and login with valid and invalid credentials
- Accessing protected APIs without authentication
- Adding and removing wishlist items
- Adding products to the cart and changing quantities
- Rejecting quantities that exceed available stock
- Refreshing the page and checking persistence
- Preventing checkout with an empty cart
- Handling payment cancellation or failure
- Verifying successful payments
- Checking order history and ownership
- Confirming the cart is cleared only after successful order processing

Use Razorpay Test Mode credentials and test payment methods during development.

## 🔮 Future Improvements

- Product categories and advanced filters
- Pagination and sorting
- Admin dashboard and inventory management
- Product reviews and ratings
- Order cancellation and refunds
- Automated unit and integration tests
- Improved inventory concurrency handling
- Production deployment and monitoring

## 👩‍💻 Author

**Vanshika Asati**

GitHub: [@vanshi678](https://github.com/vanshi678)

Project Repository: [ShopKart](https://github.com/vanshi678/Shopcart)

---

*ShopKart — Learn, Build, and Shop!*