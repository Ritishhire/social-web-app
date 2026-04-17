# 🚀 Social Media MERN App with CI/CD

A full-stack **3-tier MERN (MongoDB, Express, React, Node.js)** application with complete **DevOps automation using Docker, Jenkins, and Trivy**.

---

## 📌 Features

* 🔐 User Authentication (Register/Login)
* 📝 Create, Edit, Delete Posts
* ❤️ Like & 💬 Comment System
* 📩 Messaging (DM feature)
* 🖼️ Image Upload & View
* 👤 User Profiles

---

## 🏗️ Architecture

This project follows a **3-tier architecture**:

* 🎨 **Frontend** → React (Vite)
* ⚙️ **Backend** → Node.js + Express
* 🗄️ **Database** → MongoDB

---

## ⚙️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **DevOps:** Docker, Jenkins, Trivy
* **Version Control:** Git & GitHub

---

## 🐳 Docker Setup

### 📁 Project Structure

```
social-web-app/
│
├── client/        # React frontend
├── server/        # Node backend
├── docker-compose.yml
└── Jenkinsfile
```

---

### 🚀 Run with Docker

```bash
docker-compose down
docker-compose up --build -d
```

👉 Access app:

* Frontend: http://localhost:3000
* Backend: http://localhost:5000

---

## 🔐 Environment Variables

Create a `.env` file inside the `server` folder:

```
PORT=5000
MONGO_URI=mongodb://mongo:27017/socialapp
JWT_SECRET=your_secret_key
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### 🚀 Pipeline Stages:

1. Clone Code from GitHub
2. Build Docker Images
3. Security Scan (Trivy)
4. Push Images to DockerHub
5. Deploy using Docker Compose
6. Test Containers & APIs

---

## 🔐 Security

* 🔍 Image scanning using **Trivy**
* 🔑 JWT Authentication implemented
* 🚫 `.env` excluded from GitHub

---

## 🧪 Testing

Basic API and container testing included:

```bash
docker ps
curl http://localhost:5000
```

---

## 🐛 Challenges Faced

* ❌ Node version mismatch (Vite issue)
* ❌ Docker container networking issues
* ❌ MongoDB connection errors
* ❌ Login authentication bugs
* ❌ Port conflicts in deployment

---

## 💡 Learnings

* Docker containerization (multi-service apps)
* CI/CD pipeline creation using Jenkins
* Debugging real-world production issues
* Secure application deployment

---

## 📌 Future Improvements

* 🌐 Deploy on AWS (EC2 / ECS)
* 🔒 HTTPS with Nginx
* 📊 Logging & Monitoring
* ⚡ Performance optimization

---

## 🤝 Contributing

Feel free to fork this repo and improve the project!

---

## 📬 Connect with Me

* GitHub: https://github.com/Ritishhire

---

## ⭐ If you like this project, give it a star!
