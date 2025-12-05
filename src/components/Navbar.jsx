import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(
            "https://linksphere-backend-jkws.onrender.com/api/users/me",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(res.data);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-blue-600 text-2xl font-bold">
        Linksphere
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden md:flex space-x-6">
        <li>
          <Link to="/find-jobs" className="text-gray-700 hover:text-blue-600">
            Find Jobs
          </Link>
        </li>
        <li>
          <Link to="/find-freelancers" className="text-gray-700 hover:text-blue-600">
            Find Freelancers
          </Link>
        </li>
        <li>
          <Link to="/about-us" className="text-gray-700 hover:text-blue-600">
            About Us
          </Link>
        </li>

        {user?.role === "freelancer" && (
          <li>
            <Link to="/portfolio" className="text-gray-700 hover:text-blue-600">
              Portfolio
            </Link>
          </li>
        )}

        {user?.role === "client" && (
          <li>
            <Link to="/post-job" className="text-gray-700 hover:text-blue-600">
              Post Jobs
            </Link>
          </li>
        )}
      </ul>

      {/* Desktop Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="hidden md:block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      )}

      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          className="w-8 h-8 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16m0 6H4"
          ></path>
        </svg>
      </button>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg py-4 md:hidden">

          <Link
            to="/find-jobs"
            className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Find Jobs
          </Link>

          <Link
            to="/find-freelancers"
            className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Find Freelancers
          </Link>

          <Link
            to="/about-us"
            className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            About Us
          </Link>

          {user?.role === "freelancer" && (
            <Link
              to="/portfolio"
              className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
          )}

          {user?.role === "client" && (
            <Link
              to="/post-job"
              className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Post Jobs
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
