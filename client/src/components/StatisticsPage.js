import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './StatisticsPage.css';
import './BackHomeButton.css';


const StatisticsPage = () => {
  const [currCourtName, setCourtName] = useState('');
  const [currCourtType, setCourtType] = useState('');
  const [statistics, setStatistics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState('total_points'); // Default sort by points/goals
  const { search } = useLocation();
  const { courtId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');

  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  }


  useEffect(() => {
    // user_id validation
    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/'); // Redirect to home if not authorized
      return;
    }

    // Check if the user has access to the court
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


  // Fetch statistics after getting court type
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!currCourtType) return;

      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5000/api/court-statistics/${courtId}/${currCourtType}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [courtId, currCourtType, token]);

  const sortData = (key) => {
    setSortKey(key);
    const sortedData = [...statistics].sort((a, b) => {
      const aValue = a[key] || 0;
      const bValue = b[key] || 0;
      return bValue - aValue; // Always descending order
    });
    setStatistics(sortedData);
  };

  // Visual indicator for current sort column
  const getSortIndicator = (key) => {
    return sortKey === key ? ' 🔽' : '';
  };

  const renderTableHeaders = () => {
    if (currCourtType === 'Basketball') {
      return (
        <tr>
          <th className="text-left">Place</th>
          <th className="text-left">Player</th>
          <th className="sortable" onClick={() => sortData('total_games_played')}>
            Games{getSortIndicator('total_games_played')}
          </th>
          <th className="sortable" onClick={() => sortData('total_points')}>
            Points{getSortIndicator('total_points')}
          </th>
          <th className="sortable" onClick={() => sortData('ppg')}>
            PPG{getSortIndicator('ppg')}
          </th>
          <th className="sortable" onClick={() => sortData('apg')}>
            APG{getSortIndicator('apg')}
          </th>
          <th className="sortable" onClick={() => sortData('spg')}>
            SPG{getSortIndicator('spg')}
          </th>
          <th className="sortable" onClick={() => sortData('bpg')}>
            BPG{getSortIndicator('bpg')}
          </th>
          <th className="sortable" onClick={() => sortData('threeptpg')}>
            3PT/G{getSortIndicator('threeptpg')}
          </th>
          <th className="sortable" onClick={() => sortData('total_wins')}>
            Wins{getSortIndicator('total_wins')}
          </th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th className="text-left">Place</th>
          <th className="text-left">Player</th>
          <th className="sortable" onClick={() => sortData('total_games_played')}>
            Games{getSortIndicator('total_games_played')}
          </th>
          <th className="sortable" onClick={() => sortData('total_goals')}>
            Goals{getSortIndicator('total_goals')}
          </th>
          <th className="sortable" onClick={() => sortData('total_assists')}>
            Assists{getSortIndicator('total_assists')}
          </th>
          <th className="sortable" onClick={() => sortData('total_misses')}>
            Misses{getSortIndicator('total_misses')}
          </th>
          <th className="sortable" onClick={() => sortData('gpg')}>
            GPG{getSortIndicator('gpg')}
          </th>
          <th className="sortable" onClick={() => sortData('apg')}>
            APG{getSortIndicator('apg')}
          </th>
          <th className="sortable" onClick={() => sortData('total_wins')}>
            Wins{getSortIndicator('total_wins')}
          </th>
        </tr>
      );
    }
  };

  useEffect(() => {
    if (statistics.length > 0) {
      const initialSortKey = currCourtType === 'Basketball' ? 'total_points' : 'total_goals';
      sortData(initialSortKey);
    }
  }, [statistics.length]); // Only run when statistics are first loaded

  const renderTableRow = (stat, index) => {
    let rowClassPlayerName = '';
    if (index === 0) {
      rowClassPlayerName = 'top-1';
    } else if (index === 1) {
      rowClassPlayerName = 'top-2';
    } else if (index === 2) {
      rowClassPlayerName = 'top-3';
    }

    if (currCourtType === 'Basketball') {
      return (
        <tr
          key={stat.player_id}
          style={{ '--row-index': index }}
        >
          <td className={rowClassPlayerName}>{index + 1}</td>
          <td className={rowClassPlayerName}>{stat.player_name}</td>
          <td>{stat.total_games_played || 0}</td>
          <td>{stat.total_points || 0}</td>
          <td>{stat.ppg || '0.0'}</td>
          <td>{stat.apg || '0.0'}</td>
          <td>{stat.spg || '0.0'}</td>
          <td>{stat.bpg || '0.0'}</td>
          <td>{stat.threeptpg || '0.0'}</td>
          <td>{stat.total_wins || '0.0'}</td>
        </tr>
      );
    } else {
      return (
        <tr
          key={stat.player_id}
          style={{ '--row-index': index }}

        >
          <td className={rowClassPlayerName}>{index + 1}</td>
          <td className={rowClassPlayerName}>{stat.player_name}</td>
          <td>{stat.total_games_played || 0}</td>
          <td>{stat.total_goals || 0}</td>
          <td>{stat.total_assists || 0}</td>
          <td>{stat.total_misses || 0}</td>
          <td>{stat.gpg || '0.0'}</td>
          <td>{stat.apg || '0.0'}</td>
          <td>{stat.total_wins || '0.0'}</td>
        </tr>
      );
    }
  };

  return (
    <div className="statistics-page">

      <div className="header-container">
        <h1 className="statistics-title">{currCourtName} Leaders</h1>
        <Link to={`/court_home_page/${courtId}?userId=${currUserId}`} className="back-home-button-statistics">
          🏠
        </Link>
      </div>

      <div className="statistics-card">
        <h2 className="statistics-card-title">Player Statistics</h2>
        {isLoading ? (
          <div className="loading-message">Loading statistics...</div>
        ) : (
          <div className="table-container">
            <table className="statistics-table">
              <thead>
                {renderTableHeaders()}
              </thead>
              <tbody>
                {statistics.map((player_stats_row, index) => renderTableRow(player_stats_row, index))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;