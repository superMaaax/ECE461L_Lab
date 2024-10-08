// src/components/Dashboard.js
import React from 'react';

function Dashboard({ user, onLogout }) {
    return (
        <div>
            <h1>Welcome, {user}</h1>
            <button onClick={onLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;
