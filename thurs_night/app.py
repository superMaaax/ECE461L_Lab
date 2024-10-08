from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from cipher import encrypt, decrypt
from hardwareSet import hardwareSet

app = Flask(__name__)
CORS(app)


def initialize_hardware():
    if hardware_collection.count_documents({}) == 0:
        hardware_collection.insert_many(
            [
                {"name": "HWSet1", "capacity": 200, "availability": 200},
                {"name": "HWSet2", "capacity": 200, "availability": 200}
            ]
        )


# Initialize MongoDB
mongo_uri = "mongodb+srv://swadeepto:swelabthursnight@swe-lab-haas.gld42.mongodb.net/?retryWrites=true&w=majority&appName=swe-lab-haas"
try:
    client = pymongo.MongoClient(mongo_uri)
    db = client["haas_app"]
    users_collection = db["users"]
    hardware_collection = db["hardware"]
    initialize_hardware()  # Call to populate initial data
except Exception as e:
    print("Failed to connect to MongoDB:", e)

# Initialize Hardware Sets
hardware_set_1 = hardwareSet()
hardware_set_2 = hardwareSet()
hardware_set_1.initialize_capacity(200)
hardware_set_2.initialize_capacity(200)


@app.route('/', methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the HaaS App!"})


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
        return jsonify({
            "message": "Login successful",
            "username": decrypted_userid
        }), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Hardware Checkout Endpoint
@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    hw_set_name = data.get('hw_set')
    qty = data.get('qty')

    if hw_set_name and qty:
        hardware_item = hardware_collection.find_one({"name": hw_set_name})

        if hardware_item and hardware_item['availability'] >= qty:
            # Update the availability
            new_availability = hardware_item['availability'] - qty
            hardware_collection.update_one(
                {"name": hw_set_name},
                {"$set": {"availability": new_availability}}
            )
            return jsonify({"message": "Checked out successfully!"}), 200
        else:
            return jsonify({"message": "Insufficient availability!"}), 400

    return jsonify({"message": "Invalid request!"}), 400


@app.route('/checkin', methods=['POST'])
def checkin():
    data = request.json
    hw_set_name = data.get('hw_set')
    qty = data.get('qty')

    if hw_set_name and qty:
        hardware_item = hardware_collection.find_one({"name": hw_set_name})

        if hardware_item:
            # Update the availability
            new_availability = hardware_item['availability'] + qty
            hardware_collection.update_one(
                {"name": hw_set_name},
                {"$set": {"availability": new_availability}}
            )
            return jsonify({"message": "Checked in successfully!"}), 200

    return jsonify({"message": "Invalid request!"}), 400


if __name__ == "__main__":
    initialize_hardware()
    app.run(debug=True, port=5000)
