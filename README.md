# 🦁 LionLink  
### Trust-First Study Partner Matching Platform

LionLink is a full-stack React + Firebase web application designed to help university students discover compatible study partners based on shared courses, study styles, and availability.

The platform prioritizes verified academic identity, structured data modeling, and low-friction user experience over social-media-style engagement.

---

## 🔗 Live Links

🌐 **Live Application:**  
https://lionlink-c232a.web.app  

🎬 **Demo Video:**  
https://drive.google.com/file/d/1knNzLbkZyOutLw5tb22nHq_gUGoJHhWb/view?usp=drive_link  

---

## 🚀 What This Project Demonstrates

- Full-stack architecture using React + Firebase  
- Domain-restricted authentication (university-only access)  
- Structured Firestore data modeling  
- Custom partner-matching logic  
- Optimistic UI updates for real-time feedback  
- Clean separation of business logic from UI components  
- Mobile-first responsive design  

---

## 🛠 Tech Stack

### Frontend
- React 18  
- TypeScript  
- Vite  

### Backend / BaaS
- Firebase Authentication  
- Cloud Firestore  
- Firebase Hosting  

### Styling
- Tailwind CSS  
- Lucide Icons  

---

## 🏗 Architecture Overview

LionLink follows a client-driven architecture:

- **Firebase Authentication** handles secure login and domain-based access control.  
- **Firestore** stores user profiles, academic sessions, and relationship mappings.  
- Matching logic runs in a dedicated `/lib` module.  
- React Context + custom hooks manage application state.  
- UI components remain presentation-focused and reusable.  

This structure improves maintainability and supports iterative scaling.

---

## 🧠 Key Engineering Decisions

### 🔐 Domain-Restricted Authentication
Access is limited to verified university email domains to create a higher-trust academic environment.

### 📊 Firestore Data Modeling

Each user profile document follows a structured schema:

```ts
{
  uid: string,
  email: string,
  name: string,
  major: string,
  year: string,
  enrolledCourses: string[],
  studyStyleTags: string[],
  mode: string[],
  uni: string
}
```

This design enables scalable partner discovery and flexible matching logic.

### ⚡ Optimistic UI Updates
Session interest counts update immediately on user interaction before server confirmation, improving perceived performance and responsiveness.

---

## 📂 Project Structure

```text
lionlink/
├── index.html
├── firebase.json
├── .firebaserc
├── package.json
├── vite.config.ts
├── tailwind.config.cjs
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   └── lib/
```

Business logic is isolated from rendering logic to support long-term maintainability.

---

##  Running the Project Locally

```bash
npm install
npm run dev
```

---

##  Future Improvements

- Weighted and explainable matching algorithm  
- Calendar-based availability integration  
- Stronger enforcement of email verification workflows  
- Session analytics dashboard  
- Persistent partner preferences and dismissals  

---

## 👩🏽‍💻 Contributors

- Pearl Senza Sikepe  
- Tyra Minnal Vinay  

---

## 📌 Project Context

LionLink was developed as a semester-long design and engineering project exploring the intersection of user-centered design and full-stack system architecture.

The system intentionally prioritizes:
- Trust over scale  
- Clarity over feature bloat  
- Academic utility over social engagement  
