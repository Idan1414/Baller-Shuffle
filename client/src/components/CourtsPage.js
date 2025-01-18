import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './CourtsPage.css';
import { jwtDecode } from 'jwt-decode';

const CourtsPage = () => {

  const [selectedCourt, setSelectedCourt] = useState(null);
  const { userId } = useParams();
  const [courts, setCourts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Get access to the navigate function


  //Decoding the token of the user
  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);  // Use jwtDecode instead of jwt_decode
  }

  // Add a function to preload images
  const preloadImages = async () => {
    const images = ['/public/BasketBallWallpaper.jpg', '/public/FootBallWallpaper.jpg'];
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
      });
    };

    try {
      await Promise.all(images.map(loadImage));
      setIsLoading(false);
    } catch (error) {
      console.error('Error preloading images:', error);
      setIsLoading(false); // Still set loading to false to show content
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token || decodedToken.userId !== parseInt(userId, 10)) {
        navigate('/');
        return;
      }

      try {
        // Update token
        const updateTokenResponse = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5001/api/update-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({ token }),
        });

        if (!updateTokenResponse.ok) {
          throw new Error('Failed to update token');
        }

        const { token: newToken } = await updateTokenResponse.json();
        localStorage.setItem('token', newToken);
        console.log('Token updated with new court access');

        // Fetch courts
        const courtsResponse = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5001/api/courts/${userId}`, {
          headers: {
            'Authorization': token,
          },
        });

        const data = await courtsResponse.json();
        setCourts(data);
        await preloadImages();
      } catch (error) {
        console.error('Error:', error);
      }
      setIsLoading(false);
    };


    fetchData();

  }, [userId, navigate]);



  const handleDeleteCourt = async (event, court) => {
    event.preventDefault();
    event.stopPropagation();

    const isConfirmed = window.confirm(`Are you sure you want to remove ${court.courtName}?`);
    if (!isConfirmed) return;

    try {
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5001/api/delete_court/${userId}/${court.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const updatedCourts = courts.filter((c) => c.id !== court.id);
        setCourts(updatedCourts);
        alert('Court deleted successfully');
      } else {
        alert('Failed to delete court');
      }
    } catch (error) {
      console.error('Error deleting court:', error);
      alert('Error deleting court');
    }
  };



  const handleLogout = () => {
    // Perform any logout logic here in the future when I will use Auth token

    navigate('/'); // Navigate back to the home page
  };


  // Add loading spinner CSS
  const loadingStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  };

  if (isLoading) {
    return (
      <div style={loadingStyles}>
        <div className="loading-spinner-cp"></div>
      </div>
    );
  }

  return (
    <div className="home-page-style">
      <div className="header-buttons-container">
        <button onClick={handleLogout} className="logout-button">
          Log out
        </button>
      </div>
      <img src="/HadarLOGO.png" alt="Baller Shuffle Logo" className='logo-image1' />
      <h1 className="courtsPage-title">My Courts</h1>
      <Link to={`/new-court/${userId}`} className="create-new-court-button">
        Create New Court
      </Link>
      <div className="courts-list">
        {Array.isArray(courts) ? courts.map((court) => (
          <Link
            to={court.courtType === 'Basketball' ?
              `/court_home_page/${court.id}?userId=${userId}` :
              `/court_home_page/${court.id}?userId=${userId}`} className={`court-link ${court.courtType === 'Basketball' ? 'pastelOrange' : 'pastelGreen'}`}
          >
            <div key={court.id} className={`CourtsPage-cube ${court.courtType === 'Basketball' ? 'pastelOrange' : 'pastelGreen'}`} onMouseEnter={() => setSelectedCourt(court)} onMouseLeave={() => setSelectedCourt(null)}>
              <p>{court.courtName}</p>
              {selectedCourt === court && (
                <div className="delete-court-button" onClick={(e) => handleDeleteCourt(e, court)}>
                  🗑️
                </div>
              )}
            </div>
          </Link>
        )) : <p>You don't belong to any court, ask your friends to create a player for you and assign your Email</p>}

      </div>

    </div>
  );
};

export default CourtsPage;
