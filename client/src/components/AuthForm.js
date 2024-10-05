import React, { useState } from 'react';
import './AuthForm.css';
import { useNavigate } from 'react-router-dom';
import { MdLogin, MdPersonAdd } from 'react-icons/md'; // Importing icons


const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fadeEffect, setFadeEffect] = useState(false); // State to manage fade effect
  const navigate = useNavigate();

  const toggleForm = () => {
    // Apply fade effect
    setFadeEffect(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setUsernameError('');
      setPasswordError('');
      // Remove fade effect after it has been applied
      setFadeEffect(false);
    }, 1);
  };





  const handleSubmit = async (event) => {
    event.preventDefault();
    // Clear previous error messages
    setUsernameError('');
    setPasswordError('');


    if (!isLogin) { // Only validate email format during registration
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(username)) {
        setUsernameError('Please enter a valid email address.');
        return; // Stop the form submission if the email is not valid
      }
    }
    const url = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/register';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    try {
      const data = await response.json(); // Attempt to parse JSON

      if (response.ok) {
        console.log('Success:', data);

        // Handle login success
        if (isLogin) {
          const userId = data.userId;
          localStorage.setItem('token', data.token);
          navigate(`/courts_page/${userId}`);
        } else if (!isLogin) {
          // Handle registration success
          setPasswordError('User created ');
          //optionally reset form or provide UI feedback that registration was successful
          //consider switching form state to login for a smoother user experience
          setIsLogin(true);
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
      // Handle non-JSON response
      console.error('Error parsing response:', error);
      if (response.status === 404) {
        setUsernameError('User does not exist'); // Assuming non-JSON response for user not found
      } else if ((response.status === 401)) {
        // Handle other errors or set a generic error message
        setUsernameError('Password is incorrect');
      }
    }
  };




  return (
    <div className='login-page-style'>
      <h2 className="app-title-landing">BALLER SHUFFLE</h2>
      <div className="auth-form-container">
        <div className={`auth-form ${fadeEffect ? 'fade-in' : ''}`}>
          <h2 className="graffiti-title">{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {usernameError && <div className="error-message">{usernameError}</div>}
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder={isLogin ? "Password" : "Strong Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
            </div>
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <button className="toggle-button" onClick={toggleForm}>
            {isLogin ? <MdPersonAdd /> : <MdLogin />}
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default AuthForm;
