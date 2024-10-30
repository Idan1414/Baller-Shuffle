import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CreateGameModal from './CreateGameModal';
import './ScheduledGamesPage.css';

const ScheduledGamesPage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state added
  const { courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [currCourtName, setCourtName] = useState('');
  const [currCourtType, setCourtType] = useState('');
  const currUserId = searchParams.get('userId');
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


  const fetchGames = useCallback(() => {
    setLoading(true); // Set loading to true when fetch starts
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/scheduled_games/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGames(data);
        } else {
          console.warn('Expected data to be an array, but received:', data);
          setGames([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching scheduled games:', error);
        setGames([]);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after fetch completes
      });
  }, [courtId, token]);




  useEffect(() => {
    fetchGames(); // Fetch games when the component mounts or when courtId/token changes
  }, [courtId, token]);

  const handleGameCreated = () => {
    fetchGames(); // Re-fetch the games to update the list after a new game is created
    setModalVisible(false); // Close the modal after game creation
  };


  return (
    <div className="scheduled-games-page">
      <div className="sgp-back-button-container">
        <Link to={`/court_home_page/${courtId}?userId=${currUserId}`} className="back-home-button-home">
          🏠
        </Link>
      </div>
      <h1 className="scheduled-games-title">{currCourtName} - Games</h1>
      <div className="button-container">
        <button className="create-game-button" onClick={() => setModalVisible(true)}>
          Create New Scheduled Game
        </button>

      </div>
      {modalVisible && (
        <CreateGameModal
          onClose={() => setModalVisible(false)}
          onGameCreated={handleGameCreated} // Pass the callback for game creation
        />
      )}
      <div className="games-list">
        {loading ? (
          <p>Loading game details...</p>
        ) : games.length === 0 ? (
          <p>No scheduled games found.</p>
        ) : (
          games.map((game) => (
            <Link to={`/game/${game.game_id}/${courtId}?userId=${currUserId}`} key={game.game_id}
              className={` ${(game.mvps && game.mvps.length > 0) ? 'game-over-item' : 'game-item'}`}>
              <div className="game-date">
                {new Date(game.start_date).toLocaleDateString('en-IL', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}
              </div>
              <div className="game-details1">
                <p className="game-location">Location: {game.location}</p>
                <p className="game-mvp">
                  MVP: {game.mvps.map((mvp, index) => (
                    <span key={mvp.id}>
                      {mvp.name}{index < game.mvps.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              </div>

            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledGamesPage;
