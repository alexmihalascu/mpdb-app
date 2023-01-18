import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./login.css";

const Login = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (event) => {
    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((res) => {return res})
      .then(() => {window.location.href = "/rent"} )
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <form className="center-form" onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button type="submit" onClick={()=>{handleSubmit()}}>Login</button>
      <Link to='/register'>
        <button> Register </button>
        </Link>
    </form>
  );
};

export default Login;