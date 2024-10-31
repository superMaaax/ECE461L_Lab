// src/App.js
import React, { useState } from 'react';
import LoginForm from './components/LoginForm.js';
import RegisterForm from './components/RegisterForm.js';
import Dashboard from './components/Dashboard.js';

function App() {
    const [user, setUser] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);


    const handleLogin = (username) => {
        setUser(username);
    };

    const handleRegister = (username) => {
        setUser(username);
        setIsRegistering(false);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <div className="App">
            {user ? (
                <Dashboard user={user} onLogout={handleLogout} />
            ) : isRegistering ? (
                <>
                    <RegisterForm onRegister={handleRegister} />
                    <p>
                        Already have an account?{' '}
                        <button onClick={() => setIsRegistering(false)}>Login here</button>
                    </p>
                </>
            ) : (
                <>
                    <LoginForm onLogin={handleLogin} />
                    <p>
                        Don't have an account?{' '}
                        <button onClick={() => setIsRegistering(true)}>Register here</button>
                    </p>
                </>
            )}
        </div>
    );
}

export default App;
