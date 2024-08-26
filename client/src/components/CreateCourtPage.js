import React, { useState } from 'react';
import { Link, useNavigate ,useParams} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './CreateCourtPage.css';

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
    console.log(courtSettings,userId);
    try {
      const response = await fetch(`http://localhost:5000/api/create_court/${userId}`, {
        method: 'POST',
        headers: { 
        'Content-Type': 'application/json' ,
        'Authorization': token,
        },
        body: JSON.stringify(courtSettings),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create court.');
      }
  
      const newCourt = await response.json();
  
      // Redirect to the appropriate court page
      navigate(`/court_home_page/${newCourt.courtId}?courtName=${newCourt.courtName}&courtType=${newCourt.courtType}&userId=${userId}`);
    } catch (error) {
      console.error(error);
      alert('An error occurred while creating the court.');
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
      <div className="input-container">
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
      <button className='calc-save-button' onClick={handleCreateCourt}>
        Create Court
      </button>
      <Link to={`/courts_page/${userId}`} className="NGP-back-home-button">
        Back to MyCourts Page
      </Link>
    </div>
  );
};

export default CreateCourtPage;
