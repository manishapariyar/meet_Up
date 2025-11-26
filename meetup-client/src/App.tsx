
import RoutesApp from './Routes/routes'
import { AuthContextProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const App = () => {

  return (
    <div className='w-full h-full'>

      <AuthContextProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
          }}
        />
        <RoutesApp />
      </AuthContextProvider>


    </div>
  )
}

export default App
