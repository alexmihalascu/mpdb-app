import React, { useState } from 'react';
import "./register.css"
import axios from 'axios';

const Register = () => {
const [password, setPassword] = useState("");
const [username, setUsername] = useState("");

const handleSubmit = async (e) => {
e.preventDefault();
if (password !== username !== "") {
try {
await axios.post("http://127.0.0.1:5000/register", {
username,
password
});
window.location.href = "/";
} catch (e) {
console.log(e);
}
}
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
<button type="submit">Register</button>
</form>
);
};

export default Register;