import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import './MatchPage.css';

const MatchPage = () => {
  const { matchId, courtId } = useParams();
  const [match, setMatch] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [currCourtType, setCurrCourtType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');
  const token = localStorage.getItem('token');

  // Clock states
  const [stopwatchDuration, setStopwatchDuration] = useState(600);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [shotClockDuration, setShotClockDuration] = useState(24);
  const [shotClockRunning, setShotClockRunning] = useState(false);
  const [configuredMinutes, setConfiguredMinutes] = useState(10);
  const stopwatchInterval = useRef(null);
  const shotClockInterval = useRef(null);

  // Stats states
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [matchStats, setMatchStats] = useState([]);
  const [showPlayerSummaryModal, setShowPlayerSummaryModal] = useState(false);
  const [selectedPlayerSummary, setSelectedPlayerSummary] = useState(null);

  const [isEndingMatch, setIsEndingMatch] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5001/api/match/${matchId}`,
          {
            headers: {
              'Authorization': token
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }

        const data = await response.json();
        setMatch(data);
        setGameId(data.gameday_id);
        setCurrCourtType(data.court_type); // Add this line to set court type

        // Fetch all match players
        const playersResponse = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5001/api/match_players/${matchId}`,
          {
            headers: {
              'Authorization': token
            }
          }
        );

        if (!playersResponse.ok) {
          throw new Error('Failed to fetch match players');
        }

        const playersData = await playersResponse.json();

        // Sort players into teams based on team_number
        const team1 = playersData.filter(player => player.team_number === 1);
        const team2 = playersData.filter(player => player.team_number === 2);

        setTeam1Players(team1);
        setTeam2Players(team2);

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId, token]);




  //Fetching Game Stats

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


  // 2. Second useEffect - fetch match stats
  useEffect(() => {
    const fetchMatchStats = async () => {
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5001/api/match-stats/${matchId}`,
          {
            headers: {
              'Authorization': token,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMatchStats(data);
        }
      } catch (error) {
        console.error('Error fetching game stats:', error);
      }
    };

    if (matchId) {
      fetchMatchStats();
    }
  }, [matchId, showStatsModal, token]);



  useEffect(() => {
    if (stopwatchDuration === 0 || (currCourtType === 'Basketball' && shotClockDuration === 0)) {
      stopShotClock();
    }
  }, [stopwatchDuration, shotClockDuration, currCourtType]);


  const handleAddStat = async (playerId, statType) => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5001/api/add-player-stat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          creatorUserId: currUserId,
          playerId: playerId,
          matchId: matchId,
          stat: statType,
          gameday_id: gameId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add stat');
      }

      const data = await response.json();

      // Update match scores
      setMatch(prevMatch => ({
        ...prevMatch,
        team1_score: data.team1Score,
        team2_score: data.team2Score
      }));

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
        `http://${process.env.REACT_APP_DB_HOST}:5001/api/delete-stat/${statId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete stat');
      }

      const data = await response.json();

      // Update match scores
      setMatch(prevMatch => ({
        ...prevMatch,
        team1_score: data.team1Score,
        team2_score: data.team2Score
      }));
      setMatchStats(prevStats => prevStats.filter(stat => stat.id !== statId));
    } catch (error) {
      console.error('Error deleting stat:', error);
      alert('Failed to delete stat. Please try again.');
    }
  };

  const handleEndMatch = async () => {
    if (!window.confirm('Are you sure you want to end this match?')) {
      return;
    }

    setIsEndingMatch(true);

    try {
      // Determine winning team based on scores (now allowing ties)
      const winningTeam = match.team1_score > match.team2_score ? 1 :
        match.team2_score > match.team1_score ? 2 :
          0; // 0 indicates a tie

      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5001/api/end-match/${matchId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ winningTeam })
        }
      );

      if (response.status === 409) {
        // Match was already completed
        alert('This match has already been completed.');
        // Navigate back anyway since the match is done
        navigate(`/game/${gameId}/${courtId}?userId=${currUserId}`);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to end match');
      }

      // Navigate back to gameday page
      navigate(`/game/${gameId}/${courtId}?userId=${currUserId}`);

    } catch (error) {
      console.error('Error ending match:', error);
      alert('Failed to end match. Please try again.');
    } finally {
      setIsEndingMatch(false);
    }
  };

  // Add this function to calculate player stats
  const calculatePlayerGameSummary = (playerName) => {
    const playerStats = matchStats.filter(stat => stat.player_name === playerName);

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



  if (isLoading) {
    return <div className="loading">Loading match data...</div>;
  }

  if (!match) {
    return <div className="error">Match not found</div>;
  }


  return (
    <div className="match-page">
      <div className="match-header">
        <Link
          to={`/game/${match.gameday_id}/${courtId}?userId=${currUserId}`}
          className="back-button"
        >
          ← Back to Gameday
        </Link>
      </div>

      <div className="score-board">
        <div className="team team1">
          <h2>Team 1</h2>
          <div className="score">{match.team1_score}</div>
          <div className="player-list">
            {team1Players.map(player => (
              <div
                key={player.player_id}
                className="player"
                onClick={() => {
                  if (match.match_status === 'completed') {
                    // Do not open the modal if the match is completed
                    return;
                  }
                  setSelectedPlayerForStats(player);
                  setShowStatsModal(true);
                }}
              >
                {player.name}
              </div>
            ))}
          </div>
        </div>

        <div className="clock-container">
          <div className="stopwatch-container">
            <div className="stopwatch-timer">
              <span className="stopwatch-time">{formatTime(stopwatchDuration)}</span>
              {match.court_type === 'Basketball' && (
                <span
                  className="shot-clock-time"
                  style={{ color: shotClockDuration <= 5 ? 'red' : 'white' }}
                >
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
              {match.court_type === 'Basketball' && (
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
                  <button className="shot-clock-button" onClick={resetShotClock24}>
                    Reset 24s
                  </button>
                  <button className="shot-clock-button" onClick={resetShotClock14}>
                    Reset 14s
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="team team2">
          <h2>Team 2</h2>
          <div className="score">{match.team2_score}</div>
          <div className="player-list">
            {team2Players.map(player => (
              <div
                key={player.player_id}
                className="player"
                onClick={() => {
                  if (match.match_status === 'completed') {
                    // Do not open the modal if the match is completed
                    return;
                  }
                  setSelectedPlayerForStats(player);
                  setShowStatsModal(true);
                }}
              >
                {player.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Match Button */}
      {match.match_status !== 'completed' && (
        <div className="end-match-container">
          <button
            className="end-match-button"
            onClick={handleEndMatch}
            disabled={isEndingMatch}
          >
            {isEndingMatch ? 'Ending Match...' : 'End Match'}
          </button>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="stats-modal-header">
              <h2 className="stats-modal-title">Add Stat for {selectedPlayerForStats?.name}</h2>
            </div>
            <div className="stats-modal-body">
              <div className="stats-buttons-grid">
                {match.court_type === 'Football' ? (
                  <>
                    <button className="stat-button goal-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 7)}>
                      <span className="stat-icon">⚽</span>
                      <span className="stat-text">Goal</span>
                    </button>
                    <button className="stat-button assist-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 8)}>
                      <span className="stat-icon">🎯</span>
                      <span className="stat-text">Assist</span>
                    </button>
                    <button className="stat-button miss-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 9)}>
                      <span className="stat-icon">🤦‍♂️</span>
                      <span className="stat-text">Embarrassing Miss</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="stat-button points-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 2)}>
                      <span className="stat-icon">✌️</span>
                      <span className="stat-text">2 Pointer</span>
                    </button>
                    <button className="stat-button points-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 3)}>
                      <span className="stat-icon">🎯</span>
                      <span className="stat-text">3 Pointer</span>
                    </button>
                    <button className="stat-button assist-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 4)}>
                      <span className="stat-icon">🤝</span>
                      <span className="stat-text">Assist</span>
                    </button>
                    <button className="stat-button defense-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 5)}>
                      <span className="stat-icon">🛡️</span>
                      <span className="stat-text">Block</span>
                    </button>
                    <button className="stat-button defense-stat" onClick={() => handleAddStat(selectedPlayerForStats?.player_id, 6)}>
                      <span className="stat-icon">🔄</span>
                      <span className="stat-text">Steal</span>
                    </button>

                  </>
                )}
              </div>
            </div>
            <button className="close-button" onClick={() => setShowStatsModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Stats List */}
      <div className="game-stats-section">
        <h3 className="game-stats-title">Match Statistics</h3>
        <div className="stats-table-container">
          {matchStats.length > 0 ? (
            <table className="stats-table">
              <thead>
                <tr>
                  <th className="time-column">Time</th>
                  <th className="player-column">Player</th>
                  <th className="stat-column">Stat</th>
                  <th className="delete-column">
                    {match.match_status === 'completed' ? '' : 'Delete'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchStats.map(stat => (
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
                      </span>
                    </td>
                    <td className="stat-column">
                      <span className="stat-name">{getStatDescription(stat.stat)}</span>
                    </td>
                    <td className="delete-column">
                      {match.match_status === 'completed' ? (
                        ''
                      ) : (
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

      {/* Player Summary Modal */}
      {showPlayerSummaryModal && selectedPlayerSummary && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="stats-modal-header">
              <h2 className="stats-modal-title">
                {selectedPlayerSummary.playerName}'s Match Summary
              </h2>
            </div>
            <div className="stats-modal-body">
              <div className="stats-summary-grid">
                {match.court_type === 'Football' ? (
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
                  </>
                )}
              </div>
            </div>
            <button className="close-button" onClick={() => setShowPlayerSummaryModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPage;