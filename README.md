1# 🌐 Personal Portfolio Website | Hemant Verma

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite3](https://img.shields.io/badge/SQLite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

A stunning, premium, and feature-rich **Personal Portfolio Website** designed for **Hemant Verma** (Information Technology Student & Full-Stack Developer). This website serves as a highly interactive digital resume, project showcase, and admin dashboard with a dual-backend implementation option (Node.js/Express & Python).

---

## ✨ Features

### 🌌 Elegant User Experience
*   **Dynamic Splash Screen:** A beautiful video-intro overlay (skip-on-click) with a premium floating avatar animation.
*   **Typing Effect:** Interactive typing header highlighting roles (Student, Developer, Innovator, Tech Enthusiast).
*   **Aesthetic Theme Toggle:** Instantly switch between custom dark-mode and light-mode configurations with state persistence.
*   **Rich Micro-Animations:** Premium CSS-based gradients, hovering effects, glowing orbs, and modal transitions.

### 📚 Academic Results Showcase
*   **Interactive Cards:** Detailed CGPA display for Semester 1 (8.3), Semester 2 (7.7), and Semester 3 (9.2).
*   **Dynamic Calculations:** Automatically calculates the average CGPA and equivalent percentage in real-time.
*   **Protected Marksheets:** View marksheets behind a secure client-side password interface to protect sensitive documents.

### 💻 Interactive Project Showcase
*   **Filter & Search:** Live, client-side category filtering (Web, Java, C++, AI/ML) and query search.
*   **In-App Code Previews:** Modal popups with syntax highlighting (powered by Prism.js) to view code snippets directly.
*   **Featured Badges:** Highlight key repositories and live demo links.

### ✍️ Visitor Guestbook
*   **Interactive Signing:** Visitors can leave names, text messages, and pick reaction emojis.
*   **Real-Time Guestbook entries:** Dynamically loaded and displayed on the home page.

### 🔐 Secure Admin Dashboard & Inbox
*   **JWT Protected Dashboard:** Access sent messages, check out analytics, and view guestbook signatures.
*   **Admin Login:** Secure authentication panel using SQLite database verification with hashed passwords.

### ✉️ Contact Form & Mailer
*   **Dual Backend Storage:** Saves contact entries directly to the SQLite database.
*   **Automatic Email Notification:** Sends instant copies of the message to the developer and emails an automated thank-you receipt to the visitor (Node.js/Express implementation).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Vanilla HTML5, Custom CSS3 Grid/Flexbox, Vanilla JavaScript, Google Fonts (Inter) |
| **Libraries** | Prism.js (Syntax Highlighting) |
| **Backend Option A** | Node.js, Express, `bcryptjs` (Password hashing), `jsonwebtoken` (Auth tokens), `nodemailer` (Emails), `express-rate-limit` (Spam prevention) |
| **Backend Option B** | Python (Built-in `http.server` & `sqlite3`) |
| **Database** | SQLite3 (`database.sqlite`) |

---

## 📁 Repository Structure

```text
├── index.html                   # Main page: About Me, Academic Results & Guestbook
├── skills.html                  # Skills portfolio overview
├── projects.html                # Project portfolio with live search & code previews
├── certifications.html          # Professional credentials & certifications
├── resume.html                  # Interactive resume viewer
├── contact.html                 # Contact Form with feedback validations
├── login.html                   # Admin authentication portal
├── dashboard.html               # Protected metrics & message list dashboard
├── styles.css                   # Comprehensive CSS variables & global styling system
├── server.js                    # Node.js/Express backend server
├── server.py                    # Python http.server backend implementation
├── package.json                 # Node dependencies configuration
├── database.sqlite              # SQLite database (Stores messages & guestbook entries)
├── start_backend.command        # macOS executable script to start the Python server
└── sync_to_github.command       # Automated Git staging, committing, and pushing utility
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have Node.js (for the Express backend) or Python 3 installed on your system.

### Option 1: Running the Python Backend (Default)
The Python server is lightweight and requires no external package installations.

1.  Open your terminal in the project directory.
2.  Run the helper startup script (on macOS):
    ```bash
    ./start_backend.command
    ```
    *Alternatively, run the server directly:*
    ```bash
    python3 server.py
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Option 2: Running the Node.js / Express Backend
The Node.js backend includes advanced features like password hashing, JWT authentication, rate-limiting, and email sending via Nodemailer.

1.  Install the required dependencies:
    ```bash
    npm install
    ```
2.  Set up your environment variables in a `.env` file in the root directory:
    ```env
    PORT=3000
    JWT_SECRET=your_super_secret_jwt_key
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Authentication Credentials (Default)

To test the protected parts of the portfolio (such as the admin panel and viewing secure academic marksheets):

*   **Protected Marksheet Access Password:** `Hemant@2004`
*   **Admin Dashboard login details:**
    *   **Email:** `hemantverma@gmail.com`
    *   **Password:** `Hemant@2004`

---

## 🔄 Synchronizing to GitHub

A macOS script (`sync_to_github.command`) is included to automate your Git workflow:
```bash
./sync_to_github.command
```
This utility will automatically prompt you for a commit message, stage all changes, commit them, and push the updates directly to your GitHub repository.
