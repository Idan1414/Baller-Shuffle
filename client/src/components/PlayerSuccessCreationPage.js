import { Link, useNavigate,useParams, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import './PlayerSuccessCreationPage.css';
import './BackHomeButton.css';




const PlayerSuccessCreationPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { courtId } = useParams();
  const searchParams = new URLSearchParams(search);
  const currUserId = searchParams.get('userId');
  const overall = searchParams.get('overall');
  const name = searchParams.get('name');


  

const token = localStorage.getItem('token');
let decodedToken;
if (token) {
  decodedToken = jwtDecode(token);
}


//Page Begining UseEffect
useEffect(() => {

  const userIdFromUrl = new URLSearchParams(search).get('userId');

  if (!token || decodedToken.userId !== parseInt(userIdFromUrl, 10)) {
    navigate('/'); // Redirect to home if not authorized
    return;
  }
  if (!decodedToken.courts || !decodedToken.courts.includes(courtId)) {
    navigate('/'); // Redirect to home if the user does not have access to this court
    return;
  }
})

  return (
    <div className='PS-page-style'>
      <h1 className='PS-title1'>{name} Created Successfully!</h1>
      <p className='overall'>OVERALL: {overall}</p>

      <Link to={`/court_home_page/${courtId}?userId=${currUserId}`} className="back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default PlayerSuccessCreationPage;