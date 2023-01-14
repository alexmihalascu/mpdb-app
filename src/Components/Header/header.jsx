import HDRImg from "..//Images/myhdr.jpg"
import "./header.css";
const Header = () =>{
    return (
        <>
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

export default Header;