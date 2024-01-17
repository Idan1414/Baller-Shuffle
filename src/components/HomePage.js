import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';



const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    // Retrieve players from local storage
    const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    setPlayers(storedPlayers);
  }, []);


  const handleDeletePlayer = (event, player) => {
    // Prevent the event from propagating to the parent (Link)
    event.preventDefault();
    event.stopPropagation();

    // Show a confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to delete ${player.name}?`);

    if (isConfirmed) {
      // Filter out the selected player and update the state
      const updatedPlayers = players.filter((p) => p.id !== player.id);
      setPlayers(updatedPlayers);

      // Save the updated players to local storage
      localStorage.setItem('players', JSON.stringify(updatedPlayers));

      // Clear the selected player after deletion
      setSelectedPlayer(null);
    }
  };


  return (
    <div className="home-page-style">
      <h1 className="HP-title">NeighboRandom Basketball</h1>
      <Link to="/new-game" className="create-game-button">
        Create New Game
      </Link>
      <h2 className='HP-registered-players'>Registered Players:</h2>
      <div className="player-list">
        {players.map((player) => (
          <Link to={`/player/${player.id}`} className="player-link">
            <div key={player.id} className="player-cube" onMouseEnter={() => setSelectedPlayer(player)} onMouseLeave={() => setSelectedPlayer(null)}>
              {player.name}
              <p>{player.overall}</p>
              <div className="tooltips">
                <p>Height: {player.height}</p>
                <p>Scoring: {player.scoring}</p>
                <p>Passing: {player.passing}</p>
                <p>Speed: {player.speed}</p>
                <p>Physical: {player.physical}</p>
                <p>Defence: {player.defence}</p>
                <p>3PtShot: {player.threePtShot}</p>
                <p>Rebound: {player.rebound}</p>
                <p>BallHandle: {player.ballHandling}</p>
                <p>PostUp: {player.postUp}</p>
              </div>
              {selectedPlayer === player && (
                <div className="delete-player-button" onClick={(e) => handleDeletePlayer(e, player)}>
                  🗑️
                </div>

              )}
            </div>
          </Link>
        ))}
      </div>


      <Link to="/new-player" className="create-player-button">
        Create New Player
      </Link>
    </div>
  );
};

export default HomePage;
