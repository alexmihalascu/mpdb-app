import footerImg from "../Components/Images/footer.jpg"
import FounderImg1 from "../Components/Images/founder1.jpg"
import FounderImg2 from "../Components/Images/founder2.jpg"
import FounderImg3 from "../Components/Images/founder3.jpg"
import FounderImg4 from "../Components/Images/founder4.jpg"
import "./founders.css"


const Founders = () =>{
    return (
        
        <>
<div class="founders-container">
    <div class="founder left">
    <img src={FounderImg1}  alt="Alex Mihalascu"></img>
        <p>Mihalașcu Alexandru</p>
    </div>
    <div class="founder left">
    <img src={FounderImg2}  alt="Alex Pencea"></img>
        <p>Pencea Alexandru</p>
    </div>
    <div class="founder right">
    <img src={FounderImg3}  alt="Silviu Dinu"></img>
        <p>Dinu Silviu-Ion</p>
    </div>
    <div class="founder right">
    <img src={FounderImg4}  alt="Mihai Beznea"></img>
        <p>Beznea Mihai-Gabriel</p>
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
export default Founders;

