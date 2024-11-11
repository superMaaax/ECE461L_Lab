import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import ProjectManagementUI from "./ProjectManagementUI";
import Login from "./Login";
import Register from "./Registration";

// Separate Protected Route component
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const username = sessionStorage.getItem('username');

    if (!username) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <ProjectManagementUI />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate replace to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;