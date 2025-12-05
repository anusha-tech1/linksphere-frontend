import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("https://linksphere-backend-jkws.onrender.com/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
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
        <li><Link to="/find-jobs" className="text-gray-700 hover:text-blue-600">Find Jobs</Link></li>
        <li><Link to="/find-freelancers" className="text-gray-700 hover:text-blue-600">Find Freelancers</Link></li>
        <li><Link to="/about-us" className="text-gray-700 hover:text-blue-600">About Us</Link></li>

        {user?.role === "freelancer" && (
          <li><Link to="/portfolio" className="text-gray-700 hover:text-blue-600">Portfolio</Link></li>
        )}

        {user?.role === "client" && (
          <li><Link to="/post-job" className="text-gray-700 hover:text-blue-600">Post Jobs</Link></li>
        )}
      </ul>

      {/* Desktop Right Side (Logout / Client Menu) */}
      <div className="hidden md:block">
        {user?.role === "client" ? (
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                <Link to="/my-jobs" className="block px-4 py-2 hover:bg-gray-100">My Jobs</Link>
                <Link to="/freelancers-bids" className="block px-4 py-2 hover:bg-gray-100">Freelancers Bids</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          user && (
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          )
        )}
      </div>

      {/* Mobile Hamburger (for ALL users — freelancer/client/guest) */}
      <button
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white py-4 px-6 shadow-lg md:hidden">

          <Link to="/find-jobs" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Find Jobs</Link>
          <Link to="/find-freelancers" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Find Freelancers</Link>
          <Link to="/about-us" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>

          {user?.role === "freelancer" && (
            <Link to="/portfolio" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Portfolio</Link>
          )}

          {user?.role === "client" && (
            <>
              <Link to="/post-job" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Post Job</Link>
              <Link to="/profile" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <Link to="/my-jobs" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>My Jobs</Link>
              <Link to="/freelancers-bids" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Freelancers Bids</Link>
            </>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 text-red-600"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="block py-2" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
