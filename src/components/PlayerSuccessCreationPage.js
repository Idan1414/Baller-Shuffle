import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PlayerSuccessCreationPage.css';

const PlayerSuccessCreationPage = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const overall = searchParams.get('overall');
  const name = searchParams.get('name');

  return (
    <div className='PS-page-style'>
      <h1 className='PS-title'>{name} Created Successfully!</h1>
      <p className='overall'>OVERALL: {overall}</p>

      <Link className='back-home-button' to="/">Back to Home Page</Link>
    </div>
  );
};

export default PlayerSuccessCreationPage;