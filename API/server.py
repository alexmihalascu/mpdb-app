from flask import Flask, request, jsonify
import sqlite3
import hashlib

app = Flask(__name__)

def connect_to_database():
    connection = sqlite3.connect('database.db')
    return connection

def create_table():
    connection = connect_to_database()
    cursor = connection.cursor()
    cursor.exceute(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, is_admin INTEGER)"
    )
    connection.commit()
    connection.close() 

def hash_password(password):
    """Hashes a password using SHA-256."""
    password = password.encode('utf-8')
    hashed_password = hashlib.sha256(password).hexdigest()
    return hashed_password

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    hashed_password = hash_password(password)
    is_admin = data.get('is_admin', False)
    connection = connect_to_database()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users(username,password,is_admin) VALUES (?,?,?)",(username, hashed_password, is_admin))
    connection.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    hashed_password = hash_password(password)
    connection = connect_to_database()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users where username=? and password=?",(username, hashed_password))
    user = cursor.fetchone()
    if user:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    # implement logout functionality here
    return jsonify({"message": "Logout successful"}), 200

@app.route('/is_admin', methods=['POST'])
def is_admin():
    data = request.get_json()
    username = data['username']
    connection = connect_to_database()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users where username=? and is_admin=1",(username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"message": "User is an admin"}), 200
    else:
        return jsonify({"message": "User is not an admin"}), 401
    
@app.route('/')
def index():
    print("mpdb-api is running")
    return jsonify({"message": "mpdb-api is running"}), 200

@app.route('/testapi')
def testapi():
    return{"is my api running?":["yes","YES"]}


if __name__ == '__main__':
    app.run(debug=True)
