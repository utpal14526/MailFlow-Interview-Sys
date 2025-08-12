import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import DashBoard from "../assests/DashBoard.png";

const Home = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            Elevate Your Email <br /> Marketing with <span>MailFlow</span>
          </h1>
          <p>
            Introducing MailFlow, the unsung hero of streamlined communication
            in the world of Software as a Service.
          </p>

          <div className="hero-buttons">
            <Link to="/dashboard">
              <button className="btn contacts-btn flex items-center gap-2">
                <span>Go to DashBoard</span>
                <MoveRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img src={DashBoard} alt="Dashboard Preview" />
        </div>
      </section>
    </div>
  );
};

export default Home;
