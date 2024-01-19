import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Team from './Team'; // Import the Team component
import './TeamsPage.css';

const TeamsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState([]);
  const { courtId } = useParams();
  const [selectedPlayers, setSelectedPlayers] = useState([]);


  useEffect(() => {
    // Retrieve teams from local storage
    const storedTeams = JSON.parse(localStorage.getItem('teams')) || [];
    setTeams(storedTeams);

    // Retrieve selectedPlayers from state
    const state = location.state || {};
    const { selectedPlayers: selectedPlayersFromState } = state;
    setSelectedPlayers(selectedPlayersFromState || []);
  }, [location.state]);


  const handleReRandomize = () => {
    // Retrieve selected players from local storage
    const newSelectedPlayers = JSON.parse(localStorage.getItem('selectedPlayers')) || [];
    // Trigger the randomization logic
    handleRandomizeTeams(newSelectedPlayers);
  };

  const handleRandomizeTeams = (selectedPlayers) => {
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
    let numTeams = teams.length;
    const newteams = Array.from({ length: numTeams }, () => new Team([]));

    // Distribute players to teams in a zigzag pattern
    for (let i = 0; i < sortedPlayers.length; i++) {
      const patternIndex = i % numTeams;
      const teamIndex = i < numTeams ? patternIndex : numTeams - patternIndex - 1;

      // Assign player to the calculated team
      newteams[teamIndex].players.push(sortedPlayers[i]);
      newteams[teamIndex].calculateTeamStats();
    }

    setTeams(newteams);

    // Save the teams to local storage or state and navigate to the Teams page
    localStorage.setItem('teams', JSON.stringify(newteams));
    navigate(`/teams/${courtId}`);
  };

  return (
    <div className="teams-page-style">
      <h1 className='TP-title'>Fair Randomized Teams</h1>
      <div className="teams-distribution-style">
        {teams.map((team, index) => (
          <div key={team.team_id} className="team-container">
            <h2 style={{ textAlign: 'center' }}>Team {index + 1}</h2>
            <p> Overall: {team.team_overall}</p>
            <p> Height: {team.team_height}</p>
            <p> 3PtShot: {team.team_threePtShot}</p>
            <p> Defence: {team.team_defence}</p>
            <p> Scoring: {team.team_scoring}</p>
            <p> Passing: {team.team_passing}</p>
            <p> Speed: {team.team_speed}</p>
            <p> Physical: {team.team_physical}</p>
            <p> Rebound: {team.team_rebound}</p>
            <p> Ball Handling: {team.team_ballHandling}</p>
            <p> Post Up: {team.team_postUp}</p>

            <div className="team-players">
              <h3>Players:</h3>
              {team.players.map((player) => (
                <div key={player.id} className="player">
                  <p>{player.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p>
          <button onClick={handleReRandomize} className="re-randomize-button">
            Re-Randomize
          </button>
        </p >
        <p>
          <Link to={`/court_home_page/${courtId}`} className="NGP-back-home-button">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TeamsPage;
