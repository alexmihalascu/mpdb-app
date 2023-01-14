import "./App.css";
import Navbar from "./Components/Navbar/navbar";
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from "./pages/home"
import Login from "./pages/login";
import Cars from "./pages/cars";

const App= () => {
    return(
     <>
    <Router>
    <Navbar />
    <Routes>
        <Route path='/' exact element={<Home />} />
        <Route path='login' exact element={<Login />} />
        <Route path='cars' exact element={<Cars />} />
    </Routes>
    </Router>
     </>  
    ); 
};
export default App;