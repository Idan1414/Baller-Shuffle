import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './BasketballCourtPage.css';





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
    <div className="basketball-home-page-style">
 
      <h1 className="HP-basketball-title">{currCourtName} {currCourtType}</h1>
      <Link to={`/courts_page/${currUserId}`} className="back-to-mycourts-button">
        Back to MyCourts
      </Link>
      <Link to={`/new-game/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="basketball-create-game-button">
      Create New Game
      </Link>
      <h2 className='HP-registered-playerss'>Registered Players:</h2>
      <div className="player-list22">
        {players.map((player) => (
          <Link to={`/player/${player.id}/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="player-link2">
            <div key={player.id} className="player-cube2" onMouseEnter={() => setSelectedPlayer(player)} onMouseLeave={() => setSelectedPlayer(null)}>
              {player.name}
              <p>{player.overall}</p>
              <div className="tooltipsnew2">
                <p className='player-info2'>Height: {player.height}</p>
                <p className='player-info2'>Scoring: {player.scoring}</p>
                <p className='player-info2'>Passing: {player.passing}</p>
                <p className='player-info2'>Speed: {player.speed}</p>
                <p className='player-info2'>Physical: {player.physical}</p>
                <p className='player-info2'>Defence: {player.defence}</p>
                <p className='player-info2'>3PtShot: {player.threePtShot}</p>
                <p className='player-info2'>Rebound: {player.rebound}</p>
                <p className='player-info2'>BallHandle: {player.ballHandling}</p>
                <p className='player-info2'>PostUp: {player.postUp}</p>
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


      <Link to={`/new-player/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="create-player-button2">
        Create New Player
      </Link>
    </div>
  );
};

export default HomePage;
