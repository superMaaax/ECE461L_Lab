import React, {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
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
    const [joinProjectID, setJoinProjectID] = useState("");

    // Fetch all projects with hardware sets when component loads
    useEffect(() => {
        fetchProjectsAndHardware();
    }, []);

    const fetchProjectsAndHardware = async () => {
        try {
            const response = await fetch("/projects-hardware");
            const data = await response.json();

            // Filter the projects to only include those the user has joined
            const userProjects = data.filter((project) =>
                project.members && project.members.includes(username)
            );

            setProjects(userProjects);

            // Initialize hwSets and userAmounts based on filtered data
            const hwSetInitialState = {};
            const userAmountInitialState = {};
            userProjects.forEach((project) => {
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
        const {name, value} = e.target;
        setProjectData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const fetchUserProjects = async (username) => {
        try {
            const response = await fetch('/user-projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userID: username}),
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data); // Set only the user's joined projects
            } else {
                console.error("Failed to fetch user's joined projects");
            }
        } catch (error) {
            console.error("Error fetching user projects:", error);
        }
    };

    // Create a new project and display it with two initialized HW sets
    const createProject = async () => {
        try {
            const payload = {
                ...projectData,
                userID: sessionStorage.getItem('username')
            };

            const response = await fetch("/create-project", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const newProject = await response.json();
                // Initialize hardware sets
                const newHwSets = {
                    "HWSet1": {capacity: 200, availability: 200},
                    "HWSet2": {capacity: 200, availability: 200}
                };

                setHwSets(prevHwSets => ({
                    ...prevHwSets,
                    ...newHwSets
                }));

                setProjects((prevProjects) => [
                    ...prevProjects,
                    {
                        ...newProject.project,
                        hardwareSets: [
                            {name: "HWSet1", capacity: 200, availability: 200},
                            {name: "HWSet2", capacity: 200, availability: 200},
                        ],
                    },
                ]);
                setProjectData({name: "", description: "", projectID: ""}); // Clear the form
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
    const username = sessionStorage.getItem('username') || "User";


    const handleUserInput = (hwSet, projectID, amount) => {
        const key = `${projectID}-${hwSet}`;
        console.log("Trying to update:", key, "to amount:", amount);
        console.log("Current hwSets:", hwSets);
        console.log("Current userAmounts:", userAmounts);
        const hardwareSet = hwSets[hwSet] || {capacity: 0, availability: 0};
        const {capacity, availability} = hardwareSet;
        const maxAllowed = Math.max(availability, capacity - availability);

        setUserAmounts((prev) => ({
            ...prev,
            [key]: Math.max(0, Math.min(amount, maxAllowed)),
        }));
    };

    const handleCheckout = async (hwSet, projectID) => {
        const checkoutAmount = userAmounts[`${projectID}-${hwSet}`] || 0;
        if (checkoutAmount <= 0) {
            alert("Please enter a valid quantity to checkout.");
            return;
        }

        try {
            const response = await fetch("/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    hw_set: hwSet,
                    qty: checkoutAmount,
                    projectID,
                    userID: username,  // Send userID to identify the user
                }),
            });

            const data = await response.json();
            if (response.ok) {
                fetchProjectsAndHardware();  // Refresh data
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("An error occurred during checkout.");
        }
    };

    const handleCheckin = async (hwSet, projectID) => {
        const checkinAmount = userAmounts[`${projectID}-${hwSet}`] || 0;
        if (checkinAmount <= 0) {
            alert("Please enter a valid quantity to checkin.");
            return;
        }

        try {
            const response = await fetch("/checkin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    hw_set: hwSet,
                    qty: checkinAmount,
                    projectID,
                    userID: username,  // Send userID to verify the user’s ownership
                }),
            });

            const data = await response.json();
            if (response.ok) {
                fetchProjectsAndHardware();  // Refresh data
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error during checkin:", error);
            alert("An error occurred during checkin.");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('username');
        navigate('/login', {replace: true});
    };

    const joinProject = async () => {
        try {
            const response = await fetch('/join-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({projectID: joinProjectID, userID: username}),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                await fetchProjectsAndHardware(); // Refresh projects list
                setJoinProjectID(""); // Clear the input after successful join
            } else {
                alert(data.message || 'Failed to join project');
            }
        } catch (error) {
            console.error('Error joining project:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const leaveProject = async (projectID) => {
        try {
            const response = await fetch('/leave-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectID: projectID,
                    userID: sessionStorage.getItem('username')
                }),
            });

            const data = await response.json();
            if (response.ok) {
                await fetchProjectsAndHardware(); // Refresh the projects list
            } else {
                alert(data.message || 'Failed to leave project');
            }
        } catch (error) {
            console.error('Error leaving project:', error);
            alert('An error occurred. Please try again.');
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

            <div className="join-project-container">
                <h3>Join Existing Project</h3>
                <div>
                    <input
                        type="text"
                        placeholder="Enter Project ID"
                        value={joinProjectID}
                        onChange={(e) => setJoinProjectID(e.target.value)}
                    />
                </div>
                <button onClick={joinProject}>Join Project</button>
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
                                <div className="project-title-row">
                                    <h3>
                                        Project Name: {project.name} (ID: {project.projectID})
                                    </h3>
                                    <button
                                        className="leave-button"
                                        onClick={() => leaveProject(project.projectID)}
                                    >
                                        Leave Project
                                    </button>
                                </div>
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
