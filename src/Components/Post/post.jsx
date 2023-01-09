import PostImg from '../Images/post.jpg'
import "./post.css";
const Post= () => {
    return(
        <>
            <div className="post container"></div>
                <div className="row">
                    <div className="col-sm-5">
                    </div>
                    <div className="offset-sm-2 col-sm-5">
                        <img src={PostImg} className="img-fluid" alt=" "/>
                    </div>
                </div>
        </>
    );
};
export default Post;