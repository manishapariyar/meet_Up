
import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './Routes/routes'

const App = () => {
  return (
    <div className='w-full h-full'>
      <BrowserRouter basename='/'>
        <RoutesApp />
      </BrowserRouter>
    </div>
  )
}

export default App
