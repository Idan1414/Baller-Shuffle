import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Team from './Team';
import './NewGamePage.css';
import './BasketballCourtPage.css';


const NewGamePage = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [numTeams, setNumTeams] = useState(3);
  const [searchInput, setSearchInput] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(0);
  const { courtId } = useParams();
  const { search } = useLocation();
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

    //User_id validation
    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/'); // Redirect to home if not authorized
      return;
    }

    // Fetch players from the API for the given courtId
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/players/${courtId}`, {
          headers: {
            'Authorization': token, // Include token if needed
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }

        const data = await response.json();

        // Sort players by overall and update state
        const sortedPlayers = data.sort((a, b) => b.overall - a.overall);
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, [courtId]);


  useEffect(() => {
    localStorage.setItem('selectedPlayers', JSON.stringify(selectedPlayers));
    setSelectedPlayerCount(selectedPlayers.length);
  }, [selectedPlayers]);



  const handlePlayerSelection = (playerId) => {
    setSelectedPlayers(prevSelectedPlayers => {
      const isSelected = prevSelectedPlayers.some((player) => player.playerId === playerId);

      if (isSelected) {
        const updatedSelection = prevSelectedPlayers.filter((player) => player.playerId !== playerId);
        return updatedSelection;
      } else {
        const playerToAdd = players.find((player) => player.playerId === playerId);
        return [...prevSelectedPlayers, playerToAdd];
      }
    });
  };

  const handleNumTeamsChange = (e) => {
    setNumTeams(parseInt(e.target.value, 10));
  };

  const handleRandomizeTeams = () => {
    //for randomization, take 1 overall point from each player and spread it randomally
    let overallPointsToSpread = selectedPlayers.length;
    //shuffles the list of players.
    const PlayersToMixOverall = [...selectedPlayers].sort(() => Math.random() - 0.5);
    PlayersToMixOverall.forEach(p => {
      p.overallToMix = (p.overall - 1);
    });
    let playerIndex = 0;
    while (overallPointsToSpread > 0 && playerIndex < selectedPlayers.length) {
      let currPlayer = PlayersToMixOverall[playerIndex];
      let overallPointsToGive = Math.round((Math.random() * 2) + 1);
      currPlayer.overallToMix = (currPlayer.overallToMix + overallPointsToGive);
      overallPointsToSpread = overallPointsToSpread - overallPointsToGive;
      playerIndex++;
    }
    // Sort players by overall in descending order (best players first)
    const sortedPlayers = [...PlayersToMixOverall].sort((a, b) => b.overallToMix - a.overallToMix);

    // Create teams
    const teams = Array.from({ length: numTeams }, () => new Team([]));

    // Distribute players to teams in a zigzag pattern
    for (let i = 0; i < sortedPlayers.length; i++) {
      const patternIndex = i % numTeams;
      const teamIndex = i < numTeams ? patternIndex : numTeams - patternIndex - 1;

      // Assign player to the calculated team
      teams[teamIndex].players.push(sortedPlayers[i]);
      teams[teamIndex].calculateTeamStats();
    }

    // Save the teams to local storage
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('selectedPlayers', JSON.stringify(selectedPlayers));

    // Redirect to TeamsPage with state
    navigate(`/teams/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`, { state: { selectedPlayers } });
  };


  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="home-page-style">
      <h1 className="HP-basketball-title">NEW GAME</h1>

      <div className="team-options">
        <label htmlFor="numTeams" className='num-of-teams1'>Choose number of teams:</label>
        <select id="numTeams" className="custom-dropdown1" onChange={handleNumTeamsChange} value={numTeams}>
          {Array.from({ length: 19 }, (_, index) => (
            <option key={index + 2} value={index + 2}>
              {index + 2}
            </option>
          ))}
        </select>
      </div>

      <div className="NGP-instructions">
        <p className='instructions11'>Choose the players that will be playing today:</p>
        <p className='instructions22'>Total Players Selected: {selectedPlayerCount}</p> {/* Display the count */}
        <p> </p>

      </div>

      <input
        type="text"
        placeholder="Search by player name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div className="NGP-player-list">
        {filteredPlayers.map((player) => (
          <label className={`NGP-player-cube2 ${selectedPlayers.includes(player.playerId) ? 'selected' : ''}`}>
            <div key={player.playerId} className='NGP-player-name' >
              <input
                type="checkbox"
                checked={selectedPlayers.some((p) => p.playerId === player.playerId)}
                onChange={() => handlePlayerSelection(player.playerId)}
              />
              {player.name}
            </div>
          </label>
        ))}
      </div>

      <button className="NGP-randomize-teams-button" onClick={handleRandomizeTeams}>
        Randomize Teams
      </button>

      <Link to={`/court_home_page/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default NewGamePage;