import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import '../CreatePlayerPage.css';
import { jwtDecode } from 'jwt-decode';


const BasketballCreatePlayerPage = () => {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const { search } = useLocation();
  const [currCourtType, setCourtType] = useState('');
  const [currCourtName, setCourtName] = useState('');
  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');
  const userIdFromUrl = new URLSearchParams(search).get('userId');


  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  }



  const [playerAttributes, setPlayerAttributes] = useState({
    name: '',
    scoring: 0,
    passing: 0,
    speed: 0,
    physical: 0,
    defence: 0,
    threePtShot: 0,
    rebound: 0,
    ballHandling: 0,
    postUp: 0,
    height: 170,
  });

  const [errors, setErrors] = useState({
    name: '',
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
  });


  const [averages, setAverages] = useState(null);
  const [averagesError, setAveragesError] = useState('');

  useEffect(() => {
    if (!token || decodedToken.userId !== parseInt(currUserId, 10)) {
      navigate('/'); // Redirect to home if not authorized
      return;
    }

    // Check if the user has access to the court
    if (!decodedToken.courts || !decodedToken.courts.includes(courtId)) {
      navigate('/'); // Redirect to home if the user does not have access to this court
      return;
    }
  }, [token, decodedToken, userIdFromUrl, navigate]);

  useEffect(() => {
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

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/court_averages/${courtId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAverages(data);
        } else {
          const errorData = await response.json();
          setAveragesError(errorData.message || 'Error fetching averages');
        }
      } catch (error) {
        console.error('Network error:', error);
        setAveragesError('Network error');
      }
    };

    if (token) {
      fetchAverages();
    }
  }, [courtId, token]);



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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerAttributes((prevAttributes) => ({ ...prevAttributes, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCreatePlayer = async () => {
    const nameError = validateName();
    const heightError = validateNumber(playerAttributes.height, 50, 300, 'height');

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
      ...attributesErrors,
    });

    if (!nameError && !heightError && !Object.values(attributesErrors).some((error) => error !== '')) {
      const playerData = {
        ...playerAttributes,
        ...numericalAttributes,
        overall: calculateOverall(numericalAttributes),
      };
      console.log(playerData);

      try {
        const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/create_player/${courtId}/${currUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify(playerData),
        });

        if (response.ok) {
          console.log('Player created successfully');
          navigate(`/creation_success/${courtId}?overall=${playerData.overall}&name=${playerData.name}&courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`);
        } else {
          console.error('Error creating player:', response.statusText);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    }
  };

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

    const average = sum / 65;
    return Math.round(average);
  };



  return (
    <div className="create-player-page-style">
      <h1 className="CP-title">Create New Player</h1>
      <div className="CP-content-container">
        <div className="CP-form-container">
          {/* Player Creation Form */}
          <div className="CP-input-wrapper">
            <div className="CP-input-container">
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

            <div className="CP-input-container">
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
              {errors.height && <p className="error-message">{errors.height}</p>}
            </div>

            {/* Repeat similar input containers for other attributes */}
            {/* Scoring */}
            <div className="CP-input-container">
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
              {errors.scoring && <p className="error-message">{errors.scoring}</p>}
            </div>

            {/* Passing */}
            <div className="CP-input-container">
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
              {errors.passing && <p className="error-message">{errors.passing}</p>}
            </div>

            {/* Speed */}
            <div className="CP-input-container">
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
              {errors.speed && <p className="error-message">{errors.speed}</p>}
            </div>

            {/* Physical */}
            <div className="CP-input-container">
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
              {errors.physical && <p className="error-message">{errors.physical}</p>}
            </div>

            {/* Defence */}
            <div className="CP-input-container">
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
              {errors.defence && <p className="error-message">{errors.defence}</p>}
            </div>

            {/* 3 PT Shot */}
            <div className="CP-input-container">
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
              {errors.threePtShot && <p className="error-message">{errors.threePtShot}</p>}
            </div>

            {/* Rebound */}
            <div className="CP-input-container">
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
              {errors.rebound && <p className="error-message">{errors.rebound}</p>}
            </div>

            {/* Ball Handling */}
            <div className="CP-input-container">
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
              {errors.ballHandling && <p className="error-message">{errors.ballHandling}</p>}
            </div>

            {/* Post Up */}
            <div className="CP-input-container">
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
              {errors.postUp && <p className="error-message">{errors.postUp}</p>}
            </div>
          </div>


          {/* Averages Table */}
          <div className="averages-container">
            {averagesError && <p className="error-message-averages">No players in this court, no averages to present yet.</p>}
            {averages ? (
              <table className="averages-table">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Court Max</th>
                    <th>Court Average</th>
                    <th>Court Min</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Scoring</td>
                    <td>{averages.maxScoring}</td>
                    <td>{averages.avgScoring.toFixed(2)}</td>
                    <td>{averages.minScoring}</td>
                  </tr>
                  <tr>
                    <td>Passing</td>
                    <td>{averages.maxPassing}</td>
                    <td>{averages.avgPassing.toFixed(2)}</td>
                    <td>{averages.minPassing}</td>
                  </tr>
                  <tr>
                    <td>Speed</td>
                    <td>{averages.maxSpeed}</td>
                    <td>{averages.avgSpeed.toFixed(2)}</td>
                    <td>{averages.minSpeed}</td>
                  </tr>
                  <tr>
                    <td>Physical</td>
                    <td>{averages.maxPhysical}</td>
                    <td>{averages.avgPhysical.toFixed(2)}</td>
                    <td>{averages.minPhysical}</td>
                  </tr>
                  <tr>
                    <td>Defence</td>
                    <td>{averages.maxDefence}</td>
                    <td>{averages.avgDefence.toFixed(2)}</td>
                    <td>{averages.minDefence}</td>
                  </tr>
                  <tr>
                    <td>3 PT Shot</td>
                    <td>{averages.maxThreePtShot}</td>
                    <td>{averages.avgThreePtShot.toFixed(2)}</td>
                    <td>{averages.minThreePtShot}</td>
                  </tr>
                  <tr>
                    <td>Rebound</td>
                    <td>{averages.maxRebound}</td>
                    <td>{averages.avgRebound.toFixed(2)}</td>
                    <td>{averages.minRebound}</td>
                  </tr>
                  <tr>
                    <td>Ball Handling</td>
                    <td>{averages.maxBallHandling}</td>
                    <td>{averages.avgBallHandling.toFixed(2)}</td>
                    <td>{averages.minBallHandling}</td>
                  </tr>
                  <tr>
                    <td>Post Up</td>
                    <td>{averages.maxPostUp}</td>
                    <td>{averages.avgPostUp.toFixed(2)}</td>
                    <td>{averages.minPostUp}</td>
                  </tr>
                  <tr>
                    <td>COURT OVERALL</td>
                    <td>{averages.maxOverall}</td>
                    <td>{averages.avgOverall.toFixed(2)}</td>
                    <td>{averages.minOverall}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              !averagesError && <p>Loading averages...</p>
            )}
            <div className='CP-button-container'>
              <button className="calc-save-button" onClick={handleCreatePlayer}>
                Create and Calculate Overall
              </button>
              <Link
                to={`/court_home_page/${courtId}?userId=${currUserId}`}
                className="back-home-button"
              >
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BasketballCreatePlayerPage;
