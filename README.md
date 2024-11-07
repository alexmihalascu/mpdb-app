
<br/>
<p align="center">
  <h3 align="center">MPDB-APP</h3>
</p>

**MPDB-APP** is a faculty project developed to demonstrate a full-stack application using **React** for the frontend, **Python** for the backend, and **SQLite** for the database. The project serves as an example of how to integrate these technologies for data handling and user authentication.

## 📖 Project Overview

This application allows users to register, log in, and securely store their information in a local database. The backend handles encryption, user validation, and secure data storage. The frontend is designed to be user-friendly, showcasing the integration of a responsive React UI with a robust backend and a lightweight SQLite database.

### Key Features:

- **User Registration and Authentication**: Users can register an account, which is stored securely with encrypted passwords.
- **Data Persistence**: SQLite database stores user credentials and information.
- **Full-Stack Integration**: The app demonstrates how a React frontend interacts with a Python backend, showcasing data flow between layers.
  
## 🔧 Built With

- **Frontend**: React, providing a modern, responsive user interface.
- **Backend**: Python, handling server-side logic, API requests, and database interactions.
- **Database**: SQLite, a lightweight and efficient local database to store user data.

## 📋 Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/alexmihalascu/mpdb-app.git
   ```

2. **Navigate to the Project Directory**:
   ```bash
   cd mpdb-app
   ```

3. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Frontend**:
   ```bash
   npm start
   ```

5. **Open a New Terminal**.

6. **Navigate to the API Directory**:
   ```bash
   cd mpdb-app/api
   ```

7. **Start the API server**:
   ```bash
   python3 server.py
   ```

8. **Test the Application**:
   Open your browser and go to [http://localhost:3000](http://localhost:3000) to interact with the app.

## 📸 API Demonstration

- **Database Before Registration**:
  - The database in its initial state, with the terminal open to verify the API's functionality during registration.
  ![Database Before Registration](https://user-images.githubusercontent.com/41302353/213150342-1f97c568-2556-4797-be20-e52721025b28.png)

- **Database After Registration**:
  - Shows the database updated with the registered username and encrypted password.
  ![Database After Registration](https://user-images.githubusercontent.com/41302353/213150616-62cea769-8554-4155-a209-c5680088b842.png)

- **API Response After Login**:
  - Confirms successful login by validating stored credentials.
  ![API Login Response](https://user-images.githubusercontent.com/41302353/213150882-592bc599-198a-4181-83d0-d8dabfdba0a1.png)

## 📸 Project Screenshots

![Project Screenshot 1](https://user-images.githubusercontent.com/41302353/213149946-b52e6e4c-8f07-403a-8760-c2e76a466518.png)
![Project Screenshot 2](https://user-images.githubusercontent.com/41302353/213149976-be257994-2d2f-43c9-bfad-642b1379b08f.png)
![Project Screenshot 3](https://user-images.githubusercontent.com/41302353/213150009-4be66db5-26af-40af-aa02-63bd71c045a4.png)
![Project Screenshot 4](https://user-images.githubusercontent.com/41302353/213150029-18235dc4-df22-4e69-8295-2bac79f690c4.png)
![Project Screenshot 5](https://user-images.githubusercontent.com/41302353/213150075-fe80a843-e8af-40f4-8aab-7ef59723fb7a.png)

## 🚀 Usage and Customization

- **Adding New Features**: Since this project integrates a full stack, it can easily be expanded with additional features like more detailed user profiles, admin functionality, and enhanced data encryption.
- **Database Customization**: You can switch out SQLite for other databases like MySQL or PostgreSQL for larger-scale applications.
