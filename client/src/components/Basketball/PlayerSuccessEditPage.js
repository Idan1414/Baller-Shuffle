import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './PlayerSuccessCreationPage.css';
import '../BackHomeButton.css';


const PlayerSuccessEditPage = () => {
  const { search } = useLocation();
  const { courtId } = useParams();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const currUserId = searchParams.get('userId');
  const overall = searchParams.get('overall');
  const name = searchParams.get('name');

  return (
    <div className='PS-page-style'>
      <h1 className='PS-title1'>{name} Updated Successfully!</h1>
      <p className='overall'>OVERALL: {overall}</p>

      <Link to={`/court_home_page/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}&userId=${currUserId}`} className="back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default PlayerSuccessEditPage;