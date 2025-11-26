
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home/Home'
import SignUp from '../Pages/Login/SignUp'
import { useAuthContext } from '../context/AuthContext';

import VideoMeet from '../Pages/videoMeet/VideoMeet';

const RoutesApp = () => {
  const { user, } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element=
        {<Home />} />
      <Route path="/sign-up" element=
        {<SignUp />} />
      {user ? <Route path="/:url" element=
        {<VideoMeet />} /> : null}

    </Routes>
  )
}

export default RoutesApp