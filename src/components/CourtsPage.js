import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CourtsPage.css';



const CourtsPage = () => {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);

  useEffect(() => {
    const storedCourts = JSON.parse(localStorage.getItem('courts')) || [];
    setCourts(storedCourts);
  }, []);


  const handleDeleteCourt = (event, court) => {
    event.preventDefault();
    event.stopPropagation();
  
    const isConfirmed = window.confirm(`Are you sure you want to delete ${court.courtName}?`);
  
    if (isConfirmed) {
      const updatedCourts = courts.filter((c) => c.id !== court.id);
      setCourts(updatedCourts);
  
      localStorage.setItem('courts', JSON.stringify(updatedCourts));
  
      setSelectedCourt(null);
    }
  };

  return (
    <div className="home-page-style">
      <h1 className="CourtsPage-title">MyCourts</h1>
      <div className="player-list">
        {courts.map((court) => (
         <Link
         to={`/court_home_page/${court.id}?courtName=${court.courtName}&courtType=${court.courtType}`}
         className={`player-link ${court.courtType === 'Basketball' ? 'pastelOrange' : 'pastelGreen'}`}
       >
         <div key={court.id} className={`CourtsPage-cube ${court.courtType === 'Basketball' ? 'pastelOrange' : 'pastelGreen'}`} onMouseEnter={() => setSelectedCourt(court)} onMouseLeave={() => setSelectedCourt(null)}>
           <p>{court.courtName}</p>
           <p>{court.courtType}</p>
           {selectedCourt === court && (
             <div className="delete-court-button" onClick={(e) => handleDeleteCourt(e, court)}>
               🗑️
             </div>
           )}
         </div>
       </Link>
        ))}
      </div>
      <Link to="/new-court" className="create-player-button">
        Create New Court
      </Link>
    </div>
  );
};

export default CourtsPage;
