import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './CreateGameModal.css';

const CreateGameModal = ({ onClose, onGameCreated, existingGameData }) => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');
  const { courtId } = useParams();

  // Initialize state with existing game data if provided
  const [gameData, setGameData] = useState({
    court_id: existingGameData?.game_court_id || courtId,
    game_start_time: '',
    registration_open_time: '',
    registration_close_time: '',
    max_players: 15,
    num_of_teams: 3,
    created_by: currUserId,
    location: '',
    description: '',
    max_players_each_user_can_add: 2,
  });


  const [isInitialized, setIsInitialized] = useState(false); // Track if form is initialized

  // Function to format date to 'yyyy-MM-ddThh:mm' for datetime-local input
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Adjust for local timezone offset
    const localDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDateTime.toISOString().slice(0, 16);
  };

  // Populate the form with existing game data if available
  useEffect(() => {
    if (existingGameData && !isInitialized) {
      setGameData({
        ...existingGameData,
        game_start_time: formatDate(existingGameData.game_start_time),
        registration_open_time: formatDate(existingGameData.registration_open_time),
        registration_close_time: formatDate(existingGameData.registration_close_time),
      });
      setIsInitialized(true); // Mark as initialized to avoid overwriting

    }
  }, [existingGameData,isInitialized]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGameData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/${existingGameData ? `update_game/${existingGameData.game_id}` : 'create_game'}`, {
        method: existingGameData ? 'PUT' : 'POST', // Use PUT for updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Failed to save game.');
      }

      onGameCreated(); // Notify the parent component that the game was created/updated
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving the game.');
    }
  };

  return (
    <div className="modal-overlay1">
      <div className="modal">
        <button type="button" className='cancel-button' onClick={onClose}>X</button>
        <h2 className='modal-title'>{existingGameData ? 'Edit Game' : 'Create New Game'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Game Start Time:</label>
            <input
              type="datetime-local"
              name="game_start_time"
              value={gameData.game_start_time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Registration Open Time:</label>
            <input
              type="datetime-local"
              name="registration_open_time"
              value={gameData.registration_open_time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Registration Close Time:</label>
            <input
              type="datetime-local"
              name="registration_close_time"
              value={gameData.registration_close_time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Max Players In The Game:</label>
            <input
              type="number"
              name="max_players"
              value={gameData.max_players}
              onChange={handleChange}
              min={1}
              max={150}
              required
            />
          </div>
          <div className="form-group">
            <label>Max Players Each User Can Register:</label>
            <input
              type="number"
              name="max_players_each_user_can_add"
              value={gameData.max_players_each_user_can_add}
              onChange={handleChange}
              min={1}
              max={150}
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Teams:</label>
            <input
              type="number"
              name="num_of_teams"
              value={gameData.num_of_teams}
              onChange={handleChange}
              min={1}
              max={50}
              required
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={gameData.location}
              onChange={handleChange}
              minLength={0} 
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={gameData.description}
              onChange={handleChange}
              minLength={0} 
              maxLength={1000}
            ></textarea>
          </div>

          <button type="submit" className='submit-button1'>{existingGameData ? 'Update Game Settings' : 'Create Game'}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;
