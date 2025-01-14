import React, { useState } from 'react';
import './AuthForm.css';
import { useNavigate } from 'react-router-dom';
import { MdLogin, MdPersonAdd } from 'react-icons/md'; // Importing icons


const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reEnterPassword, setReEnterPassword] = useState(''); // New state for re-enter password
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [reEnterPasswordError, setReEnterPasswordError] = useState(''); // Error state for re-enter password
  const [fadeEffect, setFadeEffect] = useState(false); // State to manage fade effect
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New state for success pop-up
  const navigate = useNavigate();

  const toggleForm = () => {
    // Apply fade effect
    setFadeEffect(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setUsernameError('');
      setPasswordError('');
      setReEnterPasswordError(''); // Reset re-enter password error
      setFadeEffect(false);
    }, 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUsernameError('');
    setPasswordError('');
    setReEnterPasswordError(''); // Reset errors before validation

    if (!isLogin) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(username)) {
        setUsernameError('Please enter a valid email address.');
        return;
      }

      // Check if password and re-enter password match
      if (password !== reEnterPassword) {
        setReEnterPasswordError('Passwords do not match.');
        return;
      }
    }
    console.log(process.env.REACT_APP_DB_HOST)
    const url = isLogin
      ? `http://${process.env.REACT_APP_DB_HOST}:5000/login`
      : `http://${process.env.REACT_APP_DB_HOST}:5000/register`;
    const pushToken = 'ExponentPushToken[9LntzZCdNPUiYJ4db3K2wo]'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, pushToken }),
    });

    try {
      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json(); // Parse as JSON if it's JSON
      } else {
        data = await response.text(); // Parse as plain text if not JSON
      }

      if (response.ok) {
        console.log('Success:', data);

        if (isLogin) {
          const userId = data.userId;
          localStorage.setItem('token', data.token);
          navigate(`/courts_page/${userId}`);
        } else {
          setShowSuccessPopup(true);
          setTimeout(() => {
            setShowSuccessPopup(false);
            setIsLogin(true);
          }, 1000);
        }
      } else {
        const errorMessage = data.message || 'An error occurred';
        if (response.status === 401) {
          setPasswordError('Password is incorrect');
        } else if (response.status === 404) {
          setUsernameError('User does not exist');
        } else if (response.status === 409) {
          setUsernameError('Username/email already exists');
        } else {
          console.error('Error:', errorMessage);
        }
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setUsernameError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='login-page-style'>
      <img src="/HadarLOGO.png" alt="Baller Shuffle Logo" className='logo-image' />
      <div className="auth-form-container">
        <div className={`auth-form ${fadeEffect ? 'fade-in' : ''}`}>
          <h2 className="graffiti-title1">{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group1">
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {usernameError && <div className="error-message1">{usernameError}</div>}
            </div>
            <div className="input-group1">
              <input
                type="password"
                placeholder={isLogin ? "Password" : "Strong Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordError && <div className="error-message1">{passwordError}</div>}
            </div>

            {/* Re-enter Password Input for Registration */}
            {!isLogin && (
              <div className="input-group1">
                <input
                  type="password"
                  placeholder="Re-enter Password"
                  value={reEnterPassword}
                  onChange={(e) => setReEnterPassword(e.target.value)}
                  required
                />
                {reEnterPasswordError && (
                  <div className="error-message1">{reEnterPasswordError}</div>
                )}
              </div>
            )}

            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <button className="toggle-button" onClick={toggleForm}>
            {isLogin ? <MdPersonAdd /> : <MdLogin />}
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>

        {/* Success Pop-up */}
        {showSuccessPopup && (
          <div className={`success-popup ${showSuccessPopup ? 'show' : 'hide'}`}>
            Registration Success!
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
