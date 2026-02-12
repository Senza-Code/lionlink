# 🦁 LionLink
### Finding Study Partners Through Trust and Shared Context

**LionLink** is a student-centered web application built to bridge the gap between "sitting in the same lecture" and "succeeding in the same study group." It prioritizes verified academic identity and a calm, focused UI to reduce the social friction of finding collaborators.

[🎬 Watch the Demo Video](INSERT_YOUTUBE_OR_DRIVE_LINK_HERE)  
[🌐 Visit Live Site](INSERT_FIREBASE_APP_LINK_HERE)

---

## 🛠 Tech Stack

**Frontend:** React 18, TypeScript, Vite  
**Styling:** Tailwind CSS, Lucide-React (Icons)  
**Backend / BaaS:** Firebase (Authentication, Firestore, Hosting)  
**State Management:** Custom React Hooks & Context API  

---

## 🚀 Key Features

- **Verified Academic Access:** Restricts sign-ups to university email domains to ensure a high-trust environment.
- **Intelligent Matching:** Logic-based partner discovery using shared courses, study styles, and availability.
- **Real-time Study Sessions:** Users can create or join sessions with optimistic UI updates for instant feedback.
- **Mobile-First Design:** A responsive, task-oriented interface designed for students on the go.

---

## 🧠 Technical Highlights

- **Clean Architecture:** Organized logic into a dedicated `/lib` directory, separating Firebase transactions from UI components for maintainability.
- **Data Modeling:** Implemented a robust Firestore schema to manage relationships between users and academic sessions.
- **Type Safety:** Leveraged TypeScript interfaces to ensure data integrity across frontend and backend layers.
- **Performance Optimization:** Optimized build sizes using Vite and utility-first CSS (Tailwind) for fast load times and responsiveness.

---

## 📂 Project Structure

```text
src/
├── components/      # Modular, reusable UI elements (Screens, Nav, etc.)
├── lib/             # Firebase logic, Auth state, and Matching algorithms
├── main.tsx         # App entry point
└── App.tsx          # Navigation logic and Global styles
