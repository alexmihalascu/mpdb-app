import React, { useState } from 'react';
import './myaccount.css';

const MyAccount = () => {
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Send the new password to the server for updating
    // ...
  };

  return (
    <div className="my-account-container">
      <form className="my-account-form" onSubmit={handleSubmit}>
        <label className="my-account-label">
          New Password:
          <input className="my-account-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="my-account-button" type="submit">Save</button>
      </form>
    </div>
  );
};

export default MyAccount;
