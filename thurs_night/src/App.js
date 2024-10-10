import React, { useState } from 'react';
import './App.css';

function ProjectManagementUI() {
  const [hwSet1Amount, setHwSet1Amount] = useState(0);
  const [hwSet2Amount, setHwSet2Amount] = useState(0);

  return (
    <div className="container">
      <div className="header">
        <h1>User1</h1>
        <button className="logout-button">LOG OUT</button>
      </div>

      <div className="create-project">
        <button className="create-project-button">Create Project</button>
      </div>

      <div className="hw-sets">
        <div className="hw-set-card">
          <h3>HWSet1</h3>
          <p>Capacity: 200</p>
          <p>Available: 200</p>
          <input
            type="number"
            value={hwSet1Amount}
            onChange={(e) => setHwSet1Amount(Number(e.target.value))}
            className="amount-input"
          />
          <div className="button-group">
            <button onClick={() => setHwSet1Amount(hwSet1Amount + 1)}>+</button>
            <button onClick={() => setHwSet1Amount(Math.max(0, hwSet1Amount - 1))}>-</button>
          </div>
        </div>

        <div className="hw-set-card">
          <h3>HWSet2</h3>
          <p>Capacity: 200</p>
          <p>Available: 200</p>
          <input
            type="number"
            value={hwSet2Amount}
            onChange={(e) => setHwSet2Amount(Number(e.target.value))}
            className="amount-input"
          />
          <div className="button-group">
            <button onClick={() => setHwSet2Amount(hwSet2Amount + 1)}>+</button>
            <button onClick={() => setHwSet2Amount(Math.max(0, hwSet2Amount - 1))}>-</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <ProjectManagementUI />
    </div>
  );
}

export default App;