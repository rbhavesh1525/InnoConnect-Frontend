import {BrowserRouter as Router , Routes, Route} from 'react-router-dom'
import './App.css'
import {Login,HomePage,Signup} from './Pages/PageIndex'


import DBCheck from './Components/DbCheck'
function App() {
 

  return (
   
    <Router>
    <Routes>
      <Route path='/' element={<><HomePage/></>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/dbcheck' element={<DBCheck/>}/>
    
    </Routes>
    </Router>
  


    
   
   
  )
}

export default App
