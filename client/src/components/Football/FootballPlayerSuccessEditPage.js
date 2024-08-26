import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './FootballPlayerSuccessCreationPage.css';

const FootballPlayerSuccessEditPage = () => {
  const { search } = useLocation();
  const { courtId } = useParams();
  const searchParams = new URLSearchParams(search);
  const currCourtName = searchParams.get('courtName');
  const currCourtType = searchParams.get('courtType');
  const overall = searchParams.get('overall');
  const name = searchParams.get('name');

  return (
    <div className='football-PS-page-style'>
      <h1 className='PS-title'>{name} Updated Successfully!</h1>
      <p className='overall'>OVERALL: {overall}</p>

      <Link to={`/court_home_page_football/${courtId}?courtName=${currCourtName}&courtType=${currCourtType}`} className="NGP-back-home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default FootballPlayerSuccessEditPage;