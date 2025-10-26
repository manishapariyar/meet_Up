
import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './Routes/routes'
import { useState } from 'react';
import { AuthContextProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const App = () => {

  return (
    <div className='w-full h-full'>
      <BrowserRouter basename='/'>
        <AuthContextProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
            }}
          />
          <RoutesApp />
        </AuthContextProvider>

      </BrowserRouter>
    </div>
  )
}

export default App
