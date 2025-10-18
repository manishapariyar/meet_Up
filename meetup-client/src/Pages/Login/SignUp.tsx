import { useState } from "react";
import logo from "../../assets/logo.png";
import bgVideo from "../../assets/bg.mp4";

const SignUp = () => {
  const [isSignIn, setIsSignIn] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-100 overflow-hidden">
      {/* Left Section (Video Background) */}
      <div className="relative w-full lg:w-1/2 hidden lg:flex flex-col justify-center items-start p-10">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Overlay Content */}
        <div className="relative z-10 text-white">
          {/* Logo */}
          <img src={logo} alt="Logo" className="w-40 mb-8" />

          {/* Heading */}
          <h1 className="text-3xl xl:text-5xl font-extrabold leading-tight mb-4 font-sans">
            Connect. Collaborate. <br /> Create space to thrive.
          </h1>

          {/* Subtext */}
          <p className="text-lg xl:text-xl max-w-md text-gray-100 font-medium">
            Build meaningful connections and achieve your goals with smarter video meetings.
          </p>
        </div>

        {/* Optional gradient overlay for readability */}
        <div className="absolute inset-0 bg-black/30 z-0"></div>
      </div>

      {/* Right Section (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-10 px-6 sm:px-10 relative">
        {/* Mobile Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center ">
          <img src={logo} alt="Logo" className="w-32 sm:w-40 lg:hidden" />
          <button className="text-blue-600 font-semibold underline text-sm sm:text-base lg:ml-140">
            Join as guest
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm mt-16 sm:mt-24 lg:mt-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 font-itim text-center">
            {isSignIn ? "Sign In" : "Sign Up"}
          </h2>

          <form className="space-y-4">
            {!isSignIn && (
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition"
            >
              {isSignIn ? "Sign In" : "Sign Up"}
            </button>

            <p className="text-center text-sm sm:text-base mt-3 font-itim">
              {isSignIn ? "Don’t have an account?" : "Already have an account?"}{" "}
              <span
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-blue-600 cursor-pointer font-medium"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
