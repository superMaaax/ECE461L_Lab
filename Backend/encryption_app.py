from flask import Flask, request, jsonify
from encryption import encrypt_data, decrypt_data
import os

app = Flask(__name__)
USER_FILE = "users.txt"

@app.route('/register', methods=['POST'])
def register():
    """Register a new user with encrypted credentials."""
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    encrypted_username = encrypt_data(username)
    encrypted_password = encrypt_data(password)

    with open(USER_FILE, 'a') as f:
        f.write(f"{encrypted_username}:{encrypted_password}\n")

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    """Login a user by decrypting stored credentials and verifying."""
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    with open(USER_FILE, 'r') as f:
        users = f.readlines()

    for user in users:
        stored_username, stored_password = user.strip().split(":")
        
        try:
            if decrypt_data(stored_username) == username and decrypt_data(stored_password) == password:
                return jsonify({"message": "Login successful"}), 200
        except Exception as e:
            return jsonify({"error": f"Decryption error: {str(e)}"}), 500

    return jsonify({"error": "Invalid username or password"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
