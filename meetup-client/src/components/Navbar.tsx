import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const Navbar = () => {
  return (
    <div className="flex items-center justify-between p-2 bg-blue-20 shadow-md  lg:px-10 px-4">
      <Link to={'/'}><img src={logo} alt="" width={180} /></Link>
      <div className="flex items-center justify-between gap-4 lg:flex-row flex-col">
        <button className="text-blue-800 font-semibold underline text-sm sm:text-base hidden lg:block">
          Join as guest
        </button>
        <Link to={"sign-up"} className='text-sm sm:text-base font-semibold bg-amber-500 px-8 py-2 rounded-full text-white hover:bg-amber-600 transition'>

          Register</Link>
        <button className="text-blue-800 font-semibold underline text-sm sm:text-base lg:hidden block">
          Join as guest
        </button>
      </div>
    </div>
  )
}

export default Navbar