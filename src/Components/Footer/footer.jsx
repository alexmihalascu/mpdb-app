import "./footer.css";
import footerImg from "../Images/footer.jpg"


const Footer = () => {
    return (
        <>
        <div className="footer">
            <div>
                <div className="img">
                    <img src={footerImg} alt=""/>
                </div>
                <div className="Overlay"></div>
            </div>
            <div className="Footer_content">
                <h6>
                    <span>Our Footer</span> MPDB </h6>
            </div>
        </div>
        </>
    );
};
export default Footer;