import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

function ProjectManagementUI() {
  const [projects, setProjects] = useState([]);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    projectID: "",
  });
  const [hwSets, setHwSets] = useState({});
  const [userAmounts, setUserAmounts] = useState({});
  // Fetch all projects with hardware sets when component loads
  useEffect(() => {
    fetchProjectsAndHardware();
  }, []);

  const fetchProjectsAndHardware = async () => {
    try {
      const response = await fetch("/projects-hardware");
      const data = await response.json();
      setProjects(data);

      // Initialize hwSets and userAmounts based on fetched data
      const hwSetInitialState = {};
      const userAmountInitialState = {};
      data.forEach((project) => {
        project.hardwareSets.forEach((hwSet) => {
          hwSetInitialState[hwSet.name] = {
            capacity: hwSet.capacity,
            availability: hwSet.availability,
          };
          userAmountInitialState[hwSet.name] = 0; // Initialize all inputs to 0
        });
      });
      setHwSets(hwSetInitialState);
      setUserAmounts(userAmountInitialState);
    } catch (error) {
      console.error("Error fetching projects and hardware:", error);
    }
  };

  // Handle input changes for the project creation form
  const handleProjectInput = (e) => {
    const { name, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Create a new project and display it with two initialized HW sets
  const createProject = async () => {
    try {
      const response = await fetch("/create-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const newProject = await response.json();
        // Add the new project to the list with initialized hardware sets
        setProjects((prevProjects) => [
          ...prevProjects,
          {
            ...newProject.project,
            hardwareSets: [
              { name: "HWSet1", capacity: 200, availability: 200 },
              { name: "HWSet2", capacity: 200, availability: 200 },
            ],
          },
        ]);
        setProjectData({ name: "", description: "", projectID: "" }); // Clear the form
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "User";

  const handleUserInput = (hwSet, projectID, amount) => {
    const key = `${projectID}-${hwSet}`;
    const hardwareSet = hwSets[hwSet] || { capacity: 0, availability: 0 };
    const { capacity, availability } = hardwareSet;
    const maxAllowed = Math.max(availability, capacity - availability);

    setUserAmounts((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(amount, maxAllowed)),
    }));
  };

  const handleCheckout = async (hwSet, projectID) => {
    try {
      const project = projects.find((proj) => proj.projectID === projectID);
      const hardwareSet = project.hardwareSets.find(
        (set) => set.name === hwSet
      );
      const { availability } = hardwareSet; 

      const checkoutAmount = Math.min(
        userAmounts[`${projectID}-${hwSet}`],
        availability
      );
      
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
          projectID,
        }),
      });
      const data = await response.json();
      console.log(data.message);

      // Refresh hardware data and user amounts after checkout
      await fetchProjectsAndHardware();
      setUserAmounts((prev) => ({ ...prev, [hwSet]: 0 }));

      alert(`Successfully checked out ${checkoutAmount} items.`);
    } catch (error) {
      console.error("Error checking out hardware:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  const handleCheckin = async (hwSet, projectID) => {
    try {
      const project = projects.find((proj) => proj.projectID === projectID);
      const hardwareSet = project.hardwareSets.find(
        (set) => set.name === hwSet
      );
      const { capacity, availability } = hardwareSet;

      const maxCheckin = capacity - availability;
      const checkinAmount = Math.min(
        userAmounts[`${projectID}-${hwSet}`],
        maxCheckin
      );

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
          projectID,
        }),
      });
      const data = await response.json();
      console.log(data.message);

      // Refresh hardware data and user amounts after checkin
      await fetchProjectsAndHardware();
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

      <div className="container">
        <h2>Projects</h2>
        <div className="hw-sets">
          {projects.map((project) => (
            <div key={project.projectID} className="hw-set-card">
              <div className="project-header">
                <h3>
                  Project Name: {project.name} (ID: {project.projectID})
                </h3>
                <p>Project Description: {project.description}</p>
              </div>
              {project.hardwareSets.map((hwSet) => (
                <div key={hwSet.name} className="hw-set">
                  <div className="hw-stats">
                    <p>Capacity: {hwSet.capacity}</p>
                    <p>Available: {hwSet.availability}</p>
                  </div>
                  <div className="hw-actions">
                    <input
                      type="number"
                      value={
                        userAmounts[`${project.projectID}-${hwSet.name}`] || 0
                      }
                      onChange={(e) =>
                        handleUserInput(
                          hwSet.name,
                          project.projectID,
                          Number(e.target.value)
                        )
                      }
                    />
                    <div className="checkout-checkin-group">
                      <button
                        className="checkout-button"
                        onClick={() =>
                          handleCheckout(hwSet.name, project.projectID)
                        }
                      >
                        Checkout
                      </button>
                      <button
                        className="checkin-button"
                        onClick={() =>
                          handleCheckin(hwSet.name, project.projectID)
                        }
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectManagementUI;
