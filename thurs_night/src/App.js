import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import ProjectManagementUI from "./ProjectManagementUI";
import Login from "./Login";
import Register from "./Registration";

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch the welcome message from Flask backend
        fetch('http://127.0.0.1:5000/')
            .then(response => response.json())
            .then(data => setMessage(data.message))
            .catch(error => console.error('Error fetching welcome message:', error));
    }, []);

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/dashboard" element={<ProjectManagementUI/>}/>
                    <Route path="/" element={<Navigate replace to="/login"/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;