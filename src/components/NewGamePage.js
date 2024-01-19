import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Team from './Team';
import './NewGamePage.css';
import './HomePage.css';


const NewGamePage = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [numTeams, setNumTeams] = useState(2);
  const [searchInput, setSearchInput] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(0);
  const { courtId } = useParams();


  useEffect(() => {
    // Retrieve players from local storage
    const courtPlayersKey = `court_${courtId}_players`
    const storedPlayers = JSON.parse(localStorage.getItem(courtPlayersKey)) || [];
    setPlayers(storedPlayers);
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedPlayers', JSON.stringify(selectedPlayers));
    // Update the selectedPlayerCount whenever selectedPlayers changes
    setSelectedPlayerCount(selectedPlayers.length);
  }, [selectedPlayers]);

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayers(prevSelectedPlayers => {
      const isSelected = prevSelectedPlayers.some((player) => player.id === playerId);

      if (isSelected) {
        const updatedSelection = prevSelectedPlayers.filter((player) => player.id !== playerId);
        return updatedSelection;
      } else {
        const playerToAdd = players.find((player) => player.id === playerId);
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

    // Save the teams to local storage or state and navigate to the Teams page
    localStorage.setItem('teams', JSON.stringify(teams));
    navigate('/teams');
    localStorage.setItem('selectedPlayers', JSON.stringify(selectedPlayers));

    // Redirect to TeamsPage with state
    navigate(`/teams/${courtId}`, { state: { selectedPlayers } });
  };


  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="home-page-style">
      <h1 className="HP-title">New Game</h1>

      <div className="team-options">
        <label htmlFor="numTeams" className='num-of-teams'>Choose number of teams:</label>
        <select id="numTeams" className="custom-dropdown" onChange={handleNumTeamsChange} value={numTeams}>
          {Array.from({ length: 19 }, (_, index) => (
            <option key={index + 2} value={index + 2}>
              {index + 2}
            </option>
          ))}
        </select>
      </div>

      <div className="NGP-instructions">
        <p>Choose the players that will be playing today:</p>
        <p>Total Players Selected: {selectedPlayerCount}</p> {/* Display the count */}
      </div>

      <input
        type="text"
        placeholder="Search by player name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div className="NGP-player-list">
        {filteredPlayers.map((player) => (
          <label className={`NGP-player-cube ${selectedPlayers.includes(player.id) ? 'selected' : ''}`}>
            <div key={player.id} className='NGP-player-name' >
              <input
                type="checkbox"
                checked={selectedPlayers.some((p) => p.id === player.id)}
                onChange={() => handlePlayerSelection(player.id)}
              />
              {player.name}
            </div>
          </label>
        ))}
      </div>

      <button className="NGP-randomize-teams-button" onClick={handleRandomizeTeams}>
        Randomize Teams
      </button>

      <Link to="/" className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default NewGamePage;