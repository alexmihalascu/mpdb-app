import CarImg1 from "../Components/Images/car1.jpg"
import CarImg2 from "../Components/Images/car2.jpg"
import CarImg3 from "../Components/Images/car3.jpg"
import CarImg4 from "../Components/Images/car4.jpg"
import CarImg5 from "../Components/Images/car5.jpg"
import CarImg6 from "../Components/Images/car6.jpg"
import CarImg7 from "../Components/Images/car7.jpg"
import CarImg8 from "../Components/Images/car8.jpg"
import footerImg from "../Components/Images/footer.jpg"
import React from "react";
import "./cars.css"

const Cars = () =>{
    return (
        <>

<div class="container">
  <div class="row">
    <div class="col-3">
      <img src={CarImg1}  alt="mustang"></img>
      <p>Model: Ford Mustang</p>
      <p>An: 2020</p>
      <p>Putere: 450 CP</p>
      <p>Preț pe zi: 100 Euro</p>
    </div>
    <div class="col-3">
    <img src={CarImg2}  alt="urus"></img>
      <p>Model: Lamborgini Urus</p>
      <p>An: 2021</p>
      <p>Putere: 650 CP</p>
      <p>Preț pe zi: 800 Euro</p>
    </div>
    <div class="col-3">
    <img src={CarImg3}  alt="s63"></img>
      <p>Model: Mercedes S63</p>
      <p>An: 2022</p>
      <p>Putere: 791 CP</p>
      <p>Preț pe zi: 750 Euro</p>
    </div>
    <div class="col-3">
    <img src={CarImg4}  alt="plaid"></img>
      <p>Model: Tesla Model S Plaid</p>
      <p>An: 2023</p>
      <p>Putere: 1020</p>
      <p>Preț pe zi: 700 Euro</p>
    </div>
    <div class="row">
    <div class="col-3">
      <img src={CarImg5}  alt="mustang"></img>
      <p>Model: Mercedes AMG-GT 4 Door 63S E-Performance</p>
      <p>An: 2022</p>
      <p>Putere: 843 CP</p>
      <p>Preț pe zi: 900 Euro</p>
    </div>
    <div class="col-3">
    <img src={CarImg6}  alt="urus"></img>
      <p>Model: Mercedes A45s</p>
      <p>An: 2021</p>
      <p>Putere: 421 CP</p>
      <p>Preț pe zi: 300 Euro</p>
    </div>
    <div class="col-3">
    <img src={CarImg7}  alt="s63"></img>
      <p>Model: Mercedes C63S E-Performance</p>
      <p>An: 2023</p>
      <p>Putere: 680 CP</p>
      <p>Preț pe zi: 800 Euro</p>
    </div>
    <div class="col-3">
    <img src={CarImg8}  alt="plaid"></img>
      <p>Model: Tesla Model X Plaid</p>
      <p>An: 2023</p>
      <p>Putere: 1020</p>
      <p>Preț pe zi: 750 Euro</p>
    </div>
    </div>

  </div>
</div>

        <div className="footer">
            <div>
                <div className="img">
                    <img src={footerImg} alt=""/>
                </div>
                <div className="Overlay"></div>
            </div>
            <div className="Footer_content">
                <h6>
                    <span>Best Cars in Town</span> - MPDB TEAM</h6>
            </div>
        </div>
        </>  
    )
}
export default Cars;