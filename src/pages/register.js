import React, { useState } from "react";

const Register = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (event) => {
    fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((res) => {return res.json()})
      .then((res) => {console.log(res);window.location.href = "/login" })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <form className="center-form" >
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
      <button onClick={()=>{handleSubmit()}}>Register</button>
    </form>
  );
};
export default Register;
