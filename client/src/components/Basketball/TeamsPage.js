import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Team from './Team'; // Import the Team component
import './TeamsPage.css';

const TeamsPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const { courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [originTeam, setOriginTeam] = useState(null);


  useEffect(() => {
    // Retrieve teams from local storage
    const storedTeams = JSON.parse(localStorage.getItem('teams')) || [];
    setTeams(storedTeams);
  }, []);


  const handleReRandomize = () => {
    // Retrieve selected players from local storage
    const newSelectedPlayers = JSON.parse(localStorage.getItem('selectedPlayers')) || [];
    // Trigger the randomization logic
    handleRandomizeTeams(newSelectedPlayers);
  };

  const handleRandomizeTeams = (selectedPlayers) => {
    //For randomization, take 1 overall point from each player and spread it randomally
    let overallPointsToSpread = selectedPlayers.length;
    //Shuffles the list of players
    //Compare function = Math.random
    const PlayersToMixOverall = [...selectedPlayers].sort(() => Math.random() - 0.5);
    //Takes down 1 point from each player
    PlayersToMixOverall.forEach(p => {
      p.overallToMix = (p.overall - 1);
    });
    let playerIndex = 0;
    while (overallPointsToSpread > 0 && playerIndex < selectedPlayers.length) {
      let currPlayer = PlayersToMixOverall[playerIndex];
      //Each player will get 1,2 or 3 points
      let overallPointsToGive = Math.round((Math.random() * 2) + 1);
      currPlayer.overallToMix = (currPlayer.overallToMix + overallPointsToGive);
      overallPointsToSpread = overallPointsToSpread - overallPointsToGive;
      playerIndex++;
    }
    //Sort players by the new overalls  in descending order (best players first)
    const sortedPlayers = [...PlayersToMixOverall].sort((a, b) => b.overallToMix - a.overallToMix);

    //Create teams
    let numTeams = teams.length;
    //New empty array of teams
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
    navigate(`/teams/${courtId}?courtName=${(currCourtName)}&courtType=${(currCourtType)}&userId=${(currUserId)}`, { state: { selectedPlayers } });
  };


  const handleDragStart = (event, player, originTeam) => {
    event.dataTransfer.setData("application/reactflow", player.playerId); // Use a MIME type
    event.dataTransfer.effectAllowed = "move";
    // Update state with the dragged player and origin team
    setDraggedPlayer(player);
    setOriginTeam(originTeam);
  };

  const handleDrop = (event, targetTeam) => {

    if (!draggedPlayer || !originTeam) return;

    // Avoid action if dropping on the same team
    if (targetTeam.team_id === originTeam.team_id) return;


    // Find and update the origin team
    const updatedOriginTeamIndex = teams.findIndex(team => team.team_id === originTeam.team_id);
    let updatedOriginTeam = new Team(teams[updatedOriginTeamIndex].players.filter(p => p.playerId !== draggedPlayer.playerId), teams[updatedOriginTeamIndex].team_id);
    updatedOriginTeam.calculateTeamStats();

    // Find and update the target team
    const updatedTargetTeamIndex = teams.findIndex(team => team.team_id === targetTeam.team_id);
    let updatedTargetTeam = new Team([...teams[updatedTargetTeamIndex].players, draggedPlayer], teams[updatedTargetTeamIndex].team_id);
    updatedTargetTeam.calculateTeamStats();

    // Create a new array of teams with updated instances
    let updatedTeams = [...teams];
    updatedTeams[updatedOriginTeamIndex] = updatedOriginTeam;
    updatedTeams[updatedTargetTeamIndex] = updatedTargetTeam;


    setTeams(updatedTeams);
    setDraggedPlayer(null);
    setOriginTeam(null);
  };

  return (
    <div className="basketball-teams-page-style">
      <h1 className='TP-title1'>Fair Suffled Teams</h1>
      <div className="teams-distribution-style">
        {teams.map((team, index) => (
          <div key={team.team_id}
            onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
            onDrop={(e) => handleDrop(e, team)}
            className="team-container">
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
                <div
                  key={player.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, player, team)}
                  className="player">
                  <p>{player.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p>
          <button onClick={handleReRandomize} className="re-shuffle-button">
            Re-Shuffle
          </button>
        </p >
        <p>
          <Link to={`/new-game/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="back-home-button">
            Back to New Game
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TeamsPage;
