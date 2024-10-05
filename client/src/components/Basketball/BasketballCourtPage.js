import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './BasketballCourtPage.css';





const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // State to hold admin status
  const { search } = useLocation();
  const { courtId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');


  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  }



  useEffect(() => {
    //user_id validation
    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/'); // Redirect to home if not authorized
      return;
    }


    // Check if the user is an admin
    fetch(`http://localhost:5000/api/is_admin/${currUserId}/${courtId}`, {
      headers: {
        'Authorization': token,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.isAdmin); // Log admin status
        setIsAdmin(data.isAdmin); // Set admin status from response
      })
      .catch(error => {
        console.error('Error fetching admin status:', error);
      });

    //Fetch Players from DB according to the courtId
    fetch(`http://localhost:5000/api/players/${courtId}`, {
      headers: {
        'Authorization': token,
      },
    })
      .then(response => response.json())
      .then(data => {
        var storedPlayers = data;
        storedPlayers = storedPlayers.sort((a, b) => b.overall - a.overall);
        setPlayers(storedPlayers);
      })
      .catch(error => console.error(error));
  }, [courtId]);





  const handleDeletePlayer = async (event, playerId) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmDelete = window.confirm('Are you sure you want to delete this player?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/delete_player/${playerId}/${courtId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setPlayers(players.filter(player => player.playerId !== playerId)); // Remove the player from the state
        alert('Player deleted successfully');
      } else {
        alert('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error deleting player');
    }
  };


  return (
    <div className="basketball-home-page-style">
      <h1 className="HP-basketball-title">{currCourtName} {currCourtType}</h1>
      <Link to={`/courts_page/${currUserId}`} className="back-to-mycourts-button2">
        Back to MyCourts
      </Link>
      <Link to={`/new-game/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="basketball-create-game-button">
        Create New Game
      </Link>
      <h2 className='HP-registered-playerss'>Registered Players:</h2>
      <div className="player-list22">
        {players.map((player) => {
          // Determine the appropriate CSS class for the player
          let playerClass = '';
          if (player.user_fk == currUserId) {
            playerClass = 'player-cube2--my-player'; 
          } else if (player.creator_user_fk == currUserId) {
            playerClass = 'player-cube2--creator-player'; 
          } else {
            playerClass = 'player-cube2-not--related-player'; 
          }
          return (
            <Link
              key={player.playerId}
              to={`/player/${player.playerId}/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
              className="player-link2"
            >

              <div
                className={`player-cube2 ${playerClass}`} // Apply the determined class here
                onMouseEnter={() => setSelectedPlayer(player)}
                onMouseLeave={() => setSelectedPlayer(null)}
              >
                {player.name}
                <p>{player.overall}</p>
                <div className="tooltipsnew2">
                  <p className="player-info2">Height: {player.height}</p>
                  <p className="player-info2">Scoring: {player.scoring}</p>
                  <p className="player-info2">Passing: {player.passing}</p>
                  <p className="player-info2">Speed: {player.speed}</p>
                  <p className="player-info2">Physical: {player.physical}</p>
                  <p className="player-info2">Defence: {player.defence}</p>
                  <p className="player-info2">3PtShot: {player.threePtShot}</p>
                  <p className="player-info2">Rebound: {player.rebound}</p>
                  <p className="player-info2">BallHandle: {player.ballHandling}</p>
                  <p className="player-info2">PostUp: {player.postUp}</p>
                </div>
                {selectedPlayer === player && isAdmin && (
                  <div className="delete-player-button" onClick={(e) => handleDeletePlayer(e, player.playerId)}>
                    🗑️
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <Link to={`/new-player/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="create-player-button2">
        Add New Player
      </Link>
    </div>
  );

};

export default HomePage;
