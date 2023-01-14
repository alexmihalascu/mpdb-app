import PopularImg1 from "../Components/Images/popular1.jpg"
import PopularImg2 from "../Components/Images/popular2.jpg";
import footerImg from "../Components/Images/footer.jpg"
import "./home.css"

const Home = () =>{
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
              Suntem o companie premium de inchirieri auto, care oferim clientilor nostri cele mai bune masini de lux si servicii de inalta calitate. Ne mandrim cu o flota diversificata de masini, de la modele sport si exotice la SUV-uri si limuzine, toate mentinute la standarde ridicate de calitate si siguranta. Personalul nostru este instruit si dedicat pentru a oferi servicii exceptionale si experiente de conducere memorabile. Ne diferentiem prin atentie la detalii, servicii personalizate si preturi competitive. Alege sa calatoresti in stil si confort cu compania noastra de inchirieri auto premium
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-5">
            <div className="box">
              <h6>Vrei sa inchiriezi o masina?</h6>
              <p>
              Suntem incantati sa va oferim posibilitatea de a inchiria unul dintre masinile noastre de lux si de a va bucura de o experienta de calatorie de neuitat.
Pentru a va rezerva masina dorita, va rugam sa completati formularul de inchiriere auto disponibil pe site-ul nostru. Acesta va solicita informatii precum data si ora dorite pentru inchiriere, modelul masinii ales si informatii personale.
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
export default Home;