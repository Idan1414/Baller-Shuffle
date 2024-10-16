import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './FootballCourtPage.css';
import '../BackHomeButton.css';



const FootballHomePage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myCreatorId, setMyCreatorId] = useState(-1);
  const [currCourtName, setCourtName] = useState('');
  const [currCourtType, setCourtType] = useState('');
  const { search } = useLocation();
  const { courtId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');

  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  }

  useEffect(() => {
    // user_id validation
    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/'); // Redirect to home if not authorized
      return;
    }

    // Check if the user has access to the court
    if (!decodedToken.courts || !decodedToken.courts.includes(courtId)) {
      navigate('/'); // Redirect to home if the user does not have access to this court
      return;
    }

    // Check if the user is an admin
    fetch(`http://localhost:5000/api/is_admin/${currUserId}/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsAdmin(data.isAdmin); // Set admin status from response
      })
      .catch((error) => {
        console.error('Error fetching admin status:', error);
      });




    // Get court info
    fetch(`http://localhost:5000/api/court_info/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourtName(data[0].courtName); // Set courtName from response
        setCourtType(data[0].courtType); // Set courtName from response
      })
      .catch((error) => {
        console.error('Error fetching court info :', error);
      });




    // Fetch Football Players from DB according to the courtId
    fetch(`http://localhost:5000/api/football_players/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        var storedPlayers = data;
        storedPlayers = storedPlayers.sort((a, b) => b.id - a.id);
        setPlayers(storedPlayers);
        // Set myCreatorId here
        const myPlayer = storedPlayers.find((player) => player.user_fk == currUserId);
        if (myPlayer) {
          setMyCreatorId(myPlayer.creator_user_fk);
        }
      })
      .catch((error) => console.error(error));
  }, [courtId]);



  const handleUpdateCourtName = async () => {
    const newCourtName = prompt('Enter the new court name:', currCourtName);
    if (newCourtName && newCourtName !== currCourtName) {
      try {
        const response = await fetch(`http://localhost:5000/api/update_court_name/${courtId}`, {
          method: 'PUT',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courtName: newCourtName }),
        });

        if (response.ok) {
          setCourtName(newCourtName); // Update the state with the new court name
        } else {
          alert('Failed to update court name');
        }
      } catch (error) {
        console.error('Error updating court name:', error);
        alert('Error updating court name');
      }
    }
  };

  const handleDeletePlayer = async (event, playerId,playerUserFk) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmDelete = window.confirm('Are you sure you want to delete this player?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/delete_player/${playerId}/${courtId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setPlayers(players.filter((player) => player.playerId !== playerId)); // Remove the player from the state
        alert('Player deleted successfully');
        if(playerUserFk== currUserId){
          navigate(`/courts_page/${currUserId}`)
        }
      } else {
        alert('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error deleting player');
    }
  };

  return (
    <div className="football-home-page-style">
      <h1 className="HP-football-title">
        {currCourtName} {currCourtType}
      </h1>
      <Link to={`/courts_page/${currUserId}`} className="back-home-button">
        Back to MyCourts
      </Link>
      {isAdmin && (
        <div class="admin-mode">
          <h2>Admin Mode</h2>
          <button class="update-court-button" onClick={handleUpdateCourtName}>
            Update Court Name
          </button>
        </div>

      )}

      <div className="button-container">
        <Link
          to={`/new-game-football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
          className="football-create-game-button"
        >
          Create New Manual Game
        </Link>

        <Link
          to={`/scheduled-games/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
          className="football-scheduled-games-button"
        >
          Scheduled Games
        </Link>
      </div>


      <h2 className="HP-registered-players2">Registered Players:</h2>
      <Link
        to={`/new-player-football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
        className="create-player-button-football"
      >
        Add New Player
      </Link>
      <div className="player-list-football">
        {players.map((player) => {
          // Determine the appropriate CSS class for the player
          let playerClass = '';
          if (player.user_fk == currUserId) {
            playerClass = 'player-cube-football--my-player';
          } else if (player.creator_user_fk == currUserId || player.user_fk == myCreatorId) {
            playerClass = 'player-cube-football--creator-player';
          } else {
            playerClass = 'player-cube-football-not--related-player';
          }

          const overallAndDeletionDisplay =
            player.user_fk == currUserId ||
              player.creator_user_fk == currUserId ||
              isAdmin
              ? player.overall
              : '';



          //A user can edit only the players he created
          const playerClickable = player.creator_user_fk == currUserId || isAdmin

          // Conditionally render the clickable link or a non-clickable div
          const playerContent = (
            <div
              className={`player-cube-football ${playerClass}`}
              onMouseEnter={() => setSelectedPlayer(player)}
              onMouseLeave={() => setSelectedPlayer(null)}
            >
              {player.name}
              <p>{overallAndDeletionDisplay}</p>
              {overallAndDeletionDisplay && ( // Tooltip appears only if player is clickable
                <div className="tooltipsnew-football">
                  <p className="player-info2">Finishing: {player.finishing}</p>
                  <p className="player-info2">Passing: {player.passing}</p>
                  <p className="player-info2">Speed: {player.speed}</p>
                  <p className="player-info2">Physical: {player.physical}</p>
                  <p className="player-info2">Defence: {player.defence}</p>
                  <p className="player-info2">Dribbling: {player.dribbling}</p>
                  <p className="player-info2">Header: {player.header}</p>
                </div>
              )}
              {selectedPlayer === player && overallAndDeletionDisplay && (
                <div className="delete-player-button" onClick={(e) => handleDeletePlayer(e, player.playerId,player.user_fk)}>
                  🗑️
                </div>
              )}
            </div>
          );

          return playerClickable ? (
            <Link
              key={player.playerId}
              to={`/player-football/${player.playerId}/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
              className="player-link2"
            >
              {playerContent}
            </Link>
          ) : (
            <div key={player.playerId} className="player-link2">
              {playerContent}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FootballHomePage;
