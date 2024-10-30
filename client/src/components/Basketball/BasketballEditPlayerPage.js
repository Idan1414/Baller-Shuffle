import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../EditPlayerPage.css';
import '../BackHomeButton.css';

const EditPlayerPage = () => {
  const navigate = useNavigate();
  const { id, courtId } = useParams();
  const { search } = useLocation();
  const [currCourtType, setCourtType] = useState('');
  const [currCourtName, setCourtName] = useState('');
  const [activeTab, setActiveTab] = useState('statistics');
  const [playerStats, setPlayerStats] = useState(null);
  const [playerGames, setPlayerGames] = useState([]);
  // At the top with other state declarations
  const [isLoading, setIsLoading] = useState({
    stats: true,
    games: true,
    player: true,
    courtInfo: true
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [userAssingedAlreadyError, setUserAssingedAlreadyError] = useState(false);
  const [player_user_fk_exists, setUserFkExsits] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');
  const userIdFromUrl = new URLSearchParams(search).get('userId');

  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  }

  const [playerAttributes, setPlayerAttributes] = useState({
    playerId: 0,
    name: '',
    profile_image: null,  // Add this line
    priority: '',
    scoring: 0,
    passing: 0,
    speed: 0,
    physical: 0,
    defence: 0,
    threePtShot: 0,
    rebound: 0,
    ballHandling: 0,
    postUp: 0,
    height: 0,
    overall: 0,
    overallToMix: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    priority: '',
    height: '',
    scoring: '',
    passing: '',
    speed: '',
    physical: '',
    defence: '',
    threePtShot: '',
    rebound: '',
    ballHandling: '',
    postUp: '',
    assignError: '',
  });

  useEffect(() => {
    if (!token || decodedToken.userId !== parseInt(currUserId, 10)) {
      navigate('/');
      return;
    }

    if (!decodedToken.courts || !decodedToken.courts.includes(courtId)) {
      navigate('/');
      return;
    }
  }, [token, userIdFromUrl]);

  useEffect(() => {
    setIsLoading(prev => ({ ...prev, courtInfo: true }));
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/court_info/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourtType(data[0].courtType);
        setCourtName(data[0].courtName);
      })
      .catch((error) => {
        console.error('Error fetching court info :', error);
      }).finally(() => {
        setIsLoading(prev => ({ ...prev, courtInfo: false }));
      });
  }, [courtId, token]);

  useEffect(() => {
    const userIdFromUrl = new URLSearchParams(search).get('userId');

    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/');
      return;
    }
    setIsLoading(prev => ({ ...prev, player: true }));
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/player/${id}/${courtId}`, {
      headers: {
        'Authorization': token,
      },
    })
      .then(response => response.json())
      .then(data => {
        setPlayerAttributes({ ...data });
      })
      .catch(error => console.error(error))
      .finally(() => {
        setIsLoading(prev => ({ ...prev, player: false }));
      });
  }, [courtId, id]);

  // Add this useEffect to fetch and handle the profile image
  useEffect(() => {
    if (id && token) {
      fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/player-picture/${id}`, {
        headers: {
          'Authorization': token,
        },
      })
        .then(response => {
          if (response.ok) {
            return response.blob();
          }
          throw new Error('Failed to fetch image');
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch(error => {
          console.error('Error loading profile image:', error);
        });
    }
  }, [id, token]);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setIsLoading(prev => ({ ...prev, stats: true }));
      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5000/api/player-statistics/${id}/${courtId}`,
          {
            headers: { Authorization: token }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        // Round all decimal values to 1 decimal place for display
        const formattedStats = {
          ...data,
          ppg: Number(data.ppg || 0).toFixed(1),
          apg: Number(data.apg || 0).toFixed(1),
          spg: Number(data.spg || 0).toFixed(1),
          bpg: Number(data.bpg || 0).toFixed(1),
          threeptpg: Number(data.threeptpg || 0).toFixed(1),
          wins: data.total_wins || 0,
          mvps: data.num_of_mvps || 0,
        };

        setPlayerStats(formattedStats);
      } catch (error) {
        console.error('Error fetching player statistics:', error);
        // Set default values if fetch fails
        setPlayerStats({
          total_games_played: 0,
          total_points: 0,
          ppg: "0.0",
          apg: "0.0",
          spg: "0.0",
          bpg: "0.0",
          threeptpg: "0.0",
          wins: 0,
          mvps: 0
        });
      } finally {
        setIsLoading(prev => ({ ...prev, stats: false }));
      }
    };

    if (id && courtId && token) {
      fetchPlayerStats();
    }
  }, [id, courtId, token]);


  useEffect(() => {
    const fetchPlayerGames = async () => {
      setIsLoading(prev => ({ ...prev, games: true }));

      try {
        const response = await fetch(
          `http://${process.env.REACT_APP_DB_HOST}:5000/api/player-games/${id}/${courtId}`,
          {
            headers: { Authorization: token }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        setPlayerGames(data);
      } catch (error) {
        console.error('Error fetching player games:', error);
        setPlayerGames([]); // Set empty array if fetch fails
      } finally {
        setIsLoading(prev => ({ ...prev, games: false }));
      }
    };

    if (id && courtId && token) {
      fetchPlayerGames();
    }
  }, [id, courtId, token]);


  useEffect(() => {
    const checkUserFk = () => {
      fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/is_player_assinged/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Error fetching user_fk: ' + response.statusText);
          }
        })
        .then((data) => {
          setUserFkExsits(data.userFkExists);
        })
        .catch((error) => {
          console.error('Error fetching user_fk:', error);
        });
    };

    checkUserFk();
  }, [id, token]);

  const validateName = () => {
    const isValid = /^[a-zA-Z\s]+$/.test(playerAttributes.name);
    return isValid ? '' : 'Please use only letters (uppercase or lowercase) and spaces';
  };

  const validateNumber = (value, min, max, fieldName) => {
    if (isNaN(value) || value < min || value > max || value === '') {
      return `Please choose a number between ${min}-${max}`;
    }
    return '';
  };

  const validatePriority = (priority) => {
    const validPriorities = ['A', 'B', 'C'];
    if (!validPriorities.includes(priority)) {
      return 'Please select a valid priority (A, B, or C)';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerAttributes(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpdate = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/update-player-picture/${id}/${courtId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': token,
          },
          body: formData
        }
      );

      if (response.ok) {
        console.log('Profile picture updated successfully');
      } else {
        console.error('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        handleImageUpdate(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the cleanup for the profile image URL
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [imageUrl, previewUrl]);

  const calculateOverall = (attributes) => {
    const sum =
      attributes.scoring * 10 +
      attributes.passing * 5 +
      attributes.speed * 5 +
      attributes.physical * 6 +
      attributes.defence * 9 +
      attributes.threePtShot * 9 +
      attributes.rebound * 6 +
      attributes.ballHandling * 4 +
      attributes.postUp * 3 +
      (attributes.height / 2) * 8;

    return Math.round(sum / 65);
  };

  const handleUpdatePlayer = () => {
    const nameError = validateName();
    const heightError = validateNumber(playerAttributes.height, 50, 300, 'height');
    const priorityError = validatePriority(playerAttributes.priority);

    const numericalAttributes = {
      scoring: parseInt(playerAttributes.scoring, 10),
      passing: parseInt(playerAttributes.passing, 10),
      speed: parseInt(playerAttributes.speed, 10),
      physical: parseInt(playerAttributes.physical, 10),
      defence: parseInt(playerAttributes.defence, 10),
      threePtShot: parseInt(playerAttributes.threePtShot, 10),
      rebound: parseInt(playerAttributes.rebound, 10),
      ballHandling: parseInt(playerAttributes.ballHandling, 10),
      postUp: parseInt(playerAttributes.postUp, 10),
      height: parseInt(playerAttributes.height, 10),
    };

    const attributesErrors = {
      scoring: validateNumber(numericalAttributes.scoring, 0, 99, 'scoring'),
      passing: validateNumber(numericalAttributes.passing, 0, 99, 'passing'),
      speed: validateNumber(numericalAttributes.speed, 0, 99, 'speed'),
      physical: validateNumber(numericalAttributes.physical, 0, 99, 'physical'),
      defence: validateNumber(numericalAttributes.defence, 0, 99, 'defence'),
      threePtShot: validateNumber(numericalAttributes.threePtShot, 0, 99, 'threePtShot'),
      rebound: validateNumber(numericalAttributes.rebound, 0, 99, 'rebound'),
      ballHandling: validateNumber(numericalAttributes.ballHandling, 0, 99, 'ballHandling'),
      postUp: validateNumber(numericalAttributes.postUp, 0, 99, 'postUp'),
    };

    setErrors({
      name: nameError,
      height: heightError,
      priority: priorityError,
      ...attributesErrors,
    });

    if (!nameError && !priorityError && !heightError && !Object.values(attributesErrors).some(error => error !== '')) {
      const updatedPlayer = {
        ...playerAttributes,
        ...numericalAttributes,
        overall: calculateOverall(numericalAttributes),
      };

      fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/update_player/${id}/${courtId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(updatedPlayer),
      })
        .then(response => {
          if (response.ok) {
            navigate(`/edit-success/${courtId}?overall=${updatedPlayer.overall}&name=${encodeURIComponent(updatedPlayer.name)}&userId=${currUserId}`);
          } else {
            console.error('Failed to update player');
          }
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const handleAssignPlayer = (player_id, email, court_id) => {
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/assign_player/${player_id}/${email}/${court_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      }
    })
      .then(response => {
        if (response.ok) {
          setEmailError(false);
          setUserAssingedAlreadyError(false);
          setIsAssignPopupOpen(false);
          setUserFkExsits(true);
          setShowSuccessPopup(true);
          setTimeout(() => {
            setShowSuccessPopup(false);
          }, 4000);
        } else if (response.status === 404) {
          setUserAssingedAlreadyError(false);
          setEmailError(true);
        } else if (response.status === 400) {
          setEmailError(false);
          setUserAssingedAlreadyError(true);
        } else {
          setEmailError(true);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setEmailError(true);
      });
  };

  const StatCard = ({ label, value }) => (
    <div className="stat-card">
      <div className="stat-label-ep">{label}</div>
      <div className="stat-value">
        {label.includes('Per Game') ?
          (typeof value === 'string' ? value : Number(value).toFixed(1)) :
          Math.round(value)}
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner">Loading...</div>
    </div>
  );

  const isPageLoading = Object.values(isLoading).some(load => load === true);


  return (
    <>
      {isPageLoading && <LoadingSpinner />}
      <div className="player-profile">
        {/* Success Pop-up */}
        {showSuccessPopup && (
          <div className={`EP-success-popup ${showSuccessPopup ? 'show' : 'hide'}`}>
            Now {email} will see this court in his Courts Page
          </div>
        )}

        <div className="profile-header">
        <div className="ep-back-button-container">
        <Link
          to={`/court_home_page/${courtId}?userId=${currUserId}`}
          className="back-home-button-home"
        >
          🏠
        </Link>
      </div>
          <h1 className="profile-name">{playerAttributes.name}</h1>
          <div className="profile-image-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="profile-image" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                {playerAttributes.name?.split(' ').slice(0, 2).map(word => `${word.charAt(0).toUpperCase()} `).join('')}
              </div>
            )}
          </div>
        </div>

        {!player_user_fk_exists && (
          <button className="EP-assign-button" onClick={() => setIsAssignPopupOpen(true)}>
            Assign Player to a user
          </button>
        )}

        {isAssignPopupOpen && (
          <div className="EP-assign-popup active">
            <h3 style={{ color: 'white' }}>Assign Player to a user if he is already registered with his Email</h3>

            <input
              type="email"
              placeholder="Enter user's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />


            <button
              className="EP-assign-button"
              onClick={() => handleAssignPlayer(id, email, courtId)}
            >
              Assign
            </button>
            {errors.assignError && <p className="EP-error-message">{errors.assignError}</p>}

            {/* New error message for email not existing */}
            {emailError && <p className="EP-error-message">Email does not exist in the system, please ask your friend to register to BallerShuffle.</p>}
            {userAssingedAlreadyError && <p className="EP-error-message">This username(Email) is already assigned to a player in this court.</p>}

            <button
              className="EP-close-button"
              onClick={() => {
                setIsAssignPopupOpen(false);
                setEmailError(false); // Reset email error state
                setEmail(''); // Clear the email input field
              }}
            >
              Cancel
            </button>
          </div>
        )}


        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
          <button
            className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            Games
          </button>
          <button
            className={`tab-button ${activeTab === 'attributes' ? 'active' : ''}`}
            onClick={() => setActiveTab('attributes')}
          >
            Edit Card
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'statistics' && (
            <div className="statistics-grid">
              {isPageLoading ? (
                <div className="loading">Loading statistics...</div>
              ) : currCourtType === 'Basketball' ? (
                <>
                  <StatCard label="🎮 Games Played" value={playerStats?.total_games_played || 0} />
                  <StatCard label="🏀 Total Points" value={parseInt(playerStats?.total_points) || 0} />
                  <StatCard label="📊 Points Per Game" value={playerStats?.ppg || "0.0"} />
                  <StatCard label="🤝 Assists Per Game" value={playerStats?.apg || "0.0"} />
                  <StatCard label="🧤 Steals Per Game" value={playerStats?.spg || "0.0"} />
                  <StatCard label="🛡️ Blocks Per Game" value={playerStats?.bpg || "0.0"} />
                  <StatCard label="🎯 3PT Per Game" value={playerStats?.threeptpg || "0.0"} />
                  <StatCard label="🏆 Wins" value={playerStats?.wins || 0} />
                  <StatCard label="⭐ MVPs" value={playerStats?.mvps || 0} />
                </>
              ) : (
                <>
                  <StatCard label="🎮 Games Played" value={playerStats?.total_games_played || 0} />
                  <StatCard label="⚽ Total Goals" value={playerStats?.total_goals || 0} />
                  <StatCard label="📊 Goals Per Game" value={playerStats?.gpg || "0.0"} />
                  <StatCard label="🤝 Assists Per Game" value={playerStats?.apg || "0.0"} />
                  <StatCard label="🏆 Wins" value={playerStats?.wins || 0} />
                  <StatCard label="⭐ MVPs" value={playerStats?.mvps || 0} />
                </>
              )}
            </div>
          )}

          {activeTab === 'games' && (
            <div className="games-list">
              {playerGames.length === 0 ? (
                <div className="no-games">No games played yet</div>
              ) : (
                playerGames.map(game => (
                  <Link
                    key={game.game_id}
                    to={`/game/${game.game_id}/${courtId}?userId=${currUserId}`}
                    className="game-card"
                  >
                    <div className="game-header">
                      <div>
                        <div className="game-date">
                          {new Date(game.start_date).toDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="game-location">{game.location}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="edit-form">
              <div className="EP-input-container">
                <label htmlFor="name">Name :</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={playerAttributes.name}
                  onChange={handleInputChange}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              <div className="EP-input-container">
                <label>Profile Picture:</label>
                <div className="image-upload-container">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                  />
                </div>
              </div>

              {/* Priority Dropdown */}
              <div className="EP-input-container">
                <label htmlFor="priority">Priority:</label>
                <select
                  id="priority"
                  name="priority"
                  value={playerAttributes.priority}
                  onChange={handleInputChange}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                {errors.priority && <p className="error-message">{errors.priority}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="height">Height (cm) :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="height"
                  name="height"
                  value={playerAttributes.height}
                  onChange={handleInputChange}
                />
                {errors.height && <p className="EP-error-message">{errors.height}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="scoring">Scoring :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="scoring"
                  name="scoring"
                  value={playerAttributes.scoring}
                  onChange={handleInputChange}
                />
                {errors.scoring && <p className="EP-error-message">{errors.scoring}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="passing">Passing :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="passing"
                  name="passing"
                  value={playerAttributes.passing}
                  onChange={handleInputChange}
                />
                {errors.passing && <p className="EP-error-message">{errors.passing}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="speed">Speed :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="speed"
                  name="speed"
                  value={playerAttributes.speed}
                  onChange={handleInputChange}
                />
                {errors.speed && <p className="EP-error-message">{errors.speed}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="physical">Physical :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="physical"
                  name="physical"
                  value={playerAttributes.physical}
                  onChange={handleInputChange}
                />
                {errors.physical && <p className="EP-error-message">{errors.physical}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="defence">Defence :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="defence"
                  name="defence"
                  value={playerAttributes.defence}
                  onChange={handleInputChange}
                />
                {errors.defence && <p className="EP-error-message">{errors.defence}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="threePtShot">3 PT Shot :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="threePtShot"
                  name="threePtShot"
                  value={playerAttributes.threePtShot}
                  onChange={handleInputChange}
                />
                {errors.threePtShot && <p className="EP-error-message">{errors.threePtShot}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="rebound">Rebound :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="rebound"
                  name="rebound"
                  value={playerAttributes.rebound}
                  onChange={handleInputChange}
                />
                {errors.rebound && <p className="EP-error-message">{errors.rebound}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="ballHandling">Ball Handling :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="ballHandling"
                  name="ballHandling"
                  value={playerAttributes.ballHandling}
                  onChange={handleInputChange}
                />
                {errors.ballHandling && <p className="EP-error-message">{errors.ballHandling}</p>}
              </div>

              <div className="EP-input-container">
                <label htmlFor="postUp">Post Up :</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="postUp"
                  name="postUp"
                  value={playerAttributes.postUp}
                  onChange={handleInputChange}
                />
                {errors.postUp && <p className="EP-error-message">{errors.postUp}</p>}
              </div>

              <button className='EP-calc-save-button' onClick={() => handleUpdatePlayer()}>Update Player</button>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditPlayerPage;