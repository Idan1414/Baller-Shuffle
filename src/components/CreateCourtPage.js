import React, { useState } from 'react';
import Court from './Court';
import { Link, useNavigate } from 'react-router-dom';
import './CreateCourtPage.css';

const CreateCourtPage = () => {
  const navigate = useNavigate();
  const [courtSettings, setCourtSettings] = useState({
    courtName: '',
    courtType: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourtSettings((prevSettings) => ({ ...prevSettings, [name]: value }));
  };

  const handleCreateCourt = () => {
    const newCourt = new Court({
      ...courtSettings,
      id: generateUniqueId(),
    });

    // Save the court data to local storage
    const existingCourts = JSON.parse(localStorage.getItem('courts')) || [];
    localStorage.setItem('courts', JSON.stringify([...existingCourts, newCourt]));

    // Navigate to the newly created court's page
    navigate(`/court_home_page/${newCourt.id}?courtName=${newCourt.courtName}`);
  };

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  return (
    <div className="create-player-page-style">
      <h1 className='CP-title'>Create New Court</h1>
      <div className="input-container">
        <label htmlFor="courtName">Name:</label>
        <input
          type="text"
          id="courtName"
          name="courtName"
          value={courtSettings.courtName}
          onChange={handleInputChange}
        />
      </div>
      <button className='calc-save-button' onClick={handleCreateCourt}>
        Create Court
      </button>
      <Link to="/" className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default CreateCourtPage;
