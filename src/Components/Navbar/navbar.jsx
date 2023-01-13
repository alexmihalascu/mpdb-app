import React, { useState } from 'react';
import './navbar.css';

const Navbar = () => {

    const [navbar,setNavbar] = useState(false);
    const changeBg= () => {
        if(window.scrollY >=100){
            setNavbar(true);
        } else{
            setNavbar(false);
        }
    };

    window.addEventListener("scroll", changeBg);
  // comment
    return (
    <>
        {/* Navbar */}
<nav className={
  navbar
  ? "navbar active navbar-expand-sm fixed-top" 
  : "navbar navbar-expand-sm fixed-top"
}>
  <a href="/" className="navbar-brand">
    <span>MPDB</span> Sell Your Car 
  </a>
  <div>
    <ul className="navbar-nav">
      <li className="nav-item">
        <a href="/home" className="nav-link">
          Home
        </a>
      </li>
      <li className="nav-item">
        <a href="/sell" className="nav-link">
          Sell Your Car
        </a>
      </li>
      <li className="nav-item">
        <a href="/view" className="nav-link">
          View Cars
        </a>
      </li>
      <li className="nav-item">
        <a href="/founders" className="nav-link">
          Founders
        </a>
      </li>
      <li className="nav-item">
        <a href="/login" className="nav-link">
          Login
        </a>
      </li>
    </ul>
  </div>
</nav>
    </>
   
);
};

export default Navbar;
