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
                    <span>Best Cars in Town</span> - MPDB TEAM</h6>
            </div>
        </div>
        </>
    );
};
export default Footer;