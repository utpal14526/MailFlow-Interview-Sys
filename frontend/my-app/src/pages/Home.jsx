import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import DashBoard from "../assests/DashBoard.png";

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            Take Your Email <br /> Marketing Further with <span>MailFlow</span>
          </h1>
          <p>
            MailFlow helps you keep your messages organized and your audience
            engaged. Simple, fast, and made for teams who want to get things
            done.
          </p>

          <div className="hero-buttons">
            <Link to="/dashboard">
              <button className="btn contacts-btn flex items-center gap-2">
                <span>Go to Dashboard</span>
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
}

export default Home;
