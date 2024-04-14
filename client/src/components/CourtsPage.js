import React, { useState, useEffect } from 'react';
import { Link, useNavigate , useParams } from 'react-router-dom';
import './CourtsPage.css';



const CourtsPage = () => {
  
  const [selectedCourt, setSelectedCourt] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate(); // Get access to the navigate function


useEffect(() => {
  fetch(`http://localhost:5000/api/courts/${userId}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setCourts(data);
    })
    .catch(error => console.error(error));
    
}, [userId]);


const [courts, setCourts] = useState([]);

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



  const handleLogout = () => {
    // Perform any logout logic here

    navigate('/'); // Navigate back to the home page
  };


  return (
    <div className="home-page-style">
        <button onClick={handleLogout} className="logout-button">
        Log Out
      </button>
      <div className="app-title">BALLER SHUFFLE</div>
      <h1 className="courtsPage-title">MyCourts</h1>
      <div className="courts-list">
        {Array.isArray(courts) ? courts.map((court) => (
         <Link
         to={court.courtType === 'Basketball' ? 
         `/court_home_page/${court.id}?courtName=${court.courtName}&courtType=${court.courtType}&userId=${userId}` : 
         `/court_home_page_football/${court.id}?courtName=${court.courtName}&courtType=${court.courtType}&userId=${userId}`}         className={`court-link ${court.courtType === 'Basketball' ? 'pastelOrange' : 'pastelGreen'}`}
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
        )): <p>You are not belong to any court</p>}
      </div>
      <Link to="/new-court" className="create-new-court-button">
        Create New Court
      </Link>
    </div>
  );
};

export default CourtsPage;
