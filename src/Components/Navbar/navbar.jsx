import React, { useState } from 'react';
import HDRImg from "..//Images/myhdr.jpg"
import './navbar.css';

const Navbar = () => {
    const [navbar,setNavbar] = useState(false);
    const [isLoggedIn] = useState(false);

    const changeBg= () => {
        if(window.scrollY >=100){
            setNavbar(true);
        } else{
            setNavbar(false);
        }
    };

    window.addEventListener("scroll", changeBg);
    return (
    <>
        {/* Navbar */}
        <nav className={
            navbar
            ? "navbar active navbar-expand-sm fixed-top" 
            : "navbar navbar-expand-sm fixed-top"
        }>
            <a href="/" className="navbar-brand">
                <span>MPDB</span> Rent a Car 
            </a>
            <div>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a href="/" className="nav-link">Home</a>
                    </li>
                    <li className="nav-item">
                        <a href="/cars" className="nav-link">View Cars</a>
                    </li>
                    <li className="nav-item">
                        <a href="/rent" className="nav-link">Rent</a>
                    </li>
                    <li className="nav-item">
                        <a href="/founders" className="nav-link">Founders</a>
                    </li>
                    {isLoggedIn ? (
                        <>
                            <li className="nav-item">
                                <a href="/my-account" className="nav-link">My Account</a>
                            </li>
                            <li className="nav-item">
                                <a href="/logout" className="nav-link">Logout</a>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item">
                            <a href="/login" className="nav-link">Login</a>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
        {/* Header */}
        <div className="header">
            <div className="img">
                <div>
                    <img src={HDRImg} alt=""/>
                </div>
                <div className="Overlay"></div>
            </div>
            <div className="Content">
                <p>
                </p>
            </div>
        </div>   
    </>
    );
};
  

export default Navbar;
