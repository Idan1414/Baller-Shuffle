import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BasketballTeam from './Basketball/BasketballTeam.js';
import FootballTeam from './Football/FootballTeam.js';
import CreateGameModal from './CreateGameModal.js';
import GamedayStats from './GamedayStats';
import './GamedayPage.css';
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

const PlayerCube = ({ player, isSelected, onClick, currUserId }) => {
  return (
    <div
      className={`player-cube ${isSelected ? 'selected' : ''} ${player.user_fk == currUserId ? 'my-player-cube' : ''}`}
      onClick={onClick}
    >
      {player.name}
    </div>
  );
};


const GamedayPage = () => {
  const navigate = useNavigate();
  const { gameId, courtId } = useParams();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCourtCreator, setIsCourtCreator] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedMVP, setSelectedMVP] = useState(null);
  const [voteMessage, setVoteMessage] = useState("Please select a player to vote for. If you voted already,\n it will just change your vote.");
  const [showMVPModal, setShowMVPModal] = useState(false);
  const [isVoteForMVPModalOpen, setVoteForMVPModalOpen] = useState(false);
  const [isMvpHasBeenRevealed, setIsMvpHasBeenRevealed] = useState(false);
  const [playerAprrovedNow, setPlayerAprrovedNow] = useState(false);
  const [gameTeams, setGameTeams] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [numOfPlayersRegistered, setNumOfPlayersRegistered] = useState(0);
  const [maxPlayersEachUserCanAdd, setMaxPlayersEachUserCanAdd] = useState(2);
  const [canRegister, setCanRegister] = useState(false);
  const { search } = useLocation();
  const [registeredPlayers, setRegisteredPlayers] = useState([]); // State for registered players
  const searchParams = new URLSearchParams(search);
  const [currCourtName, setCourtName] = useState('');
  const [currCourtType, setCourtType] = useState('');
  const currUserId = searchParams.get('userId');


  //Match creation states 
  const [showMatchCreation, setShowMatchCreation] = useState(false);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [selectedPlayerForMatch, setSelectedPlayerForMatch] = useState(null);
  const [selectingForTeam, setSelectingForTeam] = useState(null);
  const [matches, setMatches] = useState([]);



  const token = localStorage.getItem('token');
  let decodedToken;
  if (token) {
    decodedToken = jwtDecode(token);
  }


  //Page Begining UseEffect
  useEffect(() => {

    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/'); // Redirect to home if not authorized
      return;
    }
    if (!decodedToken.courts || !decodedToken.courts.includes(courtId)) {
      navigate('/'); // Redirect to home if the user does not have access to this court
      return;
    }
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
      })
      .catch((error) => {
        console.error('Error fetching court info :', error);
      });
  }, [courtId, navigate, token, decodedToken]);

  // Fetch game data
  const fetchGame = useCallback(async () => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/game/${gameId}`, {
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
      setMaxPlayersEachUserCanAdd(gameData.max_players_each_user_can_add);
      setIsCourtCreator(gameData.created_by.user_id == currUserId)
      if (gameData.mvps && gameData.mvps.length > 0) {
        setIsMvpHasBeenRevealed(true);
      }
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
        const adminResponse = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/is_admin/${currUserId}/${courtId}`, {
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
      setIsLoading(true); // Start loading
      try {
        const apiUrl = currCourtType == 'Football'
          ? `http://${process.env.REACT_APP_DB_HOST}:5000/api/football_players/${courtId}`
          : `http://${process.env.REACT_APP_DB_HOST}:5000/api/players/${courtId}`;

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
        // Reset selected players when new players data is loaded
        setSelectedPlayers([]);
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoading(false); // End loading regardless of outcome
      }
    };

    if (courtId && currCourtType && token) {
      fetchPlayers();
    }
  }, [courtId, currCourtType, token]);



  //Fetching Teams if they were already Shuffled
  const fetchGameTeams = async () => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/get_game_teams/${gameId}`, {
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      setGameTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5000/api/gameday_matches/${gameId}`,
          {
            headers: {
              'Authorization': token
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, [gameId, token]);

  useEffect(() => {
    fetchGameTeams();
  }, [gameId, courtId, currCourtType, token]);

  // Check the number of players registered
  useEffect(() => {
    const fetchRegisteredPlayersCount = async () => {
      try {
        const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/can-register-players-to-game/${gameId}/${currUserId}`, {
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
        const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/game_registrations/${gameId}`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching registered players or no players registered yet');
        }

        const registrations = await response.json();

        // Sort the registrations by priority (A, B, C) and then by registration_time
        const sortedRegistrations = registrations.sort((a, b) => {
          // Sort by priority (A, B, C) first, then by registration time
          if (a.priority !== b.priority) {
            return a.priority.localeCompare(b.priority);
          }
          return new Date(a.registrationDate) - new Date(b.registrationDate);
        });
        setRegisteredPlayers(sortedRegistrations);
      } catch (error) {
        console.error('Error fetching registered players:', error);
      }
    };

    if (gameId) {
      fetchRegisteredPlayers();
    }
  }, [gameId, token, isRegisterModalOpen, playerAprrovedNow]);


  // Delete player registration
  const handlePlayerDelete = async (playerId, playerName) => {


    const confirmDelete = window.confirm(`Are you sure ${playerName} is not coming to this game?`);
    if (!confirmDelete) return;


    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/game_registrations_deletion/${gameId}/${playerId}`, {
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
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/register-players`, {
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


  //Can register players only if the time has come
  const hasRegistrationArrivedAndNotPassed = () => {
    const currentTime = new Date();
    return new Date(game.registration_open_time) < currentTime && new Date(game.registration_close_time) > currentTime;
  };

  const has24PassedSinceGameStarted = () => {
    const currentTime = new Date();
    const gameStartTime = new Date(game.game_start_time);
    return currentTime >= new Date(gameStartTime.getTime() + 24 * 60 * 60 * 1000);
  };



  const isTheGameStartedAlready = () => {
    const currentTime = new Date();
    const gameStartTime = new Date(game.game_start_time);
    return currentTime >= new Date(gameStartTime.getTime());
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

  const openMVPModal = () => {
    setVoteForMVPModalOpen(true);
    setTimeout(() => setShowMVPModal(true), 0); // Delay to allow CSS transition
  };

  const closeMVPModal = () => {
    setShowMVPModal(false); // Start fade out
    setTimeout(() => setVoteForMVPModalOpen(false), 300); // Wait for the animation to finish before unmounting
  };



  const handleVoteForMVP = async () => {
    if (!selectedMVP) {
      setVoteMessage("You have't selected a player");
      return;
    }

    if (selectedMVP.playerUserId == currUserId) {
      setVoteMessage("You can't select yourself");
      return;
    }

    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/mvp-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          game_id: gameId,
          voter_user_id: currUserId,
          mvp_player_id: selectedMVP.playerId,
        }),
      });

      if (response.status === 200) {
        setVoteMessage("Your vote has been submitted successfully!");
        closeMVPModal();
        setVoteMessage("Please select a player to vote for. If you voted already,\n it will just change your vote.");
        setSelectedMVP(null)
      } else {
        setVoteMessage("There was an issue submitting your vote.");
      }
    } catch (error) {
      console.error("Error voting for MVP:", error);
      setVoteMessage("Error submitting your vote. Please try again.");
    }
  };





  const handleShuffleTeams = () => {

    // Extract player IDs from mainPlayers
    const mainPlayersIDs = mainPlayers.map(player => player.playerId);

    //Get the TEAMS PAGE URL from courtType
    const teamsPageURL = currCourtType == 'Basketball' ? 'teams' : 'teams-football'

    // Create a list of players to shuffle based on the IDs in mainPlayers
    const playersToShuffle = players.filter(player =>
      mainPlayersIDs.includes(player.playerId)  // Assuming players have player_id
    );


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
    let teams;
    if (currCourtType == 'Basketball') {
      teams = Array.from({ length: game.num_of_teams }, () => new BasketballTeam([]));
    }
    else {
      teams = Array.from({ length: game.num_of_teams }, () => new FootballTeam([]));
    }

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
    localStorage.setItem('gameId', gameId);


    // Redirect to TeamsPage with state
    navigate(`/teams/${gameId}/${courtId}?userId=${currUserId}`, { state: { selectedPlayers } });
  };

  const handleGameEdited = () => {
    fetchGame(); // Re-fetch the game to update the settings after game is edited
    setEditModalOpen(false); // Close the modal after game edition
  };

  // Function to map player IDs to names
  const getPlayerNameById = (id) => {
    const player = players.find(p => p.playerId === id);
    return player ? player.name : 'Unknown Player';  // Return the name or 'Unknown Player' if not found
  };



  const revealMVP = async () => {
    try {
      // First, reveal the MVP
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/mvp-votes/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'No votes found for this game') {
          alert("No votes for MVP for this game. Please let the ADMIN know they will need to update the Start Time to 2 hours ago today, and the voting option will open again.");
          return;
        }
        throw new Error('Failed to reveal MVP. Please try again later.');
      }

      const data = await response.json();

      //update the main player that played the game
      const responseTwo = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/game-players-that-played/${gameId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
          }
        }
      );

      if (!responseTwo.ok) {
        throw new Error('Failed to create game players played records');
      }


      // Then, update court statistics
      const statsResponse = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/update-court-statistics/${gameId}/${currCourtType}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
        }
      );

      if (!statsResponse.ok) {
        throw new Error('Failed to update court statistics');
      }

      console.log('MVP Players:', data.mvpPlayers);
      setIsMvpHasBeenRevealed(true);
    } catch (err) {
      console.error('Error revealing MVP or updating statistics:', err);
      alert('Error occurred while finalizing the game');
    }
  };







  const handlePlayerApprove = async (registration_id) => {
    setPlayerAprrovedNow(false);
    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/approve_registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          registration_id: registration_id,
        }),
      });
      // Handle the response, you might want to update state or UI here
    } catch (err) {
      console.error('Error approving player:', err);
    } finally {
      console.log("Done approval proccess")
    }
    setPlayerAprrovedNow(true);
  };





  const closeRegistrationModal = () => {
    setSelectedPlayers([]);
    setRegisterModalOpen(false);
  };





  const deleteAndCancelGame = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete and cancel this game?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/delete_game/${gameId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': token,
          },
        }
      );

      if (response.ok) {
        alert('Game deleted successfully');
        navigate(`/scheduled-games/${courtId}?userId=${currUserId}`);
      } else {
        alert('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game');
    }
  }


  // Split registered players into main and reserve lists
  const maxPlayers = game ? game.max_players : 0;
  const mainPlayers = registeredPlayers.slice(0, maxPlayers);
  const reservePlayers = registeredPlayers.slice(maxPlayers);




  // Handlers for match creation
  const handleTeamColumnClick = (teamNumber) => {
    setSelectingForTeam(selectingForTeam === teamNumber ? null : teamNumber);
    setSelectedPlayerForMatch(null);
  };

  const handlePlayerSelect = (player) => {
    if (!selectingForTeam) return;

    const targetTeam = selectingForTeam === 1 ? team1Players : team2Players;
    const otherTeam = selectingForTeam === 1 ? team2Players : team1Players;

    handleAddToTeam(player, selectingForTeam);
  };

  const handleAddToTeam = (player, teamNumber) => {
    if (teamNumber === 1) {
      setTeam1Players(prev => [...prev, player]);
    } else {
      setTeam2Players(prev => [...prev, player]);
    }
  };

  const handleRemoveFromTeam = (player, teamNumber) => {
    if (teamNumber === 1) {
      setTeam1Players(prev => prev.filter(p => p.playerId !== player.playerId));
    } else {
      setTeam2Players(prev => prev.filter(p => p.playerId !== player.playerId));
    }
  };

  const isTeamsValid = () => {
    return team1Players.length >= 1 && // Minimum 1 players per team
      team2Players.length >= 1 &&
      team1Players.length === team2Players.length; // Teams must be equal
  };

  const handleCreateMatch = async () => {
    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/create_match/${gameId}/${currUserId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            team1_players: team1Players.map(p => p.playerId),
            team2_players: team2Players.map(p => p.playerId)
          })
        }
      );
      if (!response.ok) {
        throw new Error('Failed to create match');
      }

      const match = await response.json();
      // Navigate to the new match page
      navigate(`/match/${match.match_id}/${courtId}?userId=${currUserId}`);
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match. Please try again.');
    }
  };

  // Add this to your existing handlers
  const handleSelectShuffledTeams = (team1Index, team2Index) => {
    // Convert the gameTeams player_ids to full player objects
    const getPlayersForTeam = (teamIndex) => {
      const teamPlayerIds = gameTeams[teamIndex].player_ids;
      return mainPlayers.filter(player =>
        teamPlayerIds.includes(player.playerId)
      );
    };

    // Set the teams
    setTeam1Players(getPlayersForTeam(team1Index));
    setTeam2Players(getPlayersForTeam(team2Index));

    // Clear any manual selection state
    setSelectedPlayerForMatch(null);
    setSelectingForTeam(null);
  };



  return (
    <div className="game-page">


      {game ? (
        <>
          <div className="button-header-container">
            <div className="gp-back-button-container">
              <Link
                to={`/scheduled-games/${courtId}?userId=${currUserId}`}
                className="back-home-button-home"
              >
                🗓️
              </Link>
            </div>

            {!isMvpHasBeenRevealed && (isAdmin || isCourtCreator) && (
              <button
                className="delete-game-button"
                onClick={deleteAndCancelGame}
              >
                Delete and Cancel Game
              </button>
            )}
          </div>
          <h1 className="game-title">Gameday Details</h1>
          <div className="gp-button-container">


            {isMvpHasBeenRevealed && game.mvps && game.mvps.length > 0 && (
              <h1 className="mvp-winner">
                MVP{game.mvps.length > 1 ? 's' : ''}:<br /> {/* Use <br /> for line break */}
                <span className="mvp-names">
                  {game.mvps
                    .map(mvp => mvp.name) // Get the 'name' from each MVP object
                    .join(', ')}
                </span>
              </h1>
            )}
            {!isMvpHasBeenRevealed && mainPlayers.some(player => player.playerUserId == currUserId) && (
              <>
                {isTheGameStartedAnHourAgo() && !has24PassedSinceGameStarted() ? (
                  <button className="vote-for-mvp-button" onClick={openMVPModal}>
                    Vote For MVP
                  </button>
                ) : has24PassedSinceGameStarted() ? (
                  <button className="reveal-mvp-button" onClick={revealMVP}>
                    Reveal the MVP and close the game!
                  </button>
                ) : null} {/* Render nothing if neither condition is true */}
              </>
            )}

            {!isMvpHasBeenRevealed && (isAdmin || isCourtCreator) && (
              <button className="gp-edit-game-button" onClick={() => setEditModalOpen(true)}>
                Edit Game Settings
              </button>
            )}

            {isEditModalOpen && (
              <CreateGameModal
                onClose={() => setEditModalOpen(false)}
                onGameCreated={handleGameEdited} // Pass the callback for game creation
                existingGameData={game}
              />
            )}

            {/* Vote for MVP Modal */}
            {isVoteForMVPModalOpen && (
              <div className={`vote-for-mvp-overlay ${showMVPModal ? 'show' : ''}`}>
                <div className={`vote-for-mvp-modal ${showMVPModal ? 'show' : ''}`}>
                  <h2>Vote for MVP</h2>
                  <div className="vote-for-mvp-players-list">
                    {mainPlayers
                      .sort((a, b) => {
                        return new Date(a.registrationDate) - new Date(b.registrationDate);
                      }).map(player => (
                        <div
                          key={player.playerId}
                          className={`vote-for-mvp-player-item ${selectedMVP === player ? 'selected' : ''}`}
                          onClick={() => setSelectedMVP(player)}
                        >
                          <span className="vote-for-mvp-player-name">{player.playerName}</span>
                        </div>
                      ))}
                  </div>

                  <button className="vote-for-mvp-submit-vote-button" onClick={handleVoteForMVP}>
                    Submit Vote
                  </button>
                  <div className='vote-for-mvp-message' style={{ whiteSpace: 'pre-line' }}>
                    {voteMessage}
                  </div>
                  <button className="vote-for-mvp-close-modal-button" onClick={closeMVPModal}>
                    Close
                  </button>
                </div>
              </div>
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
          {!isMvpHasBeenRevealed && hasRegistrationArrivedAndNotPassed() && canRegister && (
            <button className="register-button" onClick={() => setRegisterModalOpen(true)}>Register Now!</button>
          )}

          {/* Modal for Registration */}
          <Modal isOpen={isRegisterModalOpen} onClose={closeRegistrationModal}>
            <h2>Register up to {maxPlayersEachUserCanAdd - numOfPlayersRegistered} more players for Game</h2>
            <button className="submit-button" onClick={handleRegistration}>Confirm Registration</button>
            <div className="player-selection">
              <h3>Select Players:</h3>
              <div className="player-cube-container">
                {!isLoading && players.length > 0 ? (
                  players
                    .sort((a, b) => {
                      const aIsCurrentUser = (a.user_fk != null && a.user_fk == currUserId);
                      const bIsCurrentUser = (b.user_fk != null && b.user_fk == currUserId);

                      if (aIsCurrentUser && !bIsCurrentUser) return -1;
                      if (bIsCurrentUser && !aIsCurrentUser) return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map(player => (
                      <PlayerCube
                        key={player.playerId}
                        player={player}
                        isSelected={selectedPlayers.includes(player.playerId)}
                        onClick={() => togglePlayerSelection(player.playerId)}
                        currUserId={currUserId}
                      />
                    ))
                ) : (
                  <p>Loading players...</p>
                )}
              </div>
            </div>
          </Modal>
          <div className='teams-shuffle-container'>
            {gameTeams && gameTeams.length > 0 ? (
              <>
                <h1 className="teams-game-title">Teams for The Game</h1>
                <div className="teams-container">
                  {gameTeams.map((team, index) => (
                    <div key={index} className="team-section">
                      <h2>Team {index + 1}</h2>
                      <ul>
                        {team.player_ids.map((playerId, idx) => (
                          <li key={idx}>{getPlayerNameById(playerId)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p></p> //present nothing if no teams yet
            )}


            {(isAdmin || isCourtCreator) && isTheGameStartsInAnHour() && !isTheGameStartedAnHourAgo() && (
              <button
                className="shuffle-teams-button"
                onClick={() => handleShuffleTeams()}
              >
                {gameTeams && gameTeams.length > 0 ? (
                  "Shuffle again !")
                  :
                  "The game starts soon, SHUFFLE TEAMS NOW !"}

              </button>
            )}
          </div>

          {/* Registered Players Section */}
          <div className="registered-players">
            <h2>Registered Players</h2>


            <h3 className='main-reserve-title1'>Main Players:</h3>
            <div className="player-items-container">
              {mainPlayers.length > 0 ? (
                mainPlayers.map((player, index) => (
                  <div
                    key={player.playerId}
                    className={player.approved ? "approved-player-item" : "player-item"} // Add this line
                  >
                    {(player.registered_by == currUserId || player.playerUserId == currUserId) && !isTheGameStartedAlready() && (
                      <>
                        {!player.approved && (
                          <button
                            className="approve-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayerApprove(player.registration_id);
                            }}
                          >
                            ✔
                          </button>
                        )}
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayerDelete(player.playerId, player.playerName);
                          }}
                        >
                          X
                        </button>
                      </>
                    )}
                    <span className="player-name">{index + 1} - {player.playerName}</span>
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
                  reservePlayers.sort((a, b) => {
                    // Sort by priority (A, B, C) first, then by registration time
                    if (a.priority !== b.priority) {
                      return a.priority.localeCompare(b.priority);
                    }
                    return new Date(a.registrationDate) - new Date(b.registrationDate);
                  }).map((player, index) => (
                    <div key={player.playerId}
                      className={player.approved ? "approved-player-item" : "player-item"}>
                      <span className="player-name">{maxPlayers + index + 1} - {player.playerName}</span>
                      {(player.registered_by == currUserId || player.playerUserId == currUserId) && !isTheGameStartedAlready() && (
                        <>
                          {/* Approval button */}
                          {!player.approved && (
                            <button
                              className="approve-button"
                              onClick={() => handlePlayerApprove(player.registration_id)}
                            >
                              ✔
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            className="delete-button"
                            onClick={() => handlePlayerDelete(player.playerId, player.playerName)}
                          >
                            X
                          </button>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No reserve players registered.</p>
                )}
              </div>
            </div>
            {/*LIST OF MATCHES SECTION*/}
            {matches.length > 0 && (
              <div className="matches-list">
                <h3 className="matches-list-title">Match History</h3>
                <div className="matches-container">
                  {matches.map((match) => (
                    <Link
                      key={match.match_id}
                      to={`/match/${match.match_id}/${courtId}?userId=${currUserId}`}
                      className={`match-item ${match.match_status === 'completed' ? 'completed' : ''}`}
                    >
                      <div className="match-time">
                        {new Date(match.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </div>
                      <div className="match-score">
                        {match.team1_score} - {match.team2_score}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/*ADD MATCH SECTION*/}
            {isTheGameStartedAlready() && !isMvpHasBeenRevealed && (
              <div className="add-match-section">
                <button
                  className="add-match-button"
                  onClick={() => setShowMatchCreation(prev => !prev)}
                >
                  {showMatchCreation ? "Cancel New Match" : "Add New Match"}
                </button>

                <div className={`match-creation-panel ${showMatchCreation ? 'open' : ''}`}>
                  {/* Pre-shuffled teams section */}
                  {gameTeams && gameTeams.length > 0 && (
                    <div className="shuffled-teams-section">
                      <h3 className="section-header">Quick Select Pre-shuffled Teams</h3>
                      <div className="team-combinations">
                        {gameTeams.map((_, i) => (
                          gameTeams.slice(i + 1).map((_, j) => (
                            <button
                              key={`${i}-${j}`}
                              className="team-combo-button"
                              onClick={() => handleSelectShuffledTeams(i, i + j + 1)}
                            >
                              Team {i + 1} vs Team {i + j + 2}
                            </button>
                          ))
                        ))}
                      </div>
                      <div className="section-divider">
                        <span>OR</span>
                      </div>
                    </div>
                  )}

                  {/* Manual team selection section */}
                  <h3 className="section-header">Create Custom Teams</h3>
                  <div className="team-selection-container">
                    <div
                      className={`team-column ${selectingForTeam === 1 ? 'selecting' : ''}`}
                      onClick={() => handleTeamColumnClick(1)}
                    >
                      <h3 className="team-header">
                        Team 1
                        {selectingForTeam === 1 && <span className="selecting-indicator">← Selecting</span>}
                      </h3>
                      <div className="team-players">
                        {team1Players.map(player => (
                          <div
                            key={player.playerId}
                            className="player-item-selectable team1"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering team column click
                              handleRemoveFromTeam(player, 1);
                            }}
                          >
                            {player.playerName} <span className="remove-player">×</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`team-column ${selectingForTeam === 2 ? 'selecting' : ''}`}
                      onClick={() => handleTeamColumnClick(2)}
                    >
                      <h3 className="team-header">
                        Team 2
                        {selectingForTeam === 2 && <span className="selecting-indicator">← Selecting</span>}
                      </h3>
                      <div className="team-players">
                        {team2Players.map(player => (
                          <div
                            key={player.playerId}
                            className="player-item-selectable team2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering team column click
                              handleRemoveFromTeam(player, 2);
                            }}
                          >
                            {player.playerName} <span className="remove-player">×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="player-selection">
                    <h3>
                      {selectingForTeam ?
                        `Select players for Team ${selectingForTeam}` :
                        'Click on a team above to start selecting players'
                      }
                    </h3>
                    <div className="player-items-container">
                      {[...mainPlayers]
                        .filter(player =>
                          !team1Players.find(p => p.playerId === player.playerId) &&
                          !team2Players.find(p => p.playerId === player.playerId)
                        )
                        .sort((a, b) => a.playerName.localeCompare(b.playerName))
                        .map(player => (
                          <div
                            key={player.playerId}
                            className={`player-item-selectable ${!selectingForTeam ? 'disabled' : selectedPlayerForMatch === player ? 'selected' : ''}`}
                            onClick={() => handlePlayerSelect(player)}
                          >
                            {player.playerName}
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    className="teams-ready-button"
                    disabled={!isTeamsValid()}
                    onClick={handleCreateMatch}
                  >
                    Teams Ready
                  </button>
                </div>
              </div>
            )}
          </div>
          {mainPlayers.length > 0 && (
            <GamedayStats
              matchPlayers={mainPlayers}
              currCourtType={currCourtType}
              gameId={gameId}
              token={token}
            />
          )}
        </>
      ) : (
        <p>Loading game details...</p>
      )}
    </div>
  );
};

export default GamedayPage;