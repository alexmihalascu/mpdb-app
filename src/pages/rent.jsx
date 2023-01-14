import React, { useState } from "react";
import "./rent.css"

const Rent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    car: "",
    pickupDate: "",
    returnDate: "",
    location:""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Nume intreg:</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="phone">Numar de telefon:</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <label htmlFor="car-select">Alege masina:</label>
      <select
        id="car-select"
        name="car"
        value={formData.car}
        onChange={handleChange}
        required
      >
        <option value="">Alege masina:</option>
        <option value="mustang">Mustang</option>
        <option value="urus">Urus</option>
        <option value="s63">S63</option>
        <option value="models">Model S</option>
        <option value="gt63s">AMG GT 63 S</option>
        <option value="a45s">A45s</option>
        <option value="c63s">C63s</option>
      </select>

      <label htmlFor="pickup-date">Data ridicarii:</label>
      <input
        type="date"
        id="pickup-date"
        name="pickupDate"
        value={formData.pickupDate}
        onChange={handleChange}
        required
      />

      <label htmlFor="return-date">Data returnarii:</label>
      <input
        type="date"
        id="return-date"
        name="returnDate"
        value={formData.returnDate}
        onChange={handleChange}
        required
      />

      <label htmlFor="location">Locatia ridicarii:</label>
      <input
        type="text"
        id="location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
      />
      
      <input type="submit" value="Submit" />
    </form>
  );
};

export default Rent;