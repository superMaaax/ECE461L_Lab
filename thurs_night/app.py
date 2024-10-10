from flask import Flask, request, jsonify
import pymongo
from cipher import encrypt, decrypt
from hardwareSet import hardwareSet

app = Flask(__name__)

# Initialize MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["haas_app"]
users_collection = db["users"]
hardware_collection = db["hardware"]

# Initialize Hardware Sets
hardware_set_1 = hardwareSet()
hardware_set_2 = hardwareSet()
hardware_set_1.initialize_capacity(10)
hardware_set_2.initialize_capacity(15)


@app.route("/", methods=["GET"])
def home():
    return "Welcome to the HaaS App!"


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
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Hardware Checkout Endpoint
@app.route("/checkout", methods=["POST"])
def checkout():
    data = request.json
    hw_set = data["hw_set"]
    qty = data["qty"]
    projectID = data["projectID"]

    if hw_set == "HWSet1":
        error = hardware_set_1.check_out(qty, projectID)
    elif hw_set == "HWSet2":
        error = hardware_set_2.check_out(qty, projectID)
    else:
        return jsonify({"message": "Invalid hardware set"}), 400

    if error == 0:
        return jsonify({"message": "Checkout successful"}), 200
    else:
        return (
            jsonify({"message": "Insufficient availability or invalid project ID"}),
            400,
        )


# Hardware Checkin Endpoint
@app.route("/checkin", methods=["POST"])
def checkin():
    data = request.json
    hw_set = data["hw_set"]
    qty = data["qty"]
    projectID = data["projectID"]

    if hw_set == "HWSet1":
        error = hardware_set_1.check_in(qty, projectID)
    elif hw_set == "HWSet2":
        error = hardware_set_2.check_in(qty, projectID)
    else:
        return jsonify({"message": "Invalid hardware set"}), 400

    if error == 0:
        return jsonify({"message": "Checkin successful"}), 200
    else:
        return jsonify({"message": "Invalid project ID or quantity"}), 400


if __name__ == "__main__":
    app.run(debug=True)
