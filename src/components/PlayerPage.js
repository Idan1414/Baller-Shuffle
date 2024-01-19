import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Player from './Player';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import './CreatePlayerPage.css';


const PlayerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courtId } = useParams();

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
    // Fetch the player data based on the ID and courtId
    const storedPlayers = JSON.parse(localStorage.getItem(`court_${courtId}_players`)) || [];
    const selectedPlayer = storedPlayers.find(player => player.id === id);

    if (selectedPlayer) {
      setPlayerAttributes({
        name: selectedPlayer.name || '',
        photo: selectedPlayer.photo || '',
        scoring: selectedPlayer.scoring || 0,
        passing: selectedPlayer.passing || 0,
        speed: selectedPlayer.speed || 0,
        physical: selectedPlayer.physical || 0,
        defence: selectedPlayer.defence || 0,
        threePtShot: selectedPlayer.threePtShot || 0,
        rebound: selectedPlayer.rebound || 0,
        ballHandling: selectedPlayer.ballHandling || 0,
        postUp: selectedPlayer.postUp || 0,
        height: selectedPlayer.height || 0,
      });
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
    const existingPlayerIndex = storedPlayers.findIndex(player => player.id === id);

    if (!nameError && !heightError && !Object.values(attributesErrors).some((error) => error !== '')) {
      // All validations passed, update the existing player if it exists
      const storedPlayers = JSON.parse(localStorage.getItem(`court_${courtId}_players`)) || [];
      const existingPlayerIndex = storedPlayers.findIndex(player => player.id === id);

      if (existingPlayerIndex !== -1) {
        const updatedPlayer = new Player({
          ...storedPlayers[existingPlayerIndex],
          ...playerAttributes,
          ...numericalAttributes,
          overall: calculateOverall(numericalAttributes),
        });

        storedPlayers[existingPlayerIndex] = updatedPlayer;
        localStorage.setItem(`court_${courtId}_players`, JSON.stringify(storedPlayers));
        navigate(`/edit_success/${courtId}?overall=${updatedPlayer.overall}&name=${updatedPlayer.name}`);
      }
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
    <div className="create-player-page-style">
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
      <button className='calc-save-button' onClick={handleUpdatePlayer}>Update Player</button>
      <Link to={`/court_home_page/${courtId}`} className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default PlayerPage;
