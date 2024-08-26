import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './FootballCourtPage.css';





const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { search } = useLocation();
  const { courtId } = useParams();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');



  useEffect(() => {
    // Fetch courts and then players for the selected court from localStorage
    const courts = JSON.parse(localStorage.getItem('courts')) || [];
    const currentCourt = courts.find(court => court.id === courtId);
    var storedPlayers = currentCourt ? currentCourt.players : [];
    storedPlayers = storedPlayers.sort((a, b) => b.overall - a.overall);
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
    <div className="football-home-page-style">
     
      <h1 className="HP-football-title">{currCourtName} {currCourtType}</h1>
      <Link to={`/courts_page/${currUserId}`} className="back-to-mycourts-button">
        Back to MyCourts
      </Link>
      <Link to={`/new-game-football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="football-create-game-button">
      Create New Game
      </Link>
      <h2 className='HP-registered-playerss'>Registered Players:</h2>
      <div className="player-list">
        {players.map((player) => (
          <Link to={`/player-football/${player.id}/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="player-link">
            <div key={player.id} className="player-cube" onMouseEnter={() => setSelectedPlayer(player)} onMouseLeave={() => setSelectedPlayer(null)}>
              {player.name}
              <p>{player.overall}</p>
              <div className="tooltipsnew">
                <p>Finishing: {player.finishing}</p>
                <p>Passing: {player.passing}</p>
                <p>Speed: {player.speed}</p>
                <p>Physical: {player.physical}</p>
                <p>Defence: {player.defence}</p>
                <p>Dribbling: {player.dribbling}</p>
                <p>Header: {player.header}</p>
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


      <Link to={`/new-player-football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="create-player-buttonn">
        Create New Player
      </Link>
    </div>
  );
};

export default HomePage;
