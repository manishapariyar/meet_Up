import Navbar from '../../components/Navbar'
import image from '../../assets/homeImage.jpg'
import { BiVideo } from 'react-icons/bi'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-100 via-blue-200 to-blue-800">
      <Navbar />

      {/* Container */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-10 lg:py-20">

        {/* Left Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6 mb-10 lg:mb-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-itim">
            Connect, Share, and Grow with <span className="text-amber-400">Meetup</span>
          </h1>

          <p className="text-gray-700 font-semibold text-sm md:text-base leading-relaxed">
            Join a community of like-minded individuals and explore your interests through local events.
            Discover exciting gatherings, create your own meetups, and connect with people who share your passions.
            Building your community has never been easier—start today and make meaningful connections!
          </p>

          <div>
            <Link to={"/sign-up"}><button className="bg-amber-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-amber-700 transition">
              Get Started
            </button></Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 relative flex justify-center mt-10 lg:mt-10">
          <BiVideo className="text-blue-700 text-7xl md:text-8xl lg:text-[100px] absolute top-4 left-6 lg:left-16 rotate-12 opacity-70" />
          <img
            src={image}
            alt="Meetup Illustration"
            className="w-11/12 sm:w-3/4 md:w-2/3 lg:w-[80%] rounded-2xl rounded-br-[30%] rounded-tl-[60%] shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}

export default Home
