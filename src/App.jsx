import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import FindJobs from "./pages/Findjobs";
import FindFreelancers from "./pages/FindFreelancers";
import AboutUs from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PortfolioPage from "./pages/PortfolioPage";
import PortfolioDetail from "./pages/PortfolioDetail";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import ContractEditor from './pages/ContractEditor';

import EditProfile from "./pages/EditProfile";
import PostJob from "./pages/PostJob";
import MyBids from "./pages/MyBids";
import MyJobs from './pages/MyJobs';

import FreelancersBids from "./pages/FreelancersBids";
import Profile from "./pages/Profile";
import ProjectStatus from "./pages/ProjectStatus";
import CreateContract from './pages/CreateContract';


// import PaymentPage from "./components/PaymentPage";



// Protected Route
const ProtectedRoute = ({ isLoggedIn, allowedRole, children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!isLoggedIn) return <Navigate to="/login" />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <Router>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md py-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              <Link to="/">Linksphere</Link>
            </h1>

            {/* Main Navigation */}
            <div className="hidden md:flex gap-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link
                to="/find-jobs"
                className="text-gray-700 hover:text-blue-600"
              >
                Find Jobs
              </Link>
              <Link
                to="/find-freelancers"
                className="text-gray-700 hover:text-blue-600"
              >
                Find Freelancers
              </Link>
              <Link
                to="/about-us"
                className="text-gray-700 hover:text-blue-600"
              >
                About Us
              </Link>

              {user?.role === "freelancer" && (
                <Link
                  to="/portfolio"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Portfolio
                </Link>
              )}
              {user?.role === "client" && (
                <Link
                  to="/post-job"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Post Jobs
                </Link>
              )}
            </div>

            {/* Profile / Auth Buttons */}
            <div className="flex items-center gap-4 relative">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray-700 text-2xl focus:outline-none"
                  >
                    ☰
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-40 p-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>

                      {user.role === "freelancer" && (
                        <>
                          <Link
                            to="/my-bids"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            My Bids
                          </Link>
                          {/* <Link
                            to="/project-status"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            Project Status
                          </Link> */}
                        </>
                      )}

                      {user.role === "client" && (
                        <>
                          <Link
                            to="/my-jobs"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            My Jobs
                          </Link>
                          <Link
                            to="/freelancers-bids"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            Freelancers Bids
                          </Link>
                          {/* <Link
                            to="/project-status"
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            Project Status
                          </Link> */}
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="border-2 border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Main Routes */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/find-jobs"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <FindJobs user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-freelancers"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <FindFreelancers />
                </ProtectedRoute>
              }
            />
            <Route path="/about-us" element={<AboutUs />} />
            <Route
              path="/login"
              element={
                <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
              }
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="freelancer">
                  <PortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route path="/portfolio/:id" element={<PortfolioDetail />} />
            <Route
              path="/contact/:id"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Contact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile/:id"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="freelancer">
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="client">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="freelancer">
                  <MyBids />
                </ProtectedRoute>
              }
            />
            {/* ADD THIS NEW ROUTE */}
            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="client">
                  <MyJobs user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancers-bids"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="client">
                  <FreelancersBids />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Profile user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project-status"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ProjectStatus user={user} />
                </ProtectedRoute>
              }
            />
            {/* Create Contract Page */}
            <Route
              path="/create-contract/:bidId"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <CreateContract />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-contract/:contractId"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn} allowedRole="client">
                  <ContractEditor />
                </ProtectedRoute>
              }
            />

            {/* Add the payment route */}
        {/* <Route path="/payment/:contractId" element={<PaymentPage />} /> */}

          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;