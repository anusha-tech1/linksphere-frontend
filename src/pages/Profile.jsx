import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:4001/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'freelancer':
        return '👨‍💻';
      case 'client':
        return '👤';
      default:
        return '🧑‍💼';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'freelancer':
        return 'from-green-400 to-green-600';
      case 'client':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
          {/* Header Background */}
          <div className={`h-32 bg-gradient-to-r ${getRoleColor(user?.role)} relative`}>
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-4xl border-4 border-white">
                {getRoleIcon(user?.role)}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.name}</h2>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getRoleColor(user?.role)}`}>
                <span className="mr-2">{getRoleIcon(user?.role)}</span>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
                  👤
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="text-lg text-gray-800 font-semibold">{user?.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
                  📧
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-lg text-gray-800 font-semibold">{user?.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(user?.role)} rounded-full flex items-center justify-center text-white text-xl mr-4`}>
                  {getRoleIcon(user?.role)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Account Type</p>
                  <p className="text-lg text-gray-800 font-semibold capitalize">{user?.role}</p>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Additional Stats or Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-lg mr-3">
                ✅
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Account Status</h3>
            </div>
            <p className="text-green-600 font-medium">Active & Verified</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-lg mr-3">
                📅
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Member Since</h3>
            </div>
            <p className="text-gray-600 font-medium">Recently Joined</p>
          </div>
        </div>

        {/* Commented Rewards Section */}
        {/* 
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 mt-8 text-white">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl mr-4">
              🏆
            </div>
            <h3 className="text-xl font-bold">Reward Points</h3>
          </div>
          <p className="text-2xl font-bold">{user?.rewards || 0} Points</p>
          <p className="text-sm opacity-90">Keep earning points for amazing rewards!</p>
        </div>
        */}
      </div>
    </div>
  );
};

export default Profile;