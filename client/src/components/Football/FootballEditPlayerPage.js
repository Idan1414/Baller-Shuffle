import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../EditPlayerPage.css';
import '../BackHomeButton.css';

const FootballEditPlayerPage = () => {
  const navigate = useNavigate();
  const { id, courtId } = useParams();
  const { search } = useLocation();
  const [currCourtType, setCourtType] = useState('');
  const [currCourtName, setCourtName] = useState('');
  const [activeTab, setActiveTab] = useState('statistics');
  const [playerStats, setPlayerStats] = useState(null);
  const [playerGames, setPlayerGames] = useState([]);
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
  const [playerUserFk, setUserFk] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
    profile_image: null,
    priority: '',
    creator_user_fk: null,
    finishing: 0,
    passing: 0,
    speed: 0,
    physical: 0,
    defence: 0,
    dribbling: 0,
    stamina: 0,
    overall: 0,
    overallToMix: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    priority: '',
    finishing: '',
    passing: '',
    speed: '',
    physical: '',
    defence: '',
    dribbling: '',
    stamina: '',
    assignError: '',
  });

  // Authentication and navigation check
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

  // Fetch court info
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

  // Check if user is admin
  useEffect(() => {
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/is_admin/${currUserId}/${courtId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
      })
      .catch((error) => {
        console.error('Error fetching admin status:', error);
      });
  }, [currUserId, courtId, token]);

  // Fetch player data
  useEffect(() => {
    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/');
      return;
    }
    setIsLoading(prev => ({ ...prev, player: true }));
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/football-player/${id}/${courtId}`, {
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

  // Fetch player picture
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

  // Check if player is assigned
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
          setUserFk(data.user_fk);
        })
        .catch((error) => {
          console.error('Error fetching user_fk:', error);
        });
    };

    checkUserFk();
  }, [id, token]);

  // Fetch player stats
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
        const formattedStats = {
          ...data,
          gpg: Number(data.gpg || 0).toFixed(1),
          apg: Number(data.apg || 0).toFixed(1),
          mpg: Number(data.mpg || 0).toFixed(1),
          total_goals: data.total_goals || 0,
          total_assists: data.total_assists || 0,
          total_misses: data.total_misses || 0,
          wins: data.total_wins || 0,
          mvps: data.num_of_mvps || 0,
        };

        setPlayerStats(formattedStats);
      } catch (error) {
        console.error('Error fetching player statistics:', error);
        setPlayerStats({
          total_games_played: 0,
          total_goals: 0,
          gpg: "0.0",
          apg: "0.0",
          mpg: "0.0",
          total_assists: 0,
          total_misses: 0,
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

  // Fetch player games
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
        setPlayerGames([]);
      } finally {
        setIsLoading(prev => ({ ...prev, games: false }));
      }
    };

    if (id && courtId && token) {
      fetchPlayerGames();
    }
  }, [id, courtId, token]);

  // Cleanup for image URLs
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

  const calculateOverall = (attributes) => {
    const sum =
      attributes.finishing * 10 +
      attributes.passing * 6 +
      attributes.speed * 7 +
      attributes.physical * 6 +
      attributes.defence * 6 +
      attributes.dribbling * 10 +
      attributes.stamina * 3;

    return Math.round(sum / 48);
  };

  const handleUpdatePlayer = () => {
    const nameError = validateName();
    const priorityError = validatePriority(playerAttributes.priority);

    const numericalAttributes = {
      speed: parseInt(playerAttributes.speed, 10),
      finishing: parseInt(playerAttributes.finishing, 10),
      passing: parseInt(playerAttributes.passing, 10),
      dribbling: parseInt(playerAttributes.dribbling, 10),
      defence: parseInt(playerAttributes.defence, 10),
      physical: parseInt(playerAttributes.physical, 10),
      stamina: parseInt(playerAttributes.stamina, 10)
    };

    const attributesErrors = {
      speed: validateNumber(numericalAttributes.speed, 0, 99, 'speed'),
      finishing: validateNumber(numericalAttributes.finishing, 0, 99, 'finishing'),
      passing: validateNumber(numericalAttributes.passing, 0, 99, 'passing'),
      dribbling: validateNumber(numericalAttributes.dribbling, 0, 99, 'dribbling'),
      defence: validateNumber(numericalAttributes.defence, 0, 99, 'defence'),
      physical: validateNumber(numericalAttributes.physical, 0, 99, 'physical'),
      stamina: validateNumber(numericalAttributes.stamina, 0, 99, 'stamina')
    };

    setErrors({
      name: nameError,
      priority: priorityError,
      ...attributesErrors,
    });

    if (!nameError && !priorityError && !Object.values(attributesErrors).some(error => error !== '')) {
      const updatedPlayer = {
        ...playerAttributes,
        ...numericalAttributes,
        overall: calculateOverall(numericalAttributes),
      };

      fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/update-player-football/${id}/${courtId}`, {
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
          } else if (response.status === 409) {
            alert("This name already exists in this court, please choose another name");
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

  const handleDeletePlayer = async (id, playerUserFk) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this player?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://${process.env.REACT_APP_DB_HOST}:5000/api/delete_player/${id}/${courtId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        alert('Player deleted successfully');
        if (playerUserFk == currUserId) {
          navigate(`/courts_page/${currUserId}`);
        } else {
          navigate(`/court_home_page/${courtId}?userId=${currUserId}`);
        }
      } else {
        alert('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error deleting player');
    }
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
          <div className="button-header-container">
            <div className="ep-back-button-container">
              <Link
                to={`/court_home_page/${courtId}?userId=${currUserId}`}
                className="ep-back-home-button-new"
              >
                🏠
              </Link>
            </div>

            {(isAdmin || playerUserFk == currUserId || playerAttributes.creator_user_fk == currUserId) && (
              <button
                className="delete-player-button"
                onClick={() => handleDeletePlayer(id, playerUserFk)}
              >
                Delete Player
              </button>
            )}
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

        {!player_user_fk_exists && (isAdmin || playerAttributes.creator_user_fk == currUserId)  && (
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
            {emailError && <p className="EP-error-message">Email does not exist in the system, please ask your friend to register to BallerShuffle.</p>}
            {userAssingedAlreadyError && <p className="EP-error-message">This username(Email) is already assigned to a player in this court.</p>}

            <button
              className="EP-close-button"
              onClick={() => {
                setIsAssignPopupOpen(false);
                setEmailError(false);
                setEmail('');
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
          {(isAdmin || playerUserFk == currUserId || playerAttributes.creator_user_fk == currUserId) ? (
            <button
              className={`tab-button ${activeTab === 'attributes' ? 'active' : ''}`}
              onClick={() => setActiveTab('attributes')}
            >
              Edit Card
            </button>
          ) : (
            <button
              className="tab-button disabled"
              disabled
              title="Only admins, player owners, or player creators can see attributes"
            >
              Edit Card
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'statistics' && (
            <div className="statistics-grid">
              <StatCard label="🎮 Games Played" value={playerStats?.total_games_played || 0} />
              <StatCard label="⚽ Total Goals" value={playerStats?.total_goals || 0} />
              <StatCard label="🎯 Total Assists" value={playerStats?.total_assists || 0} />
              <StatCard label="📊 Goals Per Game" value={playerStats?.gpg || "0.0"} />
              <StatCard label="📊 Assists Per Game" value={playerStats?.apg || "0.0"} />
              <StatCard label="🤦‍♂️ Total Misses" value={playerStats?.total_misses || 0} />
              <StatCard label="📊 Misses Per Game" value={playerStats?.mpg || "0.0"} />
              <StatCard label="🏆 Wins" value={playerStats?.wins || 0} />
              <StatCard label="⭐ MVPs" value={playerStats?.mvps || 0} />
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

              {(isAdmin || playerAttributes.creator_user_fk == currUserId) ? (
                <>
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

                  {['speed', 'finishing', 'passing', 'dribbling', 'defence', 'physical', 'stamina'].map(attr => (
                    <div key={attr} className="EP-input-container">
                      <label htmlFor={attr}>{attr.charAt(0).toUpperCase() + attr.slice(1)} :</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id={attr}
                        name={attr}
                        value={playerAttributes[attr]}
                        onChange={handleInputChange}
                      />
                      {errors[attr] && <p className="EP-error-message">{errors[attr]}</p>}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="EP-input-container">
                    <label htmlFor="name">Name :</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={playerAttributes.name}
                      disabled
                      className="disabled-input"
                    />
                  </div>

                  <div className="EP-input-container">
                    <label htmlFor="priority">Priority:</label>
                    <select
                      id="priority"
                      name="priority"
                      value={playerAttributes.priority}
                      disabled
                      className="disabled-input"
                    >
                      <option value={playerAttributes.priority}>{playerAttributes.priority}</option>
                    </select>
                  </div>

                  {['speed', 'finishing', 'passing', 'dribbling', 'defence', 'physical', 'stamina'].map(attr => (
                    <div key={attr} className="EP-input-container">
                      <label htmlFor={attr}>{attr.charAt(0).toUpperCase() + attr.slice(1)} :</label>
                      <input
                        type="number"
                        id={attr}
                        name={attr}
                        value={playerAttributes[attr]}
                        disabled
                        className="disabled-input"
                      />
                    </div>
                  ))}
                </>
              )}

              {(isAdmin || playerAttributes.creator_user_fk == currUserId || previewUrl) && (
                <button className='EP-calc-save-button' onClick={() => handleUpdatePlayer()}>
                  Update Player
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FootballEditPlayerPage;