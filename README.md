# LionLink — Finding Study Partners Through Trust and Shared Context

**LionLink** is a student-centered web application designed to help university students find compatible study partners and study sessions based on shared courses, study styles, and availability. The system emphasizes trust, clarity, and low social friction by limiting access to verified university email accounts and by keeping interactions focused on academic collaboration rather than social networking.

This project was developed as a **semester-long design and engineering project**, integrating user-centered design principles with a functional, deployable system.

---

## Problem Statement

University students often struggle to find effective study partners despite being surrounded by peers in the same courses. Existing solutions—group chats, large forums, or social platforms—are often noisy, unstructured, or socially intimidating. As a result, students default to studying alone even when collaborative study would be beneficial.

LionLink addresses this gap by offering a lightweight, purpose-built tool that helps students identify and connect with others who share:
- the same courses,
- compatible study styles,
- and similar expectations around collaboration.

---

## Design Solution

LionLink provides a focused workflow that allows students to:

- Authenticate using a verified university email address  
- Create a concise academic profile  
- View potential study partners with transparent match percentages  
- Browse upcoming study sessions  
- Express interest in sessions through a simple interaction  
- Navigate the app using a clear, mobile-first interface  

The design intentionally avoids social-media-style engagement in favor of calm, task-oriented interactions aligned with academic contexts.

---

## Demo-Oriented Design Decisions

This version of LionLink is optimized for demonstration and evaluation purposes:

- Email verification is partially bypassed to ensure a smooth demo experience  
- Matching logic is intentionally generous to clearly demonstrate the concept  
- Interest counts use optimistic UI updates for immediate visual feedback  
- Some interactions (e.g., dismissing partners, connecting) are local-only  

These choices are documented directly in the code to support future development.

---

## Technology Stack

- **Frontend:** React, TypeScript, Vite  
- **Styling:** Tailwind CSS  
- **Backend Services:** Firebase Authentication and Firestore  
- **Hosting:** Firebase Hosting  

---

## Project Structure
## Project Structure

```text
lionlink/
├── index.html
├── firebase.json
├── .firebaserc
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── App.css
│   ├── App.tsx
│   ├── components/
│   │   ├── BottomNavigation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FindPartnersScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SessionsScreen.tsx
│   │   └── VerifyEmailScreen.tsx
│   └── lib/
│       ├── auth.ts
│       ├── authState.ts
│       ├── createSession.ts
│       ├── firebase.ts
│       ├── logout.ts
│       ├── match.ts
│       ├── partners.ts
│       ├── profiles.ts
│       ├── seed.ts
│       ├── sessionActions.ts
│       ├── sessionInterest.ts
│       ├── sessions.ts
│       ├── updateProfile.ts
│       └── useMyProfile.ts
```
---

## Firebase Configuration

### Authentication
- Email/password authentication enabled  
- Restricted to university email domain  
- Authorized domains configured for local development and deployment  

### Firestore User Profile Schema

Each user profile document includes:

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
---
### Running the Project Locally
```bash
npm install
npm run dev
```
---
### Deployment
The application is deployed using Firebase Hosting.
The production build is generated via Vite and served as a single-page application.
---
### Demo Video
The project demo video:
	•	Uses a 16:9 aspect ratio
	•	Includes narration
	•	Explains the problem, design process, and solution
	•	Demonstrates the deployed application

The video integrates both conceptual explanation and live interaction with the system.
---
### Design Reflection
LionLink prioritizes:
	•	trust over scale
	•	clarity over complexity
	•	academic usefulness over social engagement

The system is intentionally modest in scope, demonstrating how thoughtful constraints can improve usability and user comfort.
---
### Future Work
Potential next steps include:
	•	Persistent partner preferences and dismissals
	•	Availability-based scheduling and calendar integration
	•	Refined matching weights and explainability
	•	Stronger enforcement of email verification workflows

Inline comments throughout the codebase are written as notes to future contributors to support continued development.
---
### Contributors
- Pearl Senza Sikepe
- Tyra Minnal Vinay
