import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users, Briefcase, Star, TrendingUp } from "lucide-react";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Mock user data for demo
const user = JSON.parse(localStorage.getItem("user"));
  const carouselSlides = [
    {
      id: 1,
      title: "Find Top Freelancers",
      description: "Connect with skilled professionals ready to bring your projects to life",
      icon: <Users className="w-16 h-16 text-blue-500" />,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
      accentColor: "text-blue-600"
    },
    {
      id: 2,
      title: "Discover Dream Jobs",
      description: "Explore opportunities that match your skills and career aspirations",
      icon: <Briefcase className="w-16 h-16 text-green-500" />,
      image: "/images/freelancer.jpg",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
      accentColor: "text-green-600"
    },
    {
      id: 3,
      title: "Quality Guaranteed",
      description: "Work with vetted professionals and companies for exceptional results",
      icon: <Star className="w-16 h-16 text-yellow-500" />,
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-100",
      accentColor: "text-yellow-600"
    },
    {
      id: 4,
      title: "Grow Your Career",
      description: "Take the next step in your professional journey with exciting opportunities",
      icon: <TrendingUp className="w-16 h-16 text-purple-500" />,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-100",
      accentColor: "text-purple-600"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Mock navigation function for demo
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
  };

  return (
    <div className="container mx-auto text-center mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Linksphere, {user?.name}!
        </h1>
      </div>
      
      <p className="text-gray-600 mt-4 font-bold text-lg mb-8">
        Find the best freelancers or jobs to kickstart your career!
      </p>

      {/* Enhanced Carousel */}
      <div className="relative w-full max-w-4xl mx-auto mb-12">
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                index === currentSlide
                  ? 'translate-x-0 opacity-100'
                  : index < currentSlide
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-white">
                <div className="mb-6 transform hover:scale-110 transition-transform duration-300 bg-white/20 backdrop-blur-sm rounded-full p-4">
                  {slide.icon}
                </div>
                <h3 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                  {slide.title}
                </h3>
                <p className="text-white/90 text-lg max-w-2xl leading-relaxed text-center drop-shadow-md">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                index === currentSlide
                  ? 'bg-white shadow-lg scale-125'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>



      {/* Stats Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
          <div className="text-gray-600">Active Freelancers</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
          <div className="text-gray-600">Job Opportunities</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
          <div className="text-gray-600">Success Rate</div>
        </div>
      </div> */}

      {/* Uncomment these when ready to use */}
      {/* <Hero />
      <Featured /> */}
    </div>
  );
};

export default Home;