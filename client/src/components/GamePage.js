import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import BasketballTeam from './Basketball/BasketballTeam.js';
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


const GamePage = () => {
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
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
  const [gameStats, setGameStats] = useState([]);
  const [showPlayerSummaryModal, setShowPlayerSummaryModal] = useState(false);
  const [selectedPlayerSummary, setSelectedPlayerSummary] = useState(null);
  // Stopwatch and 24-second shot clock states
  const [stopwatchDuration, setStopwatchDuration] = useState(600);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [shotClockDuration, setShotClockDuration] = useState(24);
  const [shotClockRunning, setShotClockRunning] = useState(false);
  const [configuredMinutes, setConfiguredMinutes] = useState(10); // Default to 10 minutes
  const stopwatchInterval = useRef(null);
  const shotClockInterval = useRef(null);


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

  //Fetching Game Stats

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5000/api/game-stats/${gameId}`,
          {
            headers: {
              'Authorization': token,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setGameStats(data);
        }
      } catch (error) {
        console.error('Error fetching game stats:', error);
      }
    };

    if (gameId) {
      fetchGameStats();
    }
  }, [gameId, showStatsModal]); // Re-fetch when modal closes

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



  const handleAddStat = async (playerId, statType) => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/add-player-stat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          creatorUserId: currUserId,
          playerId: playerId,
          gameId: gameId,
          stat: statType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add stat');
      }

      setShowStatsModal(false);
      setSelectedPlayerForStats(null);
    } catch (error) {
      console.error('Error adding stat:', error);
      alert('Failed to add stat. Please try again.');
    }
  };


  const handleDeleteStat = async (statId) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/delete-stat/${statId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': token,
          },
        }
      );

      if (response.ok) {
        setGameStats(prevStats => prevStats.filter(stat => stat.id !== statId));
      }
    } catch (error) {
      console.error('Error deleting stat:', error);
    }
  };

  // Add this function to get stat description
  const getStatDescription = (statType) => {
    switch (statType) {
      case 1: return 'Win 🏆';
      case 2: return '2 Pointer ✌️';
      case 3: return '3 Pointer 🎯';
      case 4: return 'Assist 🤝'; //basketball
      case 5: return 'Block 🛡️';
      case 6: return 'Steal 🧤';
      case 7: return 'Goal ⚽';
      case 8: return 'Assist 🎯'; //football
      case 9: return 'Miss 🤦‍♂️';
      default: return 'Unknown';
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


  // Add this function to calculate player stats
  const calculatePlayerGameSummary = (playerName) => {
    const playerStats = gameStats.filter(stat => stat.player_name === playerName);

    if (currCourtType === 'Football') {
      return {
        goals: playerStats.filter(stat => stat.stat === 7).length,
        assists: playerStats.filter(stat => stat.stat === 8).length,
        embarrassingMisses: playerStats.filter(stat => stat.stat === 9).length,
        wins: playerStats.filter(stat => stat.stat === 1).length,
        playerName
      };
    } else {
      return {
        points: (
          playerStats.filter(stat => stat.stat === 2).length * 2 +
          playerStats.filter(stat => stat.stat === 3).length * 3
        ),
        twoPointers: playerStats.filter(stat => stat.stat === 2).length,
        threePointers: playerStats.filter(stat => stat.stat === 3).length,
        assists: playerStats.filter(stat => stat.stat === 4).length,
        blocks: playerStats.filter(stat => stat.stat === 5).length,
        steals: playerStats.filter(stat => stat.stat === 6).length,
        wins: playerStats.filter(stat => stat.stat === 1).length,
        playerName
      };
    }
  };

  // Add click handler for player name
  const handlePlayerNameClick = (playerName) => {
    const summary = calculatePlayerGameSummary(playerName);
    setSelectedPlayerSummary(summary);
    setShowPlayerSummaryModal(true);
  };

  const formatTime = (duration) => {
    const minutes = Math.max(0, Math.floor(duration / 60));
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startStopwatch = () => {
    setStopwatchRunning(true);
    stopwatchInterval.current = setInterval(() => {
      setStopwatchDuration((prevDuration) => prevDuration - 1);
    }, 1000);
  };

  const stopStopwatch = () => {
    setStopwatchRunning(false);
    setShotClockRunning(false);
    clearInterval(stopwatchInterval.current);
    clearInterval(shotClockInterval.current);
  };

  const resetStopwatch = () => {
    stopStopwatch();
    setStopwatchDuration(configuredMinutes * 60);
    if (currCourtType === 'Basketball') {
      setShotClockDuration(24);
    }
  };

  const startShotClock = () => {
    setShotClockRunning(true);
    shotClockInterval.current = setInterval(() => {
      setShotClockDuration((prevDuration) => prevDuration - 1);
    }, 1000);
  };

  const stopShotClock = () => {
    setShotClockRunning(false);
    clearInterval(shotClockInterval.current);
  };

  const resetShotClock24 = () => {
    setShotClockDuration(24);
  };

  const resetShotClock14 = () => {
    setShotClockDuration(14);
  };


  const handleConfiguredMinutesChange = (e) => {
    const newMinutes = parseInt(e.target.value, 10);
    if (!isNaN(newMinutes) && newMinutes >= 0 && newMinutes <= 1000) {
      resetStopwatch();
      setConfiguredMinutes(newMinutes);
      resetStopwatch();
    }
  };

  useEffect(() => {
    if (stopwatchDuration === 0 || (currCourtType === 'Basketball' && shotClockDuration === 0)) {
      stopShotClock();
    }
  }, [stopwatchDuration, shotClockDuration, currCourtType]);
  // Split registered players into main and reserve lists
  const maxPlayers = game ? game.max_players : 0;
  const mainPlayers = registeredPlayers.slice(0, maxPlayers);
  const reservePlayers = registeredPlayers.slice(maxPlayers);






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
          <h1 className="game-title">Game Details</h1>
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
              <button className="gp-create-game-button" onClick={() => setEditModalOpen(true)}>
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
                  <div key={player.playerId}
                    className={player.approved ? "approved-player-item" : "player-item"}
                    onClick={() => {
                      const isCurrentUserMainPlayer = mainPlayers.some(mainPlayer => mainPlayer.playerUserId == currUserId);

                      if (isTheGameStartedAlready() && !isMvpHasBeenRevealed && !has24PassedSinceGameStarted() && isCurrentUserMainPlayer) {
                        setSelectedPlayerForStats(player);
                        setShowStatsModal(true);
                      } else if (isTheGameStartedAlready() && !isCurrentUserMainPlayer) {
                        alert("Only registered main players can add stats!");
                      }
                    }}
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

            {/* Modal for stats */}
            <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
              <div className="stats-modal-header">
                <h2 className="stats-modal-title">Add Stat for {selectedPlayerForStats?.playerName}</h2>
              </div>
              <div className="stats-modal-body">
                <div className="stats-buttons-grid">
                  {currCourtType === 'Football' ? (
                    <>
                      <button className="stat-button goal-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 7)}>
                        <span className="stat-icon">⚽</span>
                        <span className="stat-text">Goal</span>
                      </button>
                      <button className="stat-button assist-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 8)}>
                        <span className="stat-icon">🎯</span>
                        <span className="stat-text">Assist</span>
                      </button>
                      <button className="stat-button miss-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 9)}>
                        <span className="stat-icon">🤦‍♂️</span>
                        <span className="stat-text">Embarrassing Miss</span>
                      </button>
                      <button className="stat-button win-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 1)}>
                        <span className="stat-icon">🏆</span>
                        <span className="stat-text">Win</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="stat-button points-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 2)}>
                        <span className="stat-icon">✌️</span>
                        <span className="stat-text">2 Pointer</span>
                      </button>
                      <button className="stat-button points-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 3)}>
                        <span className="stat-icon">🎯</span>
                        <span className="stat-text">3 Pointer</span>
                      </button>
                      <button className="stat-button assist-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 4)}>
                        <span className="stat-icon">🤝</span>
                        <span className="stat-text">Assist</span>
                      </button>
                      <button className="stat-button defense-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 5)}>
                        <span className="stat-icon">🛡️</span>
                        <span className="stat-text">Block</span>
                      </button>
                      <button className="stat-button defense-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 6)}>
                        <span className="stat-icon">🔄</span>
                        <span className="stat-text">Steal</span>
                      </button>
                      <button className="stat-button win-stat" onClick={() => handleAddStat(selectedPlayerForStats?.playerId, 1)}>
                        <span className="stat-icon">🏆</span>
                        <span className="stat-text">Win</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Modal>


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
            {/*Stopwatch and shotClock*/}
            <div className="stopwatch-container">
              <div className="stopwatch-timer">
                <span className="stopwatch-time">{formatTime(stopwatchDuration)}</span>
                {currCourtType === 'Basketball' && (
                  <span className="shot-clock-time" style={{ color: shotClockDuration <= 5 ? 'red' : 'white' }}>
                    {formatTime(shotClockDuration)}
                  </span>
                )}
              </div>
              <div className="stopwatch-controls">
                {!stopwatchRunning ? (
                  <button className="stopwatch-button" onClick={startStopwatch}>
                    Start
                  </button>
                ) : (
                  <button className="stopwatch-button" onClick={stopStopwatch}>
                    Stop
                  </button>
                )}
                <button className="stopwatch-button" onClick={resetStopwatch}>
                  Reset
                </button>
                <input
                  type="number"
                  className="stopwatch-config"
                  min="0"
                  max="1000"
                  value={configuredMinutes}
                  onChange={handleConfiguredMinutesChange}
                />
                <span className="stopwatch-config-label">Minutes</span>
                {currCourtType === 'Basketball' && (
                  <>
                    {!shotClockRunning ? (
                      <button className="shot-clock-button" onClick={startShotClock}>
                        Start 24s
                      </button>
                    ) : (
                      <button className="shot-clock-button" onClick={stopShotClock}>
                        Stop 24s
                      </button>
                    )}
                    <button className="shot-clock-button" onClick={() => resetShotClock24()}>
                      Reset 24s
                    </button>
                    <button className="shot-clock-button" onClick={() => resetShotClock14()}>
                      Reset 14s
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <Modal isOpen={showPlayerSummaryModal} onClose={() => setShowPlayerSummaryModal(false)}>
            <div className="stats-modal-header">
              <h2 className="stats-modal-title">
                {selectedPlayerSummary?.playerName}'s Game Summary
              </h2>
            </div>
            <div className="stats-modal-body">
              {selectedPlayerSummary && (
                <div className="stats-summary-grid">
                  {currCourtType === 'Football' ? (
                    <>
                      <div className="stat-summary-item">
                        <span className="stat-icon">⚽</span>
                        <span className="stat-label"> Goals : </span>
                        <span className="stat-value">{selectedPlayerSummary.goals}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label"> Assists : </span>
                        <span className="stat-value">{selectedPlayerSummary.assists}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🤦‍♂️</span>
                        <span className="stat-label"> Misses : </span>
                        <span className="stat-value">{selectedPlayerSummary.embarrassingMisses}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🏆</span>
                        <span className="stat-label"> Wins : </span>
                        <span className="stat-value">{selectedPlayerSummary.wins}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🏀</span>
                        <span className="stat-label"> Total Points : </span>
                        <span className="stat-value">{selectedPlayerSummary.points}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">✌️</span>
                        <span className="stat-label"> Two Pointers : </span>
                        <span className="stat-value">{selectedPlayerSummary.twoPointers}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label"> Three Pointers : </span>
                        <span className="stat-value">{selectedPlayerSummary.threePointers}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🤝</span>
                        <span className="stat-label"> Assists : </span>
                        <span className="stat-value">{selectedPlayerSummary.assists}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🛡️</span>
                        <span className="stat-label"> Blocks : </span>
                        <span className="stat-value">{selectedPlayerSummary.blocks}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🧤</span>
                        <span className="stat-label"> Steals : </span>
                        <span className="stat-value">{selectedPlayerSummary.steals}</span>
                      </div>
                      <div className="stat-summary-item">
                        <span className="stat-icon">🏆</span>
                        <span className="stat-label"> Wins : </span>
                        <span className="stat-value">{selectedPlayerSummary.wins}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </Modal>
          <div className="game-stats-section">
            <h3 className="game-stats-title">Game Statistics</h3>
            <div className="stats-table-container">
              {gameStats.length > 0 ? (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="time-column">Time</th>
                      <th className="player-column">Player</th>
                      <th className="stat-column">Stat</th>
                      <th className="delete-column">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameStats.map(stat => (
                      <tr key={stat.id}>
                        <td className="time-column">
                          {new Date(stat.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="player-column">
                          <span
                            className="player-name"
                            onClick={() => handlePlayerNameClick(stat.player_name)}
                            style={{ cursor: 'pointer' }}
                          >
                            {stat.player_name}
                          </span>                        </td>
                        <td className="stat-column">
                          <span className="stat-name">{getStatDescription(stat.stat)}</span>
                        </td>
                        <td className="delete-column">
                          {(stat.created_by === parseInt(currUserId) || isCourtCreator) && !isMvpHasBeenRevealed && (
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteStat(stat.id)}
                            >
                              X
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No stats recorded yet</p>
              )}
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