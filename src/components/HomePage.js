import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './HomePage.css';





const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { search } = useLocation();
  const { courtId } = useParams();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');


  useEffect(() => {
    // Fetch courts and then players for the selected court from localStorage
    const courts = JSON.parse(localStorage.getItem('courts')) || [];
    const currentCourt = courts.find(court => court.id === courtId);
    const storedPlayers = currentCourt ? currentCourt.players : [];
    setPlayers(storedPlayers);
  }, [courtId]);

  const handleDeletePlayer = (event, playerToDelete) => {
    event.preventDefault();
    event.stopPropagation();
  
    const isConfirmed = window.confirm(`Are you sure you want to delete ${playerToDelete.name}?`);
  
    if (isConfirmed) {
      // Retrieve the full list of courts from localStorage
      const courts = JSON.parse(localStorage.getItem('courts')) || [];
      // Find the current court by courtId
      const currentCourtIndex = courts.findIndex(court => court.id === courtId);
  
      if (currentCourtIndex !== -1) {
        // Filter out the player to be deleted
        const updatedPlayers = courts[currentCourtIndex].players.filter(player => player.id !== playerToDelete.id);
        // Update the players array for the current court
        courts[currentCourtIndex].players = updatedPlayers;
  
        // Save the updated courts array to localStorage
        localStorage.setItem('courts', JSON.stringify(courts));
  
        // Update the local state to reflect the changes
        setPlayers(updatedPlayers);
      } else {
        console.error('Court not found');
      }
  
      setSelectedPlayer(null);
    }
  };


  return (
    <div className="home-page-style3">
       <Link to="/" className="back-to-mycourts-button">
        Back to MyCourts
      </Link>
      <h1 className="HP-title">{currCourtName} Basketball</h1>
      <Link to={`/new-game/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="create-game-button">
      Create New Game
      </Link>
      <h2 className='HP-registered-playerss'>Registered Players:</h2>
      <div className="player-list">
        {players.map((player) => (
          <Link to={`/player/${player.id}/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}/`} className="player-link">
            <div key={player.id} className="player-cube" onMouseEnter={() => setSelectedPlayer(player)} onMouseLeave={() => setSelectedPlayer(null)}>
              {player.name}
              <p>{player.overall}</p>
              <div className="tooltipsnew">
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


      <Link to={`/new-player/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="create-player-buttonn">
        Create New Player
      </Link>
    </div>
  );
};

export default HomePage;
