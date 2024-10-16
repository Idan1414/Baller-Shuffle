import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './FootballCreatePlayerPage.css';
import { jwtDecode } from 'jwt-decode';


const FootballCreatePlayerPage = () => {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const userIdFromUrl = new URLSearchParams(search).get('userId');
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');

  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);  // Use jwtDecode instead of jwt_decode
  }



  const [playerAttributes, setPlayerAttributes] = useState({
    name: '',
    finishing: 0,
    passing: 0,
    speed: 0,
    physical: 0,
    defence: 0,
    dribbling: 0,
    header: 0,
    overall: 0,
    overallToMix: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    finishing: '',
    passing: '',
    speed: '',
    physical: '',
    defence: '',
    dribbling: '',
    header: '',
  });


  const [averages, setAverages] = useState(null);
  const [averagesError, setAveragesError] = useState('');

  useEffect(() => {
    if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
      navigate('/'); // Redirect to home if not authorized
    }
  }, [token, decodedToken, userIdFromUrl, navigate]);




  useEffect(() => {
    const fetchAverages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/football-court/${courtId}/averages`, {
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

    const numericalAttributes = {
      finishing: parseInt(playerAttributes.finishing, 10),
      passing: parseInt(playerAttributes.passing, 10),
      speed: parseInt(playerAttributes.speed, 10),
      physical: parseInt(playerAttributes.physical, 10),
      defence: parseInt(playerAttributes.defence, 10),
      dribbling: parseInt(playerAttributes.dribbling, 10),
      header: parseInt(playerAttributes.header, 10),
    };

    const attributesErrors = {
      finishing: validateNumber(numericalAttributes.finishing, 0, 99, 'finishing'),
      passing: validateNumber(numericalAttributes.passing, 0, 99, 'passing'),
      speed: validateNumber(numericalAttributes.speed, 0, 99, 'speed'),
      physical: validateNumber(numericalAttributes.physical, 0, 99, 'physical'),
      defence: validateNumber(numericalAttributes.defence, 0, 99, 'defence'),
      dribbling: validateNumber(numericalAttributes.dribbling, 0, 99, 'threePtShot'),
      header: validateNumber(numericalAttributes.header, 0, 99, 'rebound'),
    };

    setErrors({
      name: nameError,
      ...attributesErrors,
    });

    if (!nameError && !Object.values(attributesErrors).some((error) => error !== '')) {
      const playerData = {
        ...playerAttributes,
        ...numericalAttributes,
        overall: calculateOverall(numericalAttributes),
      };
      console.log(playerData);

      try {
        const response = await fetch(`http://localhost:5000/api/create_player_football/${courtId}/${currUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify(playerData),
        });

        if (response.ok) {
          console.log('Player created successfully');
          navigate(`/creation_success_football/${courtId}?overall=${playerData.overall}&name=${playerData.name}&courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`);
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
      attributes.finishing * 10 +
      attributes.passing * 6 +
      attributes.speed * 7 +
      attributes.physical * 6 +
      attributes.defence * 6 +
      attributes.dribbling * 10 +
      attributes.header * 3
    const average = sum / 48;
    return Math.round(average);
  };


  return (
    <div className="football-create-player-page-style">
      <h1 className="CP-title-football">Create New Player</h1>
      <div className="content-container-football">
        <div className="form-container-football">
          {/* Player Creation Form */}
          <div className="input-wrapper-football">
            <div className="input-container-football">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={playerAttributes.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            {/* Repeat similar input containers for other attributes */}
            {/* Finishing */}
            <div className="input-container-football">
              <label htmlFor="finishing">Finishing:</label>
              <input
                type="number"
                id="finishing"
                name="finishing"
                value={playerAttributes.finishing}
                onChange={handleInputChange}
              />
              {errors.finishing && <p className="error-message">{errors.finishing}</p>}
            </div>

            {/* Passing */}
            <div className="input-container-football">
              <label htmlFor="passing">Passing:</label>
              <input
                type="number"
                id="passing"
                name="passing"
                value={playerAttributes.passing}
                onChange={handleInputChange}
              />
              {errors.passing && <p className="error-message">{errors.passing}</p>}
            </div>

            {/* Speed */}
            <div className="input-container-football">
              <label htmlFor="speed">Speed:</label>
              <input
                type="number"
                id="speed"
                name="speed"
                value={playerAttributes.speed}
                onChange={handleInputChange}
              />
              {errors.speed && <p className="error-message">{errors.speed}</p>}
            </div>

            {/* Physical */}
            <div className="input-container-football">
              <label htmlFor="physical">Physical:</label>
              <input
                type="number"
                id="physical"
                name="physical"
                value={playerAttributes.physical}
                onChange={handleInputChange}
              />
              {errors.physical && <p className="error-message">{errors.physical}</p>}
            </div>

            {/* Defence */}
            <div className="input-container-football">
              <label htmlFor="defence">Defence:</label>
              <input
                type="number"
                id="defence"
                name="defence"
                value={playerAttributes.defence}
                onChange={handleInputChange}
              />
              {errors.defence && <p className="error-message">{errors.defence}</p>}
            </div>

            {/* Dribbling */}
            <div className="input-container-football">
              <label htmlFor="dribbling">Dribbling:</label>
              <input
                type="number"
                id="dribbling"
                name="dribbling"
                value={playerAttributes.dribbling}
                onChange={handleInputChange}
              />
              {errors.dribbling && <p className="error-message">{errors.dribbling}</p>}
            </div>

            {/* Header */}
            <div className="input-container-football">
              <label htmlFor="header">Header:</label>
              <input
                type="number"
                id="header"
                name="header"
                value={playerAttributes.header}
                onChange={handleInputChange}
              />
              {errors.header && <p className="error-message">{errors.header}</p>}
            </div>
          </div>


          {/* Averages Table */}
          <div className="averages-container-football">
            {averagesError && <p className="error-message">{averagesError}</p>}
            {averages ? (
              <table className="averages-table-football">
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
                    <td>Finishing</td>
                    <td>{averages.maxFinishing}</td>
                    <td>{averages.avgFinishing.toFixed(2)}</td>
                    <td>{averages.minFinishing}</td>
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
                    <td>Dribbling</td>
                    <td>{averages.maxDribbling}</td>
                    <td>{averages.avgDribbling.toFixed(2)}</td>
                    <td>{averages.minDribbling}</td>
                  </tr>
                  <tr>
                    <td>Header</td>
                    <td>{averages.maxHeader}</td>
                    <td>{averages.avgHeader.toFixed(2)}</td>
                    <td>{averages.minHeader}</td>
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
            <div className='button-container-football'>
              <button className="calc-save-button-football" onClick={handleCreatePlayer}>
                Create and Calculate Overall
              </button>
              <Link
                to={`/court_home_page_football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`}
                className="NPG-back-home-button-football"
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

export default FootballCreatePlayerPage;
