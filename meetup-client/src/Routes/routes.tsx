
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home/Home'
import SignUp from '../Pages/Login/SignUp'
import { useAuthContext } from '../context/AuthContext';
import Dashboard from '../Pages/Dashboard/Dashboard';
import VideoMeet from '../Pages/videoMeet/VideoMeet';

const RoutesApp = () => {
  const { user, } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element=
        {<Home />} />
      <Route path="/sign-up" element=
        {<SignUp />} />
      {user ? <Route path="/dashboard" element={<Dashboard />} /> : null}
      <Route path="/:url" element=
        {<VideoMeet />} />
    </Routes>
  )
}

export default RoutesApp