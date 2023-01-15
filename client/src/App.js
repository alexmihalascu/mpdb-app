import "./App.css";
import Navbar from "./Components/Navbar/navbar";
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from "./pages/home"
import Login from "./pages/login"
import Cars from "./pages/cars"
import Rent from "./pages/rent"
import Founders from "./pages/founders";
import Register from "./pages/register";

const App= () => {
    return(
     <>
    <Router>
    <Navbar />
    <Routes>
        <Route path='/' exact element={<Home />} />
        <Route path='login' exact element={<Login />} />
        <Route path='register' exact element={<Register />} />
        <Route path='cars' exact element={<Cars />} />
        <Route path='rent' exact element={<Rent />} />
        <Route path='founders' exact element={<Founders />} />
    </Routes>
    </Router>
     </>  
    ); 
};
export default App;