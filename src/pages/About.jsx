import React from "react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbfb] to-[#ebedee] text-gray-700 py-16 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-16 w-48 h-48 bg-purple-200 rounded-full opacity-15 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-1/4 -left-20 w-40 h-40 bg-pink-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-bounce" style={{animationDuration: '2s', animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-5xl font-extrabold text-[#4a4e69] mb-6 bg-gradient-to-r from-[#4a4e69] to-[#6b7280] bg-clip-text text-transparent animate-fade-in">
            About Us
          </h1>
        </div>
        <div className="transform hover:translate-y-1 transition-transform duration-300">
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto shadow-sm">
            We are a passionate team of innovators, committed to connecting freelancers and businesses worldwide.
            Our mission is to empower talents and help companies find the right professionals effortlessly.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-24 grid md:grid-cols-2 gap-10 relative z-10">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#4a4e69] mb-4 group-hover:text-blue-600 transition-colors duration-300">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize the freelancing industry by providing seamless, secure, and efficient opportunities for both businesses and freelancers.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#4a4e69] mb-4 group-hover:text-purple-600 transition-colors duration-300">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the world's leading freelancing platform, where businesses and talents collaborate to create extraordinary projects.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 text-center relative z-10">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#4a4e69] bg-gradient-to-r from-[#4a4e69] to-[#22c55e] bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 mt-2 leading-relaxed">
              We'd love to hear from you! Feel free to reach out anytime.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;