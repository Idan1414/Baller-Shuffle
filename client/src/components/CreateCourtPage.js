import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './CreateCourtPage.css';
import './BackHomeButton.css';

const CreateCourtPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [courtSettings, setCourtSettings] = useState({
    courtName: '',
    courtType: '',
  });

  const token = localStorage.getItem('token');
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourtSettings((prevSettings) => ({ ...prevSettings, [name]: value }));
  };

  const handleCreateCourt = async () => {
    const nameIsOk = courtSettings.courtName.trim() !== '';
    const typeIsOk = courtSettings.courtType === 'Basketball' || courtSettings.courtType === 'Football';
  
    if (!nameIsOk) {
      return alert("Please write a name for the new court");
    }
    if (!typeIsOk) {
      return alert("Please select either 'Basketball' or 'Football'.");
    }
  
    console.log(courtSettings, userId);
    try {
      // Create the court
      const response = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/create_court/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(courtSettings),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create court.');
      }
  
      const newCourt = await response.json(); // Successfully created court, proceed with updating the token
  
      // Call the /update-token endpoint to refresh the token
      const updateTokenResponse = await fetch(`http://${process.env.REACT_APP_DB_HOST}:5000/api/update-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token, // Send token in Authorization header
        },
        body: JSON.stringify({ token }), // Pass the token in the body (optional depending on server-side implementation)
      });
  
      if (!updateTokenResponse.ok) {
        throw new Error('Failed to update token');
      }
  
      const { token: newToken } = await updateTokenResponse.json();
  
      // Update the token in localStorage
      localStorage.setItem('token', newToken);
  
      console.log('Token updated with new court access');
  
      // Redirect to the courts page
      navigate(`/courts_page/${userId}`);
  
    } catch (error) {
      console.error('Error while creating court or updating token', error);
      alert('An error occurred while creating the court or updating the token.');
    }
  };
  

  const handleCourtTypeSelection = (type) => {
    setCourtSettings((prevSettings) => ({ ...prevSettings, courtType: type }));
  };

  if (!token || decodedToken.userId !== parseInt(userId, 10)) {
    navigate('/'); // Redirect to home if not authorized
    return;
  }

  return (
    <div className="create-court-page-style">
      <h1 className='CP-title'>Create New Court</h1>
      <div className="input-container1">
        <label htmlFor="courtName">Court's Name : </label>
        <input
          type="text"
          id="courtName"
          name="courtName"
          value={courtSettings.courtName}
          onChange={handleInputChange}
        />
      </div>
      <div className="court-type-selection">
        <div
          className={`court-type-cube-BasketBall ${courtSettings.courtType === 'Basketball' ? 'selected' : ''}`}
          onClick={() => handleCourtTypeSelection('Basketball')}
        >
          Basketball
        </div>
        <div
          className={`court-type-cube-FootBall ${courtSettings.courtType === 'Football' ? 'selected' : ''}`}
          onClick={() => handleCourtTypeSelection('Football')}
        >
          Football
        </div>
      </div>
      <button className='create-court-button' onClick={handleCreateCourt}>
        Create Court
      </button>
      <Link to={`/courts_page/${userId}`} className="back-home-button">
        Back to MyCourts Page
      </Link>
    </div>
  );
};

export default CreateCourtPage;
