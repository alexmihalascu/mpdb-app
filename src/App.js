import "./App.css";
import Navbar from "./Components/Navbar/navbar";
import Header from "./Components/Header/header";
import Post from "./Components/Post/post";
import Footer from "./Components/Footer/footer";

const App= () => {
    return(
     <>
        <Navbar />
        <Header />
        <Post />
        <Footer />
     </>  
    );
};
export default App;