```markdown
# 🚗 VANET Accident Detection System – CMS Backend

Backend service for the **Vehicular Ad-hoc Network (VANET) Accident Detection System**.  
This backend acts as the **Central Monitoring Server (CMS)** that receives accident alerts from **RSU devices**, stores them in **MongoDB**, and provides APIs for the **admin dashboard**.

---

# 📌 Project Description

The VANET CMS backend is responsible for:

- Receiving accident alerts from **Road Side Units (RSUs)**
- Storing accident data in **MongoDB Atlas**
- Providing REST APIs for the **CMS dashboard**
- Managing RSU devices
- Handling **admin authentication**
- Acting as the **central communication hub** between vehicles, RSUs, and the monitoring dashboard

This system is designed as part of a **Final Year Engineering Project** focused on improving **road safety and emergency response time**.

---

# 🧠 System Architecture

```

+-------------+        +-------------+        +--------------------+
| Vehicle OBU | -----> | RSU (ESP32) | -----> | CMS Backend Server |
+-------------+        +-------------+        +--------------------+
|
|
v
+---------------+
| MongoDB Atlas |
+---------------+
|
|
v
+---------------+
| Admin CMS UI  |
+---------------+

```

---

# ⚙️ Tech Stack

## Backend
- **Node.js**
- **Express.js**

## Database
- **MongoDB Atlas (Cloud Database)**
- **Mongoose ODM**

## Authentication
- **JWT (JSON Web Token)**
- **bcryptjs**

## Development Tools
- Nodemon
- Postman
- VS Code

---

# 📂 Project Structure

```

cms-backend
│
├── src
│   ├── config
│   │   └── db.js
│   │
│   ├── models
│   │   ├── User.js
│   │   ├── RSU.js
│   │   └── Accident.js
│   │
│   ├── routes
│   │   ├── auth.routes.js
│   │   ├── accident.routes.js
│   │   └── rsu.routes.js
│   │
│   ├── middleware
│   │   └── auth.middleware.js
│   │
│   └── server.js
│
├── .env
├── package.json
└── README.md

````

---

# 🛠 Prerequisites

Before running the backend, install the following:

| Software | Download |
|--------|--------|
| Node.js | https://nodejs.org |
| Git | https://git-scm.com |
| VS Code | https://code.visualstudio.com |
| MongoDB Atlas | https://www.mongodb.com/atlas |

Verify installation:

```bash
node -v
npm -v
git --version
````

---

# ☁️ MongoDB Atlas Setup

### 1️⃣ Create MongoDB Account

Go to

```
https://www.mongodb.com/atlas
```

Create a free account.

---

### 2️⃣ Create Cluster

Select:

```
Cluster Type : M0 Free Tier
Cloud Provider : AWS
Region : Closest to India
Cluster Name : vanet-cms-cluster
```

---

### 3️⃣ Create Database User

```
Username : cmsadmin
Password : yourpassword
```

Permissions:

```
Atlas Admin
```

---

### 4️⃣ Configure Network Access

Go to:

```
Network Access → Add IP Address
```

Add:

```
0.0.0.0/0
```

This allows connections from your backend server.

---

### 5️⃣ Get Connection String

Navigate to:

```
Database → Connect → Drivers → Node.js
```

Example connection string:

```
mongodb+srv://cmsadmin:<password>@vanet-cms-cluster.mongodb.net/vanetcms
```

Replace `<password>` with your database password.

---

# 🚀 Backend Installation

Clone the repository:

```bash
git clone https://github.com/your-username/vanet-cms-backend.git
```

Move into project folder:

```bash
cd vanet-cms-backend
```

Install dependencies:

```bash
npm install
```

Install required packages manually if needed:

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
```

Install development dependency:

```bash
npm install nodemon --save-dev
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

Example configuration:

```
PORT=5000
MONGO_URI=mongodb+srv://cmsadmin:password@vanet-cms-cluster.mongodb.net/vanetcms
JWT_SECRET=vanet_super_secret_key
```

---

# ▶️ Running the Backend

Start the server:

```bash
node src/server.js
```

Or using nodemon:

```bash
npx nodemon src/server.js
```

Expected output:

```
MongoDB Connected Successfully
Server running on port 5000
```

Backend will run on:

```
http://localhost:5000
```

---

# 📡 API Endpoints

## Authentication

### Login

```
POST /api/auth/login
```

Request Body:

```json
{
  "username": "admin",
  "password": "password"
}
```

---

## Accident API

### Send Accident Alert

```
POST /api/accidents
```

Example request:

```json
{
  "rsuId": "RSU_01",
  "vehicleId": "CAR_45",
  "severity": "HIGH",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

---

### Get All Accidents

```
GET /api/accidents
```

Returns all accident reports stored in the database.

---

## RSU API

### Register RSU

```
POST /api/rsu
```

### Get All RSUs

```
GET /api/rsu
```

---

# 🗄 Database Collections

The system uses the following MongoDB collections:

| Collection | Purpose                  |
| ---------- | ------------------------ |
| users      | CMS admin authentication |
| rsu        | Road Side Units          |
| accidents  | Accident reports         |
| vehicles   | Vehicle information      |
| alerts     | Emergency alerts         |

---

# 📊 Example Accident Record

```json
{
  "rsuId": "RSU_01",
  "vehicleId": "CAR_12",
  "severity": "HIGH",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "timestamp": "2026-02-04T10:20:00Z"
}
```

---

# 🌐 Deployment (Optional)

This backend can be deployed on:

* **Vercel**
* **Render**
* **Railway**
* **AWS EC2**

Environment variables must be configured on the hosting platform.

---

# 🔮 Future Enhancements

* Real-time accident notifications
* WebSocket based alerts
* Live accident map
* RSU heartbeat monitoring
* Emergency service integration
* Vehicle tracking

---

# 👨‍💻 Author

Final Year Engineering Project

**VANET Accident Detection System**

---

# ⭐ Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed changes.

---

# 📜 License

This project is intended for **educational and research purposes**.
