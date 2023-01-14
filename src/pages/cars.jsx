import PopularImg1 from "../Components/Images/popular1.jpg"
import PopularImg2 from "../Components/Images/popular2.jpg";
import footerImg from "../Components/Images/footer.jpg"

const Cars = () =>{
    return (
        <>

      <div className="popular container">
        <div className="row">
          <div className="col-sm-6">
            <div className="box">
              <img src={PopularImg1} className="img-fluid" alt="" />
            </div>
          </div>

          <div className="offset-sm-1 col-sm-5">
            <div className="box">
              <h6>Premium Car Rental</h6>
              <p>
              test
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-5">
            <div className="box">
              <h6>Vrei sa inchiriezi o masina?</h6>
              <p>
              merge
              </p>
            </div>
          </div>

          <div className="offset-sm-1 col-sm-6">
            <div className="box">
              <img src={PopularImg2} className="img-fluid" alt="" />
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