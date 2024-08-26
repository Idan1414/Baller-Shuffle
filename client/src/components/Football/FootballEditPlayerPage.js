import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './FootballCreatePlayerPage.css';


const EditPlayerPage = () => {
  const navigate = useNavigate();
  const {id} = useParams();
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


  useEffect(() => {
    // Retrieve the full list of courts
    const courts = JSON.parse(localStorage.getItem('courts')) || [];
    // Find the court by courtId
    const currentCourt = courts.find(court => court.id === courtId);
    const selectedPlayer = currentCourt ? currentCourt.players.find(player => player.id === id) : null;
  
    if (selectedPlayer) {
      setPlayerAttributes({ ...selectedPlayer });
    }
  }, [id, courtId]);

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

  const handleUpdatePlayer = () => {
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
    const storedPlayers = JSON.parse(localStorage.getItem(`court_${courtId}_players`)) || [];

    if (!nameError && !Object.values(attributesErrors).some(error => error !== '')) {
      // Retrieve the full list of courts
      const courts = JSON.parse(localStorage.getItem('courts')) || [];
      // Find the court and player by their IDs
      const courtIndex = courts.findIndex(court => court.id === courtId);
      if (courtIndex !== -1) {
        const playerIndex = courts[courtIndex].players.findIndex(player => player.id === id);
  
        if (playerIndex !== -1) {
          // Update the player's attributes
          courts[courtIndex].players[playerIndex] = {
            ...courts[courtIndex].players[playerIndex],
            ...playerAttributes,
            ...numericalAttributes,
            overall: calculateOverall(numericalAttributes),
          };

         // Save the updated courts array back to localStorage
         localStorage.setItem('courts', JSON.stringify(courts));
         navigate(`/edit_success_football/${courtId}?overall=${courts[courtIndex].players[playerIndex].overall}&name=${encodeURIComponent(courts[courtIndex].players[playerIndex].name)}&courtName=${encodeURIComponent(currCourtName)}&courtType=${encodeURIComponent(currCourtType)}`);
       } else {
         console.error('Player not found');
       }
     } else {
       console.error('Court not found');
    }
  }
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
      <h1 className='CP-title'>Edit Player</h1>
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
      <button className='calc-save-button' onClick={() => handleUpdatePlayer(currCourtName, currCourtType)}>Update Player</button>
      <Link to={`/court_home_page_football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default EditPlayerPage;
