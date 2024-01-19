import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './PlayerSuccessCreationPage.css';

const PlayerSuccessEditPage = () => {
  const { search } = useLocation();
  const { courtId } = useParams();
  const searchParams = new URLSearchParams(search);
  const overall = searchParams.get('overall');
  const name = searchParams.get('name');

  return (
    <div className='PS-page-style'>
      <h1 className='PS-title'>{name} Updated Successfully!</h1>
      <p className='overall'>OVERALL: {overall}</p>

      <Link className='back-home-button' to={`/court_home_page/${courtId}`}>
        Back to Home Page
        </Link>
    </div>
  );
};

export default PlayerSuccessEditPage;