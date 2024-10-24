import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

function ProjectManagementUI() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "User";
  // default values for hwSet1 and hwSet2
  const [hwSets, setHwSets] = useState({
    HWSet1: { capacity: 0, availability: 0 },
    HWSet2: { capacity: 0, availability: 0 },
  });

  // user values for checkout for hwSet1 and hwSet2
  const [userAmounts, setUserAmounts] = useState({
    HWSet1: 0,
    HWSet2: 0,
  });

  useEffect(() => {
    fetchHardWareData();
  }, []);

  // fetch hardware data from app.py
  const fetchHardWareData = async () => {
    try {
      const response = await fetch("/hardware");
      // data retrieved from app.py
      const data = await response.json();
      console.log(data);
      const newHwSets = {};
      data.forEach((hw) => {
        newHwSets[hw.name] = {
          capacity: hw.capacity,
          availability: hw.availability,
        };
      });
      setHwSets(newHwSets);
    } catch (error) {
      console.error("Error fetching hardware due to: ", error);
    }
  };

  // handle user amount input
  const handleUserInput = (hwSet, amount) => {
    const { capacity, availability } = hwSets[hwSet];
    const maxAllowed = Math.max(availability, capacity - availability);
    setUserAmounts((prev) => ({
      ...prev,
      [hwSet]: Math.max(0, Math.min(amount, maxAllowed)),
    }));
  };

  // handle user checkout
  const handleCheckout = async (hwSet) => {
    try {
      const { availability } = hwSets[hwSet];
      const checkoutAmount = Math.min(userAmounts[hwSet], availability);

      if (checkoutAmount <= 0) {
        alert("No items available for checkout.");
        return;
      }

      const response = await fetch("/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hw_set: hwSet,
          qty: checkoutAmount,
          projectID: 0,
        }),
      });
      const data = await response.json();
      console.log(data.message);

      // Refresh hardware data and user amounts after checkout
      await fetchHardWareData();
      setUserAmounts((prev) => ({ ...prev, [hwSet]: 0 }));

      alert(`Successfully checked out ${checkoutAmount} items.`);
    } catch (error) {
      console.error("Error checking out hardware:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  const handleCheckin = async (hwSet) => {
    try {
      const { capacity, availability } = hwSets[hwSet];
      const maxCheckin = capacity - availability;
      const checkinAmount = Math.min(userAmounts[hwSet], maxCheckin);

      if (checkinAmount <= 0) {
        alert("No items to check in or all items already checked in.");
        return;
      }

      const response = await fetch("/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hw_set: hwSet,
          qty: checkinAmount,
          projectID: 0,
        }),
      });
      const data = await response.json();
      console.log(data.message);

      // Refresh hardware data and user amounts after checkin
      await fetchHardWareData();
      setUserAmounts((prev) => ({ ...prev, [hwSet]: 0 }));

      alert(`Successfully checked in ${checkinAmount} items.`);
    } catch (error) {
      console.error("Error during checkin:", error);
      alert("An error occurred during check-in. Please try again.");
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    projectID: "",
  });

  const handleProjectInput = (e) => {
    const { name, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const createProject = async () => {
    try {
      const response = await fetch("/create-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Project created successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("An error occurred while creating the project.");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>{username}</h1>
        <button className="logout-button" onClick={handleLogout}>
          LOG OUT
        </button>
      </div>

      <div className="project-form-container">
        <h3>Create New Project</h3>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={projectData.name}
            onChange={handleProjectInput}
          />
        </div>
        <div>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={projectData.description}
            onChange={handleProjectInput}
          />
        </div>
        <div>
          <input
            type="text"
            name="projectID"
            placeholder="Project ID"
            value={projectData.projectID}
            onChange={handleProjectInput}
          />
        </div>
        <button onClick={createProject}>Create Project</button>
      </div>

      <div className="hw-sets">
        {Object.entries(hwSets).map(([hwSet, { capacity, availability }]) => (
          <div key={hwSet} className="hw-set-card">
            <h3>{hwSet}</h3>
            <p>Capacity: {capacity}</p>
            <p>Available: {availability}</p>
            <input
              type="number"
              value={userAmounts[hwSet]}
              onChange={(e) => handleUserInput(hwSet, Number(e.target.value))}
              className="amount-input"
              min="0"
              max={Math.max(availability, capacity - availability)}
            />
            <div className="button-group">
              <button
                onClick={() => handleUserInput(hwSet, userAmounts[hwSet] + 1)}
              >
                +
              </button>
              <button
                onClick={() => handleUserInput(hwSet, userAmounts[hwSet] - 1)}
              >
                -
              </button>
            </div>
            <div className="checkout-checkin-group">
              <button
                className="checkout-button"
                onClick={() => handleCheckout(hwSet)}
                disabled={userAmounts[hwSet] === 0}
              >
                Checkout
              </button>
              <button
                className="checkin-button"
                onClick={() => handleCheckin(hwSet)}
                disabled={userAmounts[hwSet] === 0}
              >
                Check In
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectManagementUI;
