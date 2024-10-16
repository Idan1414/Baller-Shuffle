import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import CreateGameModal from './CreateGameModal';
import './ScheduledGamesPage.css';



const ScheduledGamesPage = () => {
  const [games, setGames] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');
  const token = localStorage.getItem('token');

  const fetchGames = useCallback(() => {
    fetch(`http://localhost:5000/api/scheduled_games/${courtId}`, {
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
      });
  }, [courtId, token]);


  useEffect(() => {
    fetchGames(); // Fetch games when the component mounts or when courtId/token changes
  }, [fetchGames]);

  const handleGameCreated = () => {
    fetchGames(); // Re-fetch the games to update the list after a new game is created
    setModalVisible(false); // Close the modal after game creation
  };



  const courtHomePageLink = currCourtType === 'Basketball'
    ? `/court_home_page/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`
    : currCourtType === 'Football'
      ? `/court_home_page_football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`
      : '#';



  return (
    <div className="scheduled-games-page">
      <h1 className="scheduled-games-title">{currCourtName} - Scheduled Games</h1>
      <div className="button-container">
        <button className="create-game-button" onClick={() => setModalVisible(true)}>
          Create New Scheduled Game
        </button>
        <Link to={courtHomePageLink} className="back-home-button">
          Back to Home
        </Link>
      </div>
      {modalVisible && (
        <CreateGameModal
          onClose={() => setModalVisible(false)}
          onGameCreated={handleGameCreated} // Pass the callback for game creation
        />
      )}
      <div className="games-list">
        {games.length === 0 ? (
          <p>No scheduled games found.</p>
        ) : (
          games.map((game) => (
            <Link to={`/game/${game.game_id}/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} key={game.game_id} className="game-item">
              <div className="game-date">
                {new Date(game.start_date).toLocaleDateString()}
              </div>
              <div className="game-details">
                <p className="game-location">Location: {game.location}</p>
                <p className="game-mvp">MVP: {game.mvp.name}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledGamesPage;
