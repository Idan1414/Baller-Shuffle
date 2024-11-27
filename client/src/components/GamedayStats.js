// GamedayStats.js
import React, { useState, useEffect } from 'react';
import './GamedayStats.css';

const GamedayStats = ({ matchPlayers, currCourtType, gameId, token }) => {
  const [gameStats, setGameStats] = useState([]);
  const [sortKey, setSortKey] = useState(currCourtType === 'Basketball' ? 'total_points' : 'total_goals_today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGamedayStats = async () => {
      try {
        const endpoint = currCourtType === 'Basketball' ? 'basketball_gameday_stats' : 'football_gameday_stats';
        
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5000/api/${endpoint}/${gameId}`,
          {
            headers: {
              'Authorization': token,
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch gameday stats');
        }

        const data = await response.json();
        
        const allPlayerStats = matchPlayers.map(player => {
          const existingStats = data.find(stat => stat.player_id === player.playerId) || {};
          const baseStats = {
            player_id: player.playerId,
            player_name: player.playerName,
            total_matches_today: 0,
            total_wins_today: 0,
            ...existingStats
          };

          if (currCourtType === 'Basketball') {
            return {
              ...baseStats,
              total_2pts_today: 0,
              total_3pts_today: 0,
              total_assists_today: 0,
              total_steals_today: 0,
              total_blocks_today: 0,
              ...existingStats,
              total_points: ((existingStats.total_2pts_today || 0) * 2) + 
                          ((existingStats.total_3pts_today || 0) * 3)
            };
          } else {
            return {
              ...baseStats,
              total_goals_today: 0,
              total_assists_today: 0,
              total_misses_today: 0,
              ...existingStats
            };
          }
        });

        const initialSortKey = currCourtType === 'Basketball' ? 'total_points' : 'total_goals_today';
        const sortedStats = performSort(allPlayerStats, initialSortKey);
        setGameStats(sortedStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching gameday stats:', error);
        setIsLoading(false);
      }
    };

    if (gameId && matchPlayers.length > 0) {
      fetchGamedayStats();
    }
  }, [gameId, currCourtType, token]);

  const performSort = (data, key) => {
    return [...data].sort((a, b) => {
      const aValue = Number(a[key]) || 0;
      const bValue = Number(b[key]) || 0;
      return bValue - aValue;  // Always descending
    });
  };

  const sortData = (key) => {
    setSortKey(key);
    const sortedData = performSort(gameStats, key);
    setGameStats(sortedData);
  };

  const getSortIndicator = (key) => {
    return key === sortKey ? ' 🔽' : '';
  };

  const renderTableHeaders = () => {
    if (currCourtType === 'Basketball') {
      return (
        <tr>
          <th className="text-left-small">Place</th>
          <th className="text-left-small">Player</th>
          <th className="sortable-small" onClick={() => sortData('total_matches_today')}>
            Games{getSortIndicator('total_matches_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_points')}>
            PTS{getSortIndicator('total_points')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_2pts_today')}>
            2PT{getSortIndicator('total_2pts_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_3pts_today')}>
            3PT{getSortIndicator('total_3pts_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_assists_today')}>
            AST{getSortIndicator('total_assists_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_steals_today')}>
            STL{getSortIndicator('total_steals_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_blocks_today')}>
            BLK{getSortIndicator('total_blocks_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_wins_today')}>
            Wins{getSortIndicator('total_wins_today')}
          </th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th className="text-left-small">Place</th>
          <th className="text-left-small">Player</th>
          <th className="sortable-small" onClick={() => sortData('total_matches_today')}>
            Games{getSortIndicator('total_matches_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_goals_today')}>
            Goals{getSortIndicator('total_goals_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_assists_today')}>
            AST{getSortIndicator('total_assists_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_misses_today')}>
            Miss{getSortIndicator('total_misses_today')}
          </th>
          <th className="sortable-small" onClick={() => sortData('total_wins_today')}>
            Wins{getSortIndicator('total_wins_today')}
          </th>
        </tr>
      );
    }
  };

  const renderTableRow = (stat, index) => {
    const rowClassPlayerName = index === 0 ? 'top-1' : 
                             index === 1 ? 'top-2' : 
                             index === 2 ? 'top-3' : '';

    if (currCourtType === 'Basketball') {
      return (
        <tr key={stat.player_id} style={{ '--row-index': index }}>
          <td className={rowClassPlayerName}>{index + 1}</td>
          <td className={`text-left-small ${rowClassPlayerName}`}>{stat.player_name}</td>
          <td>{stat.total_matches_today || 0}</td>
          <td>{stat.total_points || 0}</td>
          <td>{stat.total_2pts_today || 0}</td>
          <td>{stat.total_3pts_today || 0}</td>
          <td>{stat.total_assists_today || 0}</td>
          <td>{stat.total_steals_today || 0}</td>
          <td>{stat.total_blocks_today || 0}</td>
          <td>{stat.total_wins_today || 0}</td>
        </tr>
      );
    } else {
      return (
        <tr key={stat.player_id} style={{ '--row-index': index }}>
          <td className={rowClassPlayerName}>{index + 1}</td>
          <td className={`text-left-small ${rowClassPlayerName}`}>{stat.player_name}</td>
          <td>{stat.total_matches_today || 0}</td>
          <td>{stat.total_goals_today || 0}</td>
          <td>{stat.total_assists_today || 0}</td>
          <td>{stat.total_misses_today || 0}</td>
          <td>{stat.total_wins_today || 0}</td>
        </tr>
      );
    }
  };

  return (
    <div className="gameday-stats-section">
      <h3 className="gameday-stats-title">Gameday Statistics</h3>
      {isLoading ? (
        <div className="loading-message">Loading statistics...</div>
      ) : (
        <div className="gameday-stats-table-container">
          <table className="gameday-stats-table">
            <thead>{renderTableHeaders()}</thead>
            <tbody>
              {gameStats.map((stat, index) => renderTableRow(stat, index))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GamedayStats;