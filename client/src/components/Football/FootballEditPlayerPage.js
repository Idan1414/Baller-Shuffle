import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../EditPlayerPage.css';
import '../BackHomeButton.css';



const FootballEditPlayerPage = () => {
  const navigate = useNavigate();
  const { id, courtId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New state for success pop-up


  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);  // Use jwtDecode instead of jwt_decode
  }

  const [playerAttributes, setPlayerAttributes] = useState({
    playerId: 0,
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
    assignError: '',
  });


  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [userAssingedAlreadyError, setUserAssingedAlreadyError] = useState(false);
  const [player_user_fk_exists, setUserFkExsits] = useState(false);




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


    // Fetch the player by playerId
    fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/football-player/${id}/${courtId}`, {
      headers: {
        'Authorization': token,
      },
    })
      .then(response => response.json())
      .then(data => {
        var selectedPlayer = data;
        setPlayerAttributes({ ...selectedPlayer });
      })
      .catch(error => console.error(error));
  }, [courtId, id]);


  useEffect(() => {
    // Function to check if user_fk exists for the player
    const checkUserFk = () => {
      fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/is_player_assinged/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse the JSON response
          } else {
            throw new Error('Error fetching user_fk: ' + response.statusText);
          }
        })
        .then((data) => {
          setUserFkExsits(data.userFkExists); // Set the state based on the response
        })
        .catch((error) => {
          console.error('Error fetching user_fk:', error);
        });
    };

    checkUserFk();
  }, [id, token]); // Dependencies include id and token


  const validateName = () => {
    // Add your name validation logic here
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

  const handleUpdatePlayer = (currCourtName, currCourtType) => {
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
      dribbling: validateNumber(numericalAttributes.dribbling, 0, 99, 'dribbling'),
      header: validateNumber(numericalAttributes.header, 0, 99, 'header'),
    };

    setErrors({
      name: nameError,
      ...attributesErrors,
    });
    const storedPlayers = JSON.parse(localStorage.getItem(`court_${courtId}_players`)) || [];

    if (!nameError && !Object.values(attributesErrors).some(error => error !== '')) {
      // Update the player's attributes
      const updatedPlayer = {
        ...playerAttributes,
        ...numericalAttributes,
        overall: calculateOverall(numericalAttributes),
      };


      // Send the updated player data to the server
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
            navigate(`/edit_success/${courtId}?overall=${updatedPlayer.overall}&name=${encodeURIComponent(updatedPlayer.name)}&userId=${currUserId}`);
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
          console.log("Player has been assigned to a user");
          setEmailError(false); // Reset email error on successful assignment
          setUserAssingedAlreadyError(false)
          setIsAssignPopupOpen(false);
          setUserFkExsits(true);
          setShowSuccessPopup(true);
          setTimeout(() => {
            setShowSuccessPopup(false);
          }, 4000);
        } else if (response.status === 404) {
          // If the response indicates that the email does not exist
          setUserAssingedAlreadyError(false)
          setEmailError(true);
          console.error('Email does not exist');
        } else if (response.status === 400) {
          // Handle the case where the user is already assigned to the player in the specified court
          setEmailError(false);
          setUserAssingedAlreadyError(true)
          console.error('This username(Email) is already assigned to a player in the specified court');
        } else {// Handle other error responses here if necessary
          setEmailError(true);
          console.error('An error occurred while assigning the player');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setEmailError(true); // Set error state in case of fetch error
      });
  }



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

    // Round to the nearest whole number
    return Math.round(average);
  };

  return (
    <div className="EP-edit-player-page-style">
      <h1 className='EP-title'>Edit Player</h1>
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
          {errors.assignError && <p className="error-message">{errors.assignError}</p>}

          {/* New error message for email not existing */}
          {emailError && <p className="error-message">Email does not exist in the system, please ask your friend to register to BallerShuffle.</p>}
          {userAssingedAlreadyError && <p className="error-message">This username(Email) is already assigned to a player in this court.</p>}

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
      {/* Success Pop-up */}
      {showSuccessPopup && (
        <div className={`EP-success-popup ${showSuccessPopup ? 'show' : 'hide'}`}>
          Now {email} will see this court in his Courts Page
        </div>
      )}
      <div className="EP-input-container">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={playerAttributes.name}
          onChange={handleInputChange}
        />
        {errors.name && <p className="EP-error-message">{errors.name}</p>}
      </div>

      <div className="EP-input-container">
        <label htmlFor="finishing">Finishing:</label>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          id="finishing"
          name="finishing"
          value={playerAttributes.finishing}
          onChange={handleInputChange}
        />
        {errors.finishing && <p className="EP-error-message">{errors.finishing}</p>}
      </div>

      <div className="EP-input-container">
        <label htmlFor="passing">Passing:</label>
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
        <label htmlFor="speed">Speed:</label>
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
        <label htmlFor="physical">Physical:</label>
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
        <label htmlFor="defence">Defence:</label>
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
        <label htmlFor="dribbling">Dribbling:</label>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          id="dribbling"
          name="dribbling"
          value={playerAttributes.dribbling}
          onChange={handleInputChange}
        />
        {errors.dribbling && <p className="EP-error-message">{errors.dribbling}</p>}
      </div>

      <div className="EP-input-container">
        <label htmlFor="header">Header:</label>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          id="header"
          name="header"
          value={playerAttributes.header}
          onChange={handleInputChange}
        />
        {errors.header && <p className="EP-error-message">{errors.header}</p>}
      </div>


      <button className='EP-calc-save-button' onClick={() => handleUpdatePlayer(currCourtName, currCourtType)}>Update Player</button>
      <Link to={`/court_home_page/${courtId}?userId=${currUserId}`} className="back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default FootballEditPlayerPage;
