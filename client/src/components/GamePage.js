import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BasketballTeam from './Basketball/Team.js';
import FootballTeam from './Football/FootballTeam.js';
import CreateGameModal from './CreateGameModal';
import './GamePage.css';
import './BackHomeButton.css';


// Modal Component

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-button">X</button>
        {children}
      </div>
    </div>
  );
};

const PlayerCube = ({ player, isSelected, onClick }) => {
  return (
    <div
      className={`player-cube ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {player.name}
    </div>
  );
};


const GamePage = () => {
  const navigate = useNavigate();
  const { gameId, courtId } = useParams();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCourtCreator, setIsCourtCreator] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isVoteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [numOfPlayersRegistered, setNumOfPlayersRegistered] = useState(0);
  const [maxPlayersEachUserCanAdd, setMaxPlayersEachUserCanAdd] = useState(2);
  const [canRegister, setCanRegister] = useState(false);
  const { search } = useLocation();
  const [registeredPlayers, setRegisteredPlayers] = useState([]); // State for registered players
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');

  const token = localStorage.getItem('token');
  let decodedToken;
  if (token) {
    decodedToken = jwtDecode(token);
  }

  // Fetch game data
  const fetchGame = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/${gameId}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching game details');
      }

      const gameData = await response.json();
      setGame(gameData);
      // console.log(gameData)
      setMaxPlayersEachUserCanAdd(gameData.max_players_each_user_can_add);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  }, [gameId, token]);

  // Fetch game data and admin status
  useEffect(() => {
    const userIdFromUrl = searchParams.get('userId');
    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Check if the user is an admin
        const adminResponse = await fetch(`http://localhost:5000/api/is_admin/${currUserId}/${courtId}`, {
          headers: {
            Authorization: token,
          },
        });
        const adminData = await adminResponse.json();
        setIsAdmin(adminData.isAdmin); // Set admin status from response

        // Fetch game details
        await fetchGame();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate, search, token, decodedToken, fetchGame, currUserId, courtId]); // Added fetchGame to dependencies


  // Fetch players based on court type
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const apiUrl = currCourtType === 'Football'
          ? `http://localhost:5000/api/football_players/${courtId}`
          : `http://localhost:5000/api/players/${courtId}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching players');
        }

        const playersData = await response.json();
        // Sort players by playerName before updating state
        const sortedPlayers = playersData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, [courtId, currCourtType, token]);




  // Check the number of players registered
  useEffect(() => {
    const fetchRegisteredPlayersCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/can-register-players-to-game/${gameId}/${currUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (response.ok) {
          const { playerCount } = await response.json();
          setNumOfPlayersRegistered(playerCount);
        }
      } catch (error) {
        console.error('Error fetching registered players count:', error);
      }
    };

    fetchRegisteredPlayersCount();
  }, [gameId, currUserId, token, numOfPlayersRegistered, isRegisterModalOpen, registeredPlayers]);

  // Check if the user can register
  useEffect(() => {
    setCanRegister(numOfPlayersRegistered < maxPlayersEachUserCanAdd); // User can register if they have less than allowed numOfPlayers registered
  }, [numOfPlayersRegistered, isRegisterModalOpen, registeredPlayers, maxPlayersEachUserCanAdd]);




  // Fetch registered players for the game
  useEffect(() => {
    const fetchRegisteredPlayers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/game_registrations/${gameId}`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching registered players or no players registered yet');
        }

        const registrations = await response.json();

        // Sort the registrations by registration_time
        const sortedRegistrations = registrations.sort((a, b) =>
          new Date(a.registrationDate) - new Date(b.registrationDate)
        );
        setRegisteredPlayers(sortedRegistrations);
      } catch (error) {
        console.error('Error fetching registered players:', error);
      }
    };

    if (gameId) {
      fetchRegisteredPlayers();
    }
  }, [gameId, token, isRegisterModalOpen]);


  // Delete player registration
  const handlePlayerDelete = async (playerId, playerName) => {


    const confirmDelete = window.confirm(`Are you sure you want to remove ${playerName} from this game?`);
    if (!confirmDelete) return;


    try {
      const response = await fetch(`http://localhost:5000/api/game_registrations_deletion/${gameId}/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Error deleting player registration');
      }

      // Remove the deleted player from the registeredPlayers list
      setRegisteredPlayers((prev) => prev.filter(player => player.playerId !== playerId));

    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete the player. Please try again later.');
    }
  };


  const handleRegistration = async () => {

    try {
      const response = await fetch(`http://localhost:5000/api/register-players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          playersIds: selectedPlayers,
          gameId,
          userId: currUserId
        }),
      });

      if (!response.ok) {
        throw new Error('Error registering players');
      }

      const result = await response.text(); // or response.json() if your API returns JSON
      console.log(result); // Log success message
      setRegisterModalOpen(false); // Close the modal
      setSelectedPlayers([]); // Clear selected players

    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Function to handle player selection
  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers((prevSelected) => {
      if (prevSelected.includes(playerId)) {
        // Deselect player if already selected
        return prevSelected.filter(id => id !== playerId);
      } else if (prevSelected.length < maxPlayersEachUserCanAdd - numOfPlayersRegistered) {
        // Select player if not more than the number allow is selected
        return [...prevSelected, playerId];
      }
      return prevSelected; // Do not select if already selected all the players allowed

    });
  };


  const hasRegistrationPassed = () => {
    const currentTime = new Date();
    return new Date(game.registration_open_time) < currentTime && new Date(game.registration_close_time) > currentTime;
  };


  const isTheGameStartedAnHourAgo = () => {
    const currentTime = new Date();
    const gameStartTime = new Date(game.game_start_time);
    return currentTime >= new Date(gameStartTime.getTime() + 60 * 60 * 1000); // 1 hour after game start time
  };

  const isTheGameStartsInAnHour = () => {
    const currentTime = new Date();
    const gameStartTime = new Date(game.game_start_time);
    return currentTime >= new Date(gameStartTime.getTime() - 60 * 60 * 1000); // 1 hour before game start time
  };

  const handleFootballShuffleTeams = () => {
    // Extract player IDs from mainPlayers
    const mainPlayersIDs = mainPlayers.map(player => player.playerId);


    // Create a list of players to shuffle based on the IDs in mainPlayers
    const playersToShuffle = players.filter(player =>
      mainPlayersIDs.includes(player.playerId)  // Assuming players have player_id
    );

    console.log('Players to Shuffle:', playersToShuffle); // Log the filtered players

    //for randomization, take 1 overall point from each player and spread it randomally
    let overallPointsToSpread = playersToShuffle.length;
    //shuffles the list of players.
    const PlayersToMixOverall = [...playersToShuffle].sort(() => Math.random() - 0.5);
    PlayersToMixOverall.forEach(p => {
      p.overallToMix = (p.overall - 1);
    });
    let playerIndex = 0;
    while (overallPointsToSpread > 0 && playerIndex < playersToShuffle.length) {
      let currPlayer = PlayersToMixOverall[playerIndex];
      let overallPointsToGive = Math.round((Math.random() * 2) + 1);
      currPlayer.overallToMix = (currPlayer.overallToMix + overallPointsToGive);
      overallPointsToSpread = overallPointsToSpread - overallPointsToGive;
      playerIndex++;
    }
    // Sort players by overall in descending order (best players first)
    const sortedPlayers = [...PlayersToMixOverall].sort((a, b) => b.overallToMix - a.overallToMix);

    // Create teams
    const teams = Array.from({ length: game.num_of_teams }, () => new FootballTeam([]));

    // Distribute players to teams in a zigzag pattern
    for (let i = 0; i < sortedPlayers.length; i++) {
      const patternIndex = i % game.num_of_teams;
      const teamIndex = i < game.num_of_teams ? patternIndex : game.num_of_teams - patternIndex - 1;

      // Assign player to the calculated team
      teams[teamIndex].players.push(sortedPlayers[i]);
      teams[teamIndex].calculateTeamStats();
    }

    // Save the teams to local storage
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('selectedPlayers', JSON.stringify(playersToShuffle));

    // Redirect to TeamsPage with state
    navigate(`/teams-football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`, { state: { selectedPlayers } });
  };



  const handleBasketballShuffleTeams = () => {

    // Extract player IDs from mainPlayers
    const mainPlayersIDs = mainPlayers.map(player => player.playerId);

    console.log('Main Players IDs:', mainPlayersIDs); // Log the extracted IDs

    // Create a list of players to shuffle based on the IDs in mainPlayers
    const playersToShuffle = players.filter(player =>
      mainPlayersIDs.includes(player.playerId)  // Assuming players have player_id
    );

    console.log('Players to Shuffle:', playersToShuffle); // Log the filtered players

    //for randomization, take 1 overall point from each player and spread it randomally
    let overallPointsToSpread = playersToShuffle.length;
    //shuffles the list of players.
    const PlayersToMixOverall = [...playersToShuffle].sort(() => Math.random() - 0.5);
    PlayersToMixOverall.forEach(p => {
      p.overallToMix = (p.overall - 1);
    });
    let playerIndex = 0;
    while (overallPointsToSpread > 0 && playerIndex < playersToShuffle.length) {
      let currPlayer = PlayersToMixOverall[playerIndex];
      let overallPointsToGive = Math.round((Math.random() * 2) + 1);
      currPlayer.overallToMix = (currPlayer.overallToMix + overallPointsToGive);
      overallPointsToSpread = overallPointsToSpread - overallPointsToGive;
      playerIndex++;
    }
    // Sort players by overall in descending order (best players first)
    const sortedPlayers = [...PlayersToMixOverall].sort((a, b) => b.overallToMix - a.overallToMix);

    // Create teams
    const teams = Array.from({ length: game.num_of_teams }, () => new BasketballTeam([]));

    // Distribute players to teams in a zigzag pattern
    for (let i = 0; i < sortedPlayers.length; i++) {
      const patternIndex = i % game.num_of_teams;
      const teamIndex = i < game.num_of_teams ? patternIndex : game.num_of_teams - patternIndex - 1;

      // Assign player to the calculated team
      teams[teamIndex].players.push(sortedPlayers[i]);
      teams[teamIndex].calculateTeamStats();
    }

    // Save the teams to local storage
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('selectedPlayers', JSON.stringify(playersToShuffle));

    // Redirect to TeamsPage with state
    navigate(`/teams/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`, { state: { selectedPlayers } });
  };

  const handleGameEdited = () => {
    fetchGame(); // Re-fetch the game to update the settings after game is edited
    setEditModalOpen(false); // Close the modal after game edition
  };





  // Split registered players into main and reserve lists
  const maxPlayers = game ? game.max_players : 0;
  const mainPlayers = registeredPlayers.slice(0, maxPlayers);
  const reservePlayers = registeredPlayers.slice(maxPlayers);


  return (
    <div className="game-page">
      {game ? (
        <>
          <h1 className="game-title">Game Details</h1>
          <div className="button-container">

            <Link
              to={`/scheduled-games/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
              className="back-home-button"
            >
              Back to Scheduled Games
            </Link>
            {isAdmin && (
              <button className="create-game-button" onClick={() => setEditModalOpen(true)}>
                Edit Game Settings
              </button>)}

            {isEditModalOpen && (
              <CreateGameModal
                onClose={() => setEditModalOpen(false)}
                onGameCreated={handleGameEdited} // Pass the callback for game creation
                existingGameData={game}
              />
            )}
          </div>
          <div className="game-details">
            <p><strong>Start Time:</strong> {new Date(game.game_start_time).toLocaleString()}</p>
            <p><strong>Registration Open:</strong> {new Date(game.registration_open_time).toLocaleString()}</p>
            <p><strong>Registration Close:</strong> {new Date(game.registration_close_time).toLocaleString()}</p>
            <p><strong>Max Players:</strong> {game.max_players}</p>
            <p><strong>Max Players Each User Can Register:</strong> {game.max_players_each_user_can_add}</p>
            <p><strong>Number of Teams:</strong> {game.num_of_teams}</p>
            <p><strong>Created By:</strong> {game.created_by.username}</p>
            <p><strong>Location:</strong> {game.location}</p>
            <p><strong>Description:</strong> {game.description}</p>
          </div>
          {hasRegistrationPassed() && canRegister && (
            <button className="register-button" onClick={() => setRegisterModalOpen(true)}>Register Now!</button>
          )}

          {/* Modal for Registration */}
          <Modal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)}>
            <h2>Register up to {maxPlayersEachUserCanAdd - numOfPlayersRegistered} more players for Game</h2>
            <button className="submit-button" onClick={handleRegistration}>Confirm Registration</button>
            <div className="player-selection">
              <h3>Select Players:</h3>
              <div className="player-cube-container">
                {players.map(player => (
                  <PlayerCube
                    key={player.playerId}
                    player={player}
                    isSelected={selectedPlayers.includes(player.playerId)}
                    onClick={() => togglePlayerSelection(player.playerId)}
                  />
                ))}
              </div>
            </div>
          </Modal>

          {/* Registered Players Section */}
          <div className="registered-players">
            <h2>Registered Players</h2>
            {isTheGameStartsInAnHour() && !isTheGameStartedAnHourAgo() && currCourtType == 'Basketball' && (
              <button
                className="back-to-all-games-button"
                onClick={() => handleBasketballShuffleTeams()}
              >
                The basketball game starts soon, SHUFFLE TEAMS NOW !
              </button>
            )}
            {isTheGameStartsInAnHour() && !isTheGameStartedAnHourAgo() && currCourtType == 'Football' && (
              <button
                className="back-to-all-games-button"
                onClick={() => handleFootballShuffleTeams()}
              >
                The football game starts soon, SHUFFLE TEAMS NOW !
              </button>
            )}
            <h3 className='main-reserve-title1'>Main Players:</h3>
            <div className="player-items-container">
              {mainPlayers.length > 0 ? (
                mainPlayers.map(player => (
                  <div key={player.playerId} className="player-item">
                    <span className="player-name">{player.playerName}</span>
                    {(player.userIdCreator == currUserId || player.playerUserId == currUserId) && (
                      <button
                        className="delete-button"
                        onClick={() => handlePlayerDelete(player.playerId, player.playerName)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No main players registered.</p>
              )}
            </div>

            <div className="reserve-players">
              <h3 className='main-reserve-title1'>Reserve Players:</h3>
              <div className="player-items-container">
                {reservePlayers.length > 0 ? (
                  reservePlayers.map(player => (
                    <div key={player.playerId} className="player-item">
                      <span className="player-name">{player.playerName}</span>
                      {(player.userIdCreator == currUserId || player.playerUserId == currUserId) && (
                        <button
                          className="delete-button"
                          onClick={() => handlePlayerDelete(player.playerId, player.playerName)}
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No reserve players registered.</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading game details...</p>
      )}
    </div>
  );
};

export default GamePage;