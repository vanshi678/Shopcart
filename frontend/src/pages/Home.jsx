import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/api";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        setCustomer(response.data);
      } catch (error) {
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!customer) {
    return (
      <div className="sk-loading">
        <div className="sk-spinner" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="home-page">
        <div className="home-content">
          <section className="welcome-section">
            <p className="welcome-label">YOUR SHOPKART ACCOUNT</p>

            <h1>
              Welcome back,{" "}
              <span>{customer.fullName}</span> 
            </h1>

            <p className="welcome-text">
              Your account is ready. Here&apos;s a quick look at your profile.
            </p>
          </section>

          <section className="profile-card">
            <div className="profile-heading">
              <div className="profile-avatar">
                {customer.fullName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>Your registered ShopKart details</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">FULL NAME</span>
                <strong>{customer.fullName}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">EMAIL ADDRESS</span>
                <strong>{customer.email}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">PHONE NUMBER</span>
                <strong>{customer.phone}</strong>
              </div>
            </div>
          </section>

          <div className="home-note">
            <span>🛍️</span>
            <p>
              You&apos;re all set to explore ShopKart and start shopping.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;