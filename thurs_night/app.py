from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from cipher import encrypt, decrypt
from hardwareSet import hardwareSet
import os
import logging

app = Flask(__name__, static_folder="build", static_url_path="")
logging.basicConfig(level=logging.INFO)
CORS(app)


def initialize_hardware():
    if hardware_collection.count_documents({}) == 0:
        hardware_collection.insert_many(
            [
                {"name": "HWSet1", "capacity": 200, "availability": 200},
                {"name": "HWSet2", "capacity": 200, "availability": 200},
            ]
        )


# Initialize MongoDB
mongo_uri = os.environ.get("MONGO_URI")
is_heroku = False

try:
    client = MongoClient(mongo_uri)
    db = client["haas_app"]
    users_collection = db["users"]
    hardware_collection = db["hardware"]
    projects_collection = db["projects"]
    initialize_hardware()  # Call to populate initial data
except Exception as e:
    print("Failed to connect to MongoDB:", e)

# Initialize Hardware Sets
hardware_set_1 = hardwareSet()
hardware_set_2 = hardwareSet()
hardware_set_1.initialize_capacity(200)
hardware_set_2.initialize_capacity(200)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


# Hardware Status Endpoint
@app.route("/hardware", methods=["GET"])
def get_hardware():
    hardware_data = list(hardware_collection.find({}, {"_id": 0}))
    return jsonify(hardware_data)


# User Registration Endpoint
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    userid = encrypt(data["userid"], N=3, D=1)
    password = encrypt(data["password"], N=3, D=1)

    users_collection.insert_one({"userid": userid, "password": password})
    return jsonify({"message": "User registered successfully"}), 201


# User Login Endpoint
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    userid = encrypt(data["userid"], N=3, D=1)
    password = encrypt(data["password"], N=3, D=1)

    user = users_collection.find_one({"userid": userid, "password": password})
    if user:
        decrypted_userid = decrypt(user["userid"], N=3, D=1)
        return (
            jsonify({"message": "Login successful", "username": decrypted_userid}),
            200,
        )
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Hardware Checkout Endpoint
@app.route("/checkout", methods=["POST"])
def checkout():
    data = request.json
    hw_set_name = data.get("hw_set")
    qty = data.get("qty")

    if hw_set_name and qty:
        hardware_item = hardware_collection.find_one({"name": hw_set_name})

        if hardware_item and hardware_item["availability"] >= qty:
            # Update the availability
            new_availability = hardware_item["availability"] - qty
            hardware_collection.update_one(
                {"name": hw_set_name}, {"$set": {"availability": new_availability}}
            )
            return jsonify({"message": "Checked out successfully!"}), 200
        else:
            return jsonify({"message": "Insufficient availability!"}), 400

    return jsonify({"message": "Invalid request!"}), 400


@app.route("/checkin", methods=["POST"])
def checkin():
    data = request.json
    hw_set_name = data.get("hw_set")
    qty = data.get("qty")

    if hw_set_name and qty:
        hardware_item = hardware_collection.find_one({"name": hw_set_name})

        if hardware_item:
            # Update the availability
            new_availability = hardware_item["availability"] + qty
            hardware_collection.update_one(
                {"name": hw_set_name}, {"$set": {"availability": new_availability}}
            )
            return jsonify({"message": "Checked in successfully!"}), 200

    return jsonify({"message": "Invalid request!"}), 400


@app.route("/create-project", methods=["POST"])
def create_project():
    data = request.json
    project_name = data.get("name")
    project_description = data.get("description")
    project_id = data.get("projectID")

    # Validation
    if not project_name or not project_id:
        return jsonify({"message": "Name and Project ID are required"}), 400

    # Check if the project already exists
    existing_project = projects_collection.find_one({"projectID": project_id})
    if existing_project:
        return jsonify({"message": "Project with this ID already exists"}), 400

    new_project = {
        "projectID": project_id,
        "name": project_name,
        "description": project_description,
        "users": [],
    }
    inserted_project = projects_collection.insert_one(new_project)

    new_project["_id"] = str(inserted_project.inserted_id)

    # Initialize two hardware sets for the project
    hardware_collection.insert_many(
        [
            {
                "name": "HWSet1",
                "capacity": 200,
                "availability": 200,
                "projectID": project_id,
            },
            {
                "name": "HWSet2",
                "capacity": 200,
                "availability": 200,
                "projectID": project_id,
            },
        ]
    )

    return (
        jsonify({"message": "Project created successfully", "project": new_project}),
        201,
    )


# Route to fetch all projects and their associated hardware sets
@app.route("/projects-hardware", methods=["GET"])
def get_projects_and_hardware():
    projects = list(projects_collection.find({}, {"_id": 0}))  # Fetch all projects
    for project in projects:
        # Find hardware sets for each project using the projectID
        project_hardware = list(
            hardware_collection.find({"projectID": project["projectID"]}, {"_id": 0})
        )
        project["hardwareSets"] = (
            project_hardware  # Attach hardware sets to the project object
        )
    return jsonify(projects)
@app.route('/join-project', methods=['POST'])
def join_project():
    data = request.get_json()
    project_id = data.get('projectID')
    user_id = data.get('userID')
    
    # Find the project by projectID
    project = projects_collection.find_one({"projectID": project_id})
    
    if not project:
        return jsonify({"message": "Project not found"}), 404

    # Add the user to the project's members list
    projects_collection.update_one(
        {"projectID": project_id},
        {"$addToSet": {"members": user_id}}
    )

    return jsonify({"message": "Successfully joined project"}), 200

@app.errorhandler(500)
def server_error(e):
    logging.error(f"500 error: {str(e)}")
    return jsonify(error="Internal server error"), 500


if __name__ == "__main__":
    initialize_hardware()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
