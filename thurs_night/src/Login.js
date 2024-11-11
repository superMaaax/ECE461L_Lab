import React, { useState } from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';

const Login = () => {
    const [userid, setUserid] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid, password }),
            });
            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('username', data.username);
                navigate('/dashboard', { replace: true });
            } else {
                alert(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again.');
        }
    };

  return (
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="userid">User ID:</label>
            <input
                type="text"
                id="userid"
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <div className="register-link">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
  );
};

export default Login;