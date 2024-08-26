import React, { useState } from 'react';
import Player from './FootballPlayer';
import { Link, useNavigate,useLocation } from 'react-router-dom';
import './FootballCreatePlayerPage.css';
import { useParams } from 'react-router-dom';


const FootballCreatePlayerPage = () => {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');

  const [playerAttributes, setPlayerAttributes] = useState({
    name: '',
    photo: '',
    finishing: 0,
    passing: 0,
    speed: 0,
    physical: 0,
    defence: 0,
    dribbling: 0,
    header: 0,
  });

  const [errors, setErrors] = useState({
    name: '',
    finishing: '',
    passing: '',
    speed: '',
    physical: '',
    defence: '',
    dribbling: '',
    header: '',
  });

  const validateName = () => {
    // Add your name validation logic here
    const isValid = /^[a-zA-Z\s]+$/.test(playerAttributes.name);
    return isValid ? '' : 'Please use only letters (uppercase or lowercase) and spaces';
  };

  const validateNumber = (value, min, max, fieldName) => {
    if (isNaN(value) || value < min || value > max || value === '') {
      return `Please choose a number between ${min}-${max}`;
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerAttributes((prevAttributes) => ({ ...prevAttributes, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCreatePlayer = () => {
    const nameError = validateName();

    const numericalAttributes = {
      finishing: parseInt(playerAttributes.finishing, 10),
      passing: parseInt(playerAttributes.passing, 10),
      speed: parseInt(playerAttributes.speed, 10),
      physical: parseInt(playerAttributes.physical, 10),
      defence: parseInt(playerAttributes.defence, 10),
      dribbling: parseInt(playerAttributes.dribbling, 10),
      header: parseInt(playerAttributes.header, 10),
    };

    const attributesErrors = {
      finishing: validateNumber(numericalAttributes.finishing, 0, 99, 'finishing'),
      passing: validateNumber(numericalAttributes.passing, 0, 99, 'passing'),
      speed: validateNumber(numericalAttributes.speed, 0, 99, 'speed'),
      physical: validateNumber(numericalAttributes.physical, 0, 99, 'physical'),
      defence: validateNumber(numericalAttributes.defence, 0, 99, 'defence'),
      dribbling: validateNumber(numericalAttributes.dribbling, 0, 99, 'dribbling'),
      header: validateNumber(numericalAttributes.header, 0, 99, 'header'),
    };

    setErrors({
      name: nameError,
      ...attributesErrors,
    });

    if (!nameError && !Object.values(attributesErrors).some((error) => error !== '')) {
      // All validations passed, create and save player
      const newPlayer = new Player({
        ...playerAttributes,
        ...numericalAttributes,
        id: generateUniqueId(),
        overall: calculateOverall(numericalAttributes),
      });

      // Retrieve the full list of courts
      const courts = JSON.parse(localStorage.getItem('courts')) || [];
      // Find the court by courtId
      const courtIndex = courts.findIndex(court => court.id === courtId);

      if (courtIndex !== -1) {
        // Add the new player to the players array within the found court object
        courts[courtIndex].players.push(newPlayer);

        // Save the updated courts array back to localStorage
        localStorage.setItem('courts', JSON.stringify(courts));
      } else {
        console.error('Court not found');
      } 
      navigate(`/creation_success_football/${courtId}?overall=${newPlayer.overall}&name=${newPlayer.name}&courtName=${currCourtName}&courtType=${currCourtType}`);

    }


  };



  // Implement a function to generate a unique ID
  const generateUniqueId = () => {
    // You can use a library like uuid to generate a unique ID
    // For simplicity, this example uses a random number, but it's not guaranteed to be unique
    return Math.random().toString(36).substr(2, 9);
  };

  const calculateOverall = (attributes) => {
    const sum =
      attributes.finishing * 10 +
      attributes.passing * 6 +
      attributes.speed * 8 +
      attributes.physical * 5 +
      attributes.defence * 5 +
      attributes.dribbling * 9 +
      attributes.header * 3
    const average = sum / 46;

    // Round to the nearest whole number
    return Math.round(average);
  };

  return (
    <div className="football-create-player-page-style">
      <h1 className='CP-title'>Create New Player</h1>
      <div className="input-container">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={playerAttributes.name}
          onChange={handleInputChange}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>


      <div className="input-container">
        <label htmlFor="finishing">Finishing:</label>
        <input
          type="number"
          id="finishing"
          name="finishing"
          value={playerAttributes.finishing}
          onChange={handleInputChange}
        />
        {errors.finishing && <p className="error-message">{errors.finishing}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="passing">Passing:</label>
        <input
          type="number"
          id="passing"
          name="passing"
          value={playerAttributes.passing}
          onChange={handleInputChange}
        />
        {errors.passing && <p className="error-message">{errors.passing}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="speed">Speed:</label>
        <input
          type="number"
          id="speed"
          name="speed"
          value={playerAttributes.speed}
          onChange={handleInputChange}
        />
        {errors.speed && <p className="error-message">{errors.speed}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="physical">Physical:</label>
        <input
          type="number"
          id="physical"
          name="physical"
          value={playerAttributes.physical}
          onChange={handleInputChange}
        />
        {errors.physical && <p className="error-message">{errors.physical}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="defence">Defence:</label>
        <input
          type="number"
          id="defence"
          name="defence"
          value={playerAttributes.defence}
          onChange={handleInputChange}
        />
        {errors.defence && <p className="error-message">{errors.defence}</p>}
      </div>



      <div className="input-container">
        <label htmlFor="dribbling">Dribbling:</label>
        <input
          type="number"
          id="dribbling"
          name="dribbling"
          value={playerAttributes.dribbling}
          onChange={handleInputChange}
        />
        {errors.dribbling && <p className="error-message">{errors.dribbling}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="header">Header:</label>
        <input
          type="number"
          id="header"
          name="header"
          value={playerAttributes.header}
          onChange={handleInputChange}
        />
        {errors.header && <p className="error-message">{errors.header}</p>}
      </div>
      <button className='calc-save-button' onClick={handleCreatePlayer}>
        Create and Calculate Overall
      </button>
      <Link to={`/court_home_page_football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default FootballCreatePlayerPage;
