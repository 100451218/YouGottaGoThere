import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Add from "./pages/Add"
import Update from './pages/Updates';
import Books from './pages/Books';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch("http://localhost:8081/books")
    .then(res => res.json())
    .then(data => console.log("app.js data loaded:",data))
    .catch(err => console.log(err))
  })


  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/books' element={<Books/>}/>
          <Route path='/add' element={<Add/>}/>
          <Route path='/update' element={<Update/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
