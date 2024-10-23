import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useParams } from 'react-router-dom';
import BasketballTeam from './Basketball/BasketballTeam.js';
import FootballTeam from './Football/FootballTeam.js';
import './TeamsPage.css';

const TeamsPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const { gameId, courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [currCourtName, setCourtName] = useState('');
  const [currCourtType, setCourtType] = useState('');
  const [isSwapping, setIsSwapping] = useState(false); // Add this new state

  const currUserId = searchParams.get('userId');
  const [swappingPlayers, setSwappingPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const token = localStorage.getItem('token');
  let decodedToken;
  if (token) {
    decodedToken = jwtDecode(token);
  }

  useEffect(() => {
    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/');
      return;
    }
    if (!decodedToken.courts || !decodedToken.courts.includes(courtId)) {
      navigate('/');
      return;
    }

    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/court_info/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourtName(data[0].courtName);
        setCourtType(data[0].courtType);
      })
      .catch((error) => {
        console.error('Error fetching court info :', error);
      });
  }, [courtId, navigate, token, decodedToken]);

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('teams')) || [];
    setTeams(storedTeams);
  }, []);

  const handlePlayerClick = async (player, teamIndex) => {
    // Prevent clicks while a swap is in progress
    if (isSwapping) {
      return;
    }

    if (!selectedPlayer) {
      // First player selected
      setSelectedPlayer({ player, teamIndex });
    } else {
      // Second player selected - perform the swap
      if (selectedPlayer.teamIndex === teamIndex) {
        setSelectedPlayer(null);
        return;
      }

      // Lock the swapping process
      setIsSwapping(true);

      try {
        // Set swapping players for animation
        setSwappingPlayers([selectedPlayer.player.playerId, player.playerId]);

        // Create new team instances with swapped players
        const updatedTeams = [...teams];
        
        // Store the current selected player info before clearing it
        const previousSelectedPlayer = selectedPlayer;

        // Clear selected player immediately to prevent further interactions
        setSelectedPlayer(null);

        // Remove players from their original teams
        const team1Players = updatedTeams[previousSelectedPlayer.teamIndex].players.filter(
          p => p.playerId !== previousSelectedPlayer.player.playerId
        );
        const team2Players = updatedTeams[teamIndex].players.filter(
          p => p.playerId !== player.playerId
        );

        // Add players to their new teams
        team1Players.push(player);
        team2Players.push(previousSelectedPlayer.player);

        // Animate the swap
        await new Promise(resolve => setTimeout(resolve, 400));

        // Create new team instances with updated players
        if (currCourtType === 'Basketball') {
          updatedTeams[previousSelectedPlayer.teamIndex] = new BasketballTeam(team1Players);
          updatedTeams[teamIndex] = new BasketballTeam(team2Players);
        } else {
          updatedTeams[previousSelectedPlayer.teamIndex] = new FootballTeam(team1Players);
          updatedTeams[teamIndex] = new FootballTeam(team2Players);
        }

        // Recalculate team stats
        updatedTeams[previousSelectedPlayer.teamIndex].calculateTeamStats();
        updatedTeams[teamIndex].calculateTeamStats();

        // Update state and local storage
        setTeams(updatedTeams);
        localStorage.setItem('teams', JSON.stringify(updatedTeams));

        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 400));

        // Reset animation states
        setSwappingPlayers([]);
      } catch (error) {
        console.error('Error during player swap:', error);
      } finally {
        // Always unlock the swapping process, even if an error occurred
        setIsSwapping(false);
      }
    }
  };

  const handleReShuffle = () => {
    const newSelectedPlayers = JSON.parse(localStorage.getItem('selectedPlayers')) || [];
    handleShuffleTeams(newSelectedPlayers);
  };

  const handleShuffleTeams = (selectedPlayers) => {
    let overallPointsToSpread = selectedPlayers.length;
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

    const sortedPlayers = [...PlayersToMixOverall].sort((a, b) => b.overallToMix - a.overallToMix);

    let numTeams = teams.length;
    let newteams;
    if (currCourtType == 'Basketball') {
      newteams = Array.from({ length: numTeams }, () => new BasketballTeam([]));
    } else {
      newteams = Array.from({ length: numTeams }, () => new FootballTeam([]));
    }

    for (let i = 0; i < sortedPlayers.length; i++) {
      const patternIndex = i % numTeams;
      const teamIndex = i < numTeams ? patternIndex : numTeams - patternIndex - 1;
      newteams[teamIndex].players.push(sortedPlayers[i]);
      newteams[teamIndex].calculateTeamStats();
    }

    setTeams(newteams);
    localStorage.setItem('teams', JSON.stringify(newteams));
    navigate(`/teams/${gameId}/${courtId}?userId=${(currUserId)}`, { state: { selectedPlayers } });
  };

  const handleTheseAreMyTeamsButtonClick = () => {
    const teamsData = JSON.parse(localStorage.getItem('teams'));

    if (!teamsData) {
      console.error('No teams found in local storage');
      return;
    }

    const formattedTeamsData = teamsData.map(team => ({
      playerIds: team.players.map(player => player.playerId)
    }));

    sendTeamsToApi(formattedTeamsData);
  };

  const sendTeamsToApi = async (teamsForGame) => {
    const gameId = localStorage.getItem('gameId');

    if (!gameId) {
      console.error('No gameId found in local storage');
      return;
    }

    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/game_teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ game_id: gameId, teams: teamsForGame }),
      });

      if (!response.ok) {
        throw new Error('Failed to send teams to API');
      }

      const result = await response.json();
      console.log('API response:', result);
      navigate(`/game/${gameId}/${courtId}?userId=${currUserId}`);
    } catch (error) {
      console.error('Error sending teams to API:', error);
    }
  };

  const renderTeamAttributes = (team) => {
    const courtType = currCourtType?.toLowerCase();

    switch (courtType) {
      case 'basketball':
        return (
          <>
            <p>Overall: {team.team_overall}</p>
            <p>Height: {team.team_height}</p>
            <p>3PtShot: {team.team_threePtShot}</p>
            <p>Defence: {team.team_defence}</p>
            <p>Scoring: {team.team_scoring}</p>
            <p>Passing: {team.team_passing}</p>
            <p>Speed: {team.team_speed}</p>
            <p>Physical: {team.team_physical}</p>
            <p>Rebound: {team.team_rebound}</p>
            <p>Ball Handling: {team.team_ballHandling}</p>
            <p>Post Up: {team.team_postUp}</p>
          </>
        );
      case 'football':
        return (
          <>
            <p>Overall: {team.team_overall}</p>
            <p>Defence: {team.team_defence}</p>
            <p>Finishing: {team.team_finishing}</p>
            <p>Passing: {team.team_passing}</p>
            <p>Speed: {team.team_speed}</p>
            <p>Physical: {team.team_physical}</p>
            <p>Dribbling: {team.team_dribbling}</p>
            <p>Header: {team.team_header}</p>
          </>
        );
      default:
        console.log('Current court type:', currCourtType);
        return <p>No attributes available for this court type</p>;
    }
  };

  return (
    <div className="basketball-teams-page-style1">
      <h1 className='TP-title1'>Fair Shuffled Teams</h1>
      <div className="teams-distribution-style1">
        {teams.map((team, index) => (
          <div key={index} className="team-container1">
            <h2 style={{ textAlign: 'center' }}>Team {index + 1}</h2>
            {renderTeamAttributes(team)}
            <div className="team-players1">
              <h3>Players:</h3>
              {team.players.map((player) => (
                <div
                  key={player.playerId}
                  onClick={() => handlePlayerClick(player, index)}
                  className={`player1 ${selectedPlayer?.player.playerId === player.playerId ? 'selected-player' : ''
                    } ${swappingPlayers.includes(player.playerId) ? 'swapping' : ''
                    }`}
                >
                  <p>{player.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p>
          <button onClick={handleReShuffle} className="re-shuffle-button1">
            Re-Shuffle
          </button>
          <button onClick={handleTheseAreMyTeamsButtonClick} className="those-are-the-teams-button1">
            Those Are The Teams!
          </button>
        </p>
        <p>
          <Link to={`/game/${gameId}/${courtId}?userId=${currUserId}`} className="back-home-button">
            Back to New Game
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TeamsPage;