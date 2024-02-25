import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Player from './Player';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './CreatePlayerPage.css';


const EditPlayerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');

  const [playerAttributes, setPlayerAttributes] = useState({
    name: '',
    photo: '',
    scoring: 0,
    passing: 0,
    speed: 0,
    physical: 0,
    defence: 0,
    threePtShot: 0,
    rebound: 0,
    ballHandling: 0,
    postUp: 0,
    height: 0,
  });

  const [errors, setErrors] = useState({
    name: '',
    height: '',
    scoring: '',
    passing: '',
    speed: '',
    physical: '',
    defence: '',
    threePtShot: '',
    rebound: '',
    ballHandling: '',
    postUp: '',
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

  const handleUpdatePlayer = (currCourtName,currCourtType) => {
    const nameError = validateName();
    const heightError = validateNumber(playerAttributes.height, 50, 300, 'height');

    const numericalAttributes = {
      scoring: parseInt(playerAttributes.scoring, 10),
      passing: parseInt(playerAttributes.passing, 10),
      speed: parseInt(playerAttributes.speed, 10),
      physical: parseInt(playerAttributes.physical, 10),
      defence: parseInt(playerAttributes.defence, 10),
      threePtShot: parseInt(playerAttributes.threePtShot, 10),
      rebound: parseInt(playerAttributes.rebound, 10),
      ballHandling: parseInt(playerAttributes.ballHandling, 10),
      postUp: parseInt(playerAttributes.postUp, 10),
      height: parseInt(playerAttributes.height, 10),
    };

    const attributesErrors = {
      scoring: validateNumber(numericalAttributes.scoring, 0, 99, 'scoring'),
      passing: validateNumber(numericalAttributes.passing, 0, 99, 'passing'),
      speed: validateNumber(numericalAttributes.speed, 0, 99, 'speed'),
      physical: validateNumber(numericalAttributes.physical, 0, 99, 'physical'),
      defence: validateNumber(numericalAttributes.defence, 0, 99, 'defence'),
      threePtShot: validateNumber(numericalAttributes.threePtShot, 0, 99, 'threePtShot'),
      rebound: validateNumber(numericalAttributes.rebound, 0, 99, 'rebound'),
      ballHandling: validateNumber(numericalAttributes.ballHandling, 0, 99, 'ballHandling'),
      postUp: validateNumber(numericalAttributes.postUp, 0, 99, 'postUp'),
    };

    setErrors({
      name: nameError,
      height: heightError,
      ...attributesErrors,
    });
    const storedPlayers = JSON.parse(localStorage.getItem(`court_${courtId}_players`)) || [];

    if (!nameError && !heightError && !Object.values(attributesErrors).some(error => error !== '')) {
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
         navigate(`/edit_success/${courtId}?overall=${courts[courtIndex].players[playerIndex].overall}&name=${encodeURIComponent(courts[courtIndex].players[playerIndex].name)}&courtName=${encodeURIComponent(currCourtName)}&courtType=${encodeURIComponent(currCourtType)}`);
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
      attributes.scoring * 10 +
      attributes.passing * 5 +
      attributes.speed * 5 +
      attributes.physical * 6 +
      attributes.defence * 9 +
      attributes.threePtShot * 9 +
      attributes.rebound * 6 +
      attributes.ballHandling * 4 +
      attributes.postUp * 3 +
      (attributes.height / 2) * 8;

    const average = sum / 65;

    // Round to the nearest whole number
    return Math.round(average);
  };

  return (
    <div className="create-player-page-style2">
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
        <label htmlFor="height">Height (cm):</label>
        <input
          type="number"
          id="height"
          name="height"
          value={playerAttributes.height}
          onChange={handleInputChange}
        />
        {errors.height && <p className="error-message">{errors.height}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="scoring">Scoring:</label>
        <input
          type="number"
          id="scoring"
          name="scoring"
          value={playerAttributes.scoring}
          onChange={handleInputChange}
        />
        {errors.scoring && <p className="error-message">{errors.scoring}</p>}
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
        <label htmlFor="threePtShot">3 PT Shot:</label>
        <input
          type="number"
          id="threePtShot"
          name="threePtShot"
          value={playerAttributes.threePtShot}
          onChange={handleInputChange}
        />
        {errors.threePtShot && <p className="error-message">{errors.threePtShot}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="rebound">Rebound:</label>
        <input
          type="number"
          id="rebound"
          name="rebound"
          value={playerAttributes.rebound}
          onChange={handleInputChange}
        />
        {errors.rebound && <p className="error-message">{errors.rebound}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="ballHandling">Ball Handling:</label>
        <input
          type="number"
          id="ballHandling"
          name="ballHandling"
          value={playerAttributes.ballHandling}
          onChange={handleInputChange}
        />
        {errors.ballHandling && <p className="error-message">{errors.ballHandling}</p>}
      </div>

      <div className="input-container">
        <label htmlFor="postUp">Post Up:</label>
        <input
          type="number"
          id="postUp"
          name="postUp"
          value={playerAttributes.postUp}
          onChange={handleInputChange}
        />
        {errors.postUp && <p className="error-message">{errors.postUp}</p>}
      </div>
      <button className='calc-save-button' onClick={() => handleUpdatePlayer(currCourtName, currCourtType)}>Update Player</button>
      <Link to={`/court_home_page/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default EditPlayerPage;
