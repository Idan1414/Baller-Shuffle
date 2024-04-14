import React, { useState } from 'react';
import Court from './Court';
import { Link, useNavigate } from 'react-router-dom';
import './CreateCourtPage.css';

const CreateCourtPage = () => {
  const navigate = useNavigate();
  const [courtSettings, setCourtSettings] = useState({
    courtName: '',
    courtType: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourtSettings((prevSettings) => ({ ...prevSettings, [name]: value }));
  };

  const handleCreateCourt = () => {
    const nameIsOk = (courtSettings.courtName != null && courtSettings.courtName != '');
    const typeIsOk = (courtSettings.courtType =="Basketball" || courtSettings.courtType == "Football");

    if(nameIsOk && typeIsOk){
      const newCourt = new Court({
        ...courtSettings,
        id: generateUniqueId(),
      });
       // Save the court data to local storage
    const existingCourts = JSON.parse(localStorage.getItem('courts')) || [];
    localStorage.setItem('courts', JSON.stringify([...existingCourts, newCourt]));
    }

   

    if(!nameIsOk){
      alert("please write a name to the new court")
    }

    // Navigate to the newly created court's page
    if(nameIsOk &&courtSettings.courtType == 'Basketball'){
      navigate(`/court_home_page/${courtSettings.id}?courtName=${courtSettings.courtName}&courtType=${courtSettings.courtType}`);
    }
    else if(nameIsOk && courtSettings.courtType == 'Football'){
      navigate(`/court_home_page_football/${courtSettings.id}?courtName=${courtSettings.courtName}&courtType=${courtSettings.courtType}`);
    }
    else if(!typeIsOk && nameIsOk){//and no type selected
      alert(" Please select either 'Basketball' or 'Football'.");
    }
  };

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleCourtTypeSelection = (type) => {
    setCourtSettings((prevSettings) => ({ ...prevSettings, courtType: type }));
  };

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
      <Link to="/courts_page" className="NGP-back-home-button">
        Back to MyCourts Page
      </Link>
    </div>
  );
};

export default CreateCourtPage;
