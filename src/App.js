import "./App.css";
import Navbar from "./Components/Navbar/navbar";
import Header from "./Components/Header/header";
import Post from "./Components/Post/post";
import Footer from "./Components/Footer/footer";
import Custom from "./Components/custom/custom";
import Popular from "./Components/popular/popular"
import SecondHeader from "./Components/SecondHeader/secondheader";

const App= () => {
    return(
     <>
      <Navbar />
      <Header />
      <Popular />
      <Footer />
     </>  
    ); 
};
export default App;