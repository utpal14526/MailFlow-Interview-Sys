import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="w-full flex flex-wrap justify-between items-center px-6 py-4 shadow-md bg-[#0D0620] text-white">
    
      <Link to="/" className="text-xl sm:text-2xl font-bold text-white">
        MailFlow{" "}
        <span className="text-sm sm:text-base font-light">
          – Email Marketing
        </span>
      </Link>

      {/* Buttons */}
      <div className="flex items-center space-x-2 sm:space-x-4 mt-3 sm:mt-0">
        {!token ? (
          <>
            <Link
              to="/login"
              className="px-4 sm:px-5 py-2 rounded-lg font-semibold shadow-sm bg-white text-black hover:text-blue-600 transition-all duration-200"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 sm:px-5 py-2 rounded-full font-semibold shadow-sm bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/contact">
              <button className="px-4 sm:px-5 py-2 flex items-center gap-2 rounded-lg font-semibold shadow-sm bg-blue-500 hover:bg-blue-600 transition-all duration-200">
                <span>Add Contacts</span>
                <Plus className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 sm:px-5 py-2 rounded-lg font-semibold shadow-sm bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
