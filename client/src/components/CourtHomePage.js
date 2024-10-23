import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './CourtHomePage.css';
import './BackHomeButton.css';


const CourtHomePage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myCreatorId, setMyCreatorId] = useState(-1);
  const [currCourtName, setCourtName] = useState('');
  const [currCourtType, setCourtType] = useState('');
  const [playersAPI, setPlayersAPI] = useState('');
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
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/is_admin/${currUserId}/${courtId}`, {
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
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/court_info/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourtName(data[0].courtName); // Set courtName from response
        setCourtType(data[0].courtType); // Set courtName from response
        const api = data[0].courtType === 'Football' ? 'football_players' : 'players';
        setPlayersAPI(api); // Set playersAPI for the next fetch
      })
      .catch((error) => {
        console.error('Error fetching court info :', error);
      });
  }, [courtId, navigate, token, decodedToken]);


  // Fetch Players after setting playersAPI
  useEffect(() => {
    if (playersAPI) {
      fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/${playersAPI}/${courtId}`, {
        headers: {
          Authorization: token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const storedPlayers = data;
          setPlayers(storedPlayers);
          const myPlayer = storedPlayers.find((player) => player.user_fk == currUserId);
          if (myPlayer) {
            setMyCreatorId(myPlayer.creator_user_fk);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [playersAPI, courtId, token, currUserId]);

  const handleUpdateCourtName = async () => {
    const newCourtName = prompt('Enter the new court name:', currCourtName);
    if (newCourtName && newCourtName !== currCourtName) {
      try {
        const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/update_court_name/${courtId}`, {
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

  const handleDeletePlayer = async (event, playerId, playerUserFk) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmDelete = window.confirm('Are you sure you want to delete this player?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/delete_player/${playerId}/${courtId}`,
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
        if (playerUserFk == currUserId) {
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


  const handleAddAdmin = async () => {
    const selectedName = prompt(`Select a player to add as admin: (Only if he is assigned to a user)`);
    if (selectedName === null) {
      return
    }


    const selected = players.find(player => player.name.toLowerCase() === selectedName.toLowerCase());
    if (selected && selected.user_fk) {
      const userId = selected.user_fk;

      try {
        const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/add_admin/${courtId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          alert(`Player ${selected.name} added as admin successfully.`);
        } else if (response.status == 409) {
          alert(`${selected.name} is already admin in this court`)
        }
        else {
          alert('Failed to add admin. Please try again.');
        }
      } catch (error) {
        console.error('Error adding admin:', error);
        alert('Error adding admin');
      }
    } else if (selected) {
      alert('Player is not assigned to a user')
    }
    else {
      alert('Player not found. Please select a valid player.');
    }
  };

  return (
    <div className="basketball-home-page-style">
      <Link to={`/courts_page/${currUserId}`} className="back-home-button">
        Back to MyCourts
      </Link>
      <img src="/HadarLOGO.png" alt="Baller Shuffle Logo" className='logo-image-home-page' />
      <h1 className="HP-basketball-title">
        {currCourtName}
      </h1>
      {isAdmin && (
        <div class="admin-mode">
          <h2>Admin Mode</h2>
          <div className='admin-buttons-container'>
            <button class="update-court-button" onClick={handleUpdateCourtName}>
              Update Court Name
            </button>
            <button class="update-court-button" onClick={handleAddAdmin}>
              Add Admin
            </button>
          </div>
        </div>

      )}

      <div className="button-container">
        {/*maybe STATISTICS button here*/}
        {/* <Link
          to={`/new-game/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
          className="basketball-create-game-button"
        >
          Create New Manual Game
        </Link> */}

        <Link
          to={`/scheduled-games/${courtId}?userId=${currUserId}`}
          className="basketball-scheduled-games-button"
        >
          Scheduled Games
        </Link>
      </div>

      <h2 className="HP-registered-players2">Registered Players:</h2>

      <Link
        to={currCourtType === 'Football'
          ? `/new-player-football/${courtId}?userId=${currUserId}`
          : `/new-player/${courtId}?userId=${currUserId}`
        }
        className="create-player-button-basketball"
      >
        Add New Player
      </Link>

      <div className="player-list-basketball">
        {players && players.length > 0 ? (
          players.map((player) => {
            // Determine the appropriate CSS class for the player
            let playerClass = '';
            if (player.user_fk == currUserId) {
              playerClass = 'player-cube-basketball--my-player';
            } else {
              playerClass = 'player-cube-basketball';
            }


            //A user can see and delete only his player and the players he created
            const overallAndDeletionDisplay =
              player.user_fk == currUserId ||
                player.creator_user_fk == currUserId ||
                isAdmin
                ? player.overall
                : '';


            //A user can edit only the players he created
            const playerClickable = player.creator_user_fk == currUserId || isAdmin

            const renderMedal = player.num_of_mvps != null ? (
              <span className="medal">
                <span className="medal-number">{player.num_of_mvps}</span>
                <span className="ribbon"></span> {/* First Ribbon */}
                <span className="ribbon second-ribbon"></span> {/* Second Ribbon */}
              </span>
            ) : null;

            // Conditionally render the clickable link or a non-clickable div
            const playerContent = (
              <div
                className={`player-cube-basketball ${playerClass}`}
                onMouseEnter={() => setSelectedPlayer(player)}
                onMouseLeave={() => setSelectedPlayer(null)}
              >
                <div className="player-HP-name">{player.name}</div> {/* Apply the class here */}
                <p>{overallAndDeletionDisplay}</p>
                {renderMedal} {/* Add the medal next to the player's name */}

                {overallAndDeletionDisplay && ( // Tooltip appears only if player is clickable
                  currCourtType == 'Football' ? (
                    <div className="tooltipsnew-basketball">
                      <p className="player-info2">Finishing: {player.finishing}</p>
                      <p className="player-info2">Passing: {player.passing}</p>
                      <p className="player-info2">Speed: {player.speed}</p>
                      <p className="player-info2">Physical: {player.physical}</p>
                      <p className="player-info2">Defence: {player.defence}</p>
                      <p className="player-info2">Dribbling: {player.dribbling}</p>
                      <p className="player-info2">Header: {player.header}</p>
                    </div>
                  ) : (
                    <div className="tooltipsnew-basketball">
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
                  )
                )}
                {selectedPlayer === player && overallAndDeletionDisplay && (
                  <div className="delete-player-button" onClick={(e) => handleDeletePlayer(e, player.playerId, player.user_fk)}>
                    🗑️
                  </div>
                )}
              </div>
            );



            return playerClickable ? (
              <Link
                key={player.playerId}
                to={currCourtType === 'Football'
                  ? `/player-football/${player.playerId}/${courtId}?userId=${currUserId}`
                  : `/player/${player.playerId}/${courtId}?userId=${currUserId}`
                }
                className="player-link2"
              >
                {playerContent}
              </Link>
            ) : (
              <div key={player.playerId} className="player-link2">
                {playerContent}
              </div>
            );
          })
        ) : (
          <div style={{ color: 'white' }}>No players in this court yet. Add the first one!</div> // This handles the case when there are no players
        )}
      </div>
    </div>
  );
};

export default CourtHomePage;
