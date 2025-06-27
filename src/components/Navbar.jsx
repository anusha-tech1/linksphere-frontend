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
      
      <Link to="/" className="text-blue-600 text-2xl font-bold">Linksphere</Link>

      
      {user?.role !== "client" ? (
        <ul className="hidden md:flex space-x-6">
          <li><Link to="/find-jobs" className="text-gray-700 hover:text-blue-600">Find Jobs</Link></li>
          <li><Link to="/find-freelancers" className="text-gray-700 hover:text-blue-600">Find Freelancers</Link></li>
          <li><Link to="/about-us" className="text-gray-700 hover:text-blue-600">About Us</Link></li>
          {user?.role === "freelancer" && <li><Link to="/portfolio" className="text-gray-700 hover:text-blue-600">Portfolio</Link></li>}
          {user?.role === "client" && <li><Link to="/post-job" className="text-gray-700 hover:text-blue-600">Post Jobs</Link></li>}
        </ul>
      ) : null}

      
      {user?.role === "client" ? (
        <div className="relative">
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>

          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
              <Link 
                to="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/my-jobs"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                My Jobs
              </Link>
              <Link 
                to="/freelancers-bids"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Freelancers Bids
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        
        user && (
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        )
      )}
    </nav>
  );
};

export default Navbar;