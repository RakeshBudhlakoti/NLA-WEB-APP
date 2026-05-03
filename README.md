# NLA Sports Platform 🏆

NLA Sports is a high-performance athlete storytelling and community platform. It empowers athletes to share their journeys, connect with professional partners, and track their growth through real-time engagement analytics.

## 🏗️ Project Structure

This repository is a monorepo containing three core applications that power the NLA ecosystem:

| Application | Description | Tech Stack |
| :--- | :--- | :--- |
| **`backend-api`** | The engine of the platform, handling data, auth, and business logic. | Node.js, Express, Prisma, PostgreSQL |
| **`frontend-web`** | The main athlete-facing platform for discovery and storytelling. | Next.js, Tailwind CSS, Lucide Icons |
| **`frontend-admin`** | High-fidelity command center for platform administrators. | Next.js, Recharts, Framer Motion |

---

## 🚀 Core Functionality

### 1. Athlete Stories & Media
*   **Discovery**: Browse high-impact athlete stories filtered by category (Training, Nutrition, Mental Health, etc.).
*   **Engagement**: Real-time interaction system with likes, comments, and community points.
*   **Submission**: Streamlined workflow for athletes to upload video and article content.

### 2. Community Intelligence
*   **Engagement Pulse**: Real-time tracking of athlete-to-partner connections.
*   **Content Focus**: Insightful distribution charts showing which sports categories are trending.
*   **Leaderboards**: Automated ranking of top-performing stories based on reach and impact.

### 3. Administrative Governance
*   **Submission Review**: Professional moderation queue for approving or rejecting athlete content.
*   **User Management**: Complete control over athlete profiles, roles, and platform access.
*   **Analytical Dashboard**: Glassmorphic command center with weekly growth and interaction trends.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database
*   AWS S3 Bucket (Optional for production media)

### Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/RakeshBudhlakoti/NLA-WEB-APP.git
    cd NLA-WEB-APP
    ```

2.  **Backend API Setup**:
    ```bash
    cd backend-api
    npm install
    # Copy .env.example to .env and configure your DB
    npx prisma migrate dev
    npm run dev
    ```

3.  **Frontend Admin Setup**:
    ```bash
    cd ../frontend-admin
    npm install
    npm run dev # Runs on http://localhost:3001
    ```

4.  **Frontend Web Setup**:
    ```bash
    cd ../frontend-web
    npm install
    npm run dev # Runs on http://localhost:3000
    ```

---

## 🎨 Design Aesthetic
The NLA Platform follows a **Premium Dark/Glassmorphic** aesthetic, prioritizing visual excellence and high-contrast data visualization to reflect the professional nature of competitive sports.

## ⚖️ License
Internal Use Only - NLA Sports Proprietary.
