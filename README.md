# 🗳️ TeamVote – Tech Demo by Mohammad Butt

**TeamVote** is a real-time collaborative voting application designed as a tech demo. It allows users to submit ideas, vote on them, and see scores update live—all with a clean, responsive UI and local data persistence.

---

## 🚀 Core Features

- **Idea Display**  
  View a list of ideas, each showing the title, description, and current score.

- **Vote Buttons**  
  Upvote and downvote buttons allow users to cast their vote on any idea.

- **Live Score Updates**  
  Scores update in real-time using Socket.IO and optimistic UI updates for a smooth experience.

- **Voter Information**  
  Each idea displays the username of the person who submitted it.

- **Local Data Persistence**  
  All ideas and votes are stored locally using SQLite, allowing offline access.

- **Username Handling**  
  Users enter a simple username, which is stored in `localStorage` and used to tag their votes.

---

## 🎨 Style Guidelines

TeamVote follows a consistent and modern UI/UX style inspired by clean design principles.

### 🎨 Color Scheme

| Element         | HSL Value               | Hex Code   | Description                                   |
|----------------|--------------------------|------------|-----------------------------------------------|
| Primary Color   | `hsl(210, 70%, 50%)`     | `#3399FF`  | Vibrant blue used for primary UI elements     |
| Background      | `hsl(210, 20%, 95%)`     | `#F0F8FF`  | Light blue for readability and clean layout   |
| Accent Color    | `hsl(180, 60%, 40%)`     | `#26998F`  | Teal used for buttons, indicators, and highlights |

### 🖋 Typography

- **Font**: [Inter](https://rsms.me/inter/) – a modern, clean sans-serif font used for both body text and headings.

### 🧱 Layout & UI

- **Card-Based Layout**  
  Ideas are displayed in structured cards with consistent spacing and alignment.

- **Animations**  
  Subtle transitions play when ideas are added or votes are cast to provide user feedback.

- **Icons**  
  Simple, recognizable icons are used for upvote/downvote actions, following a minimal and intuitive design.

---

## 📂 Getting Started

To explore the app's structure and start development, begin with:  
`src/app/page.tsx` – this is the entry point of the UI and contains the main interaction flow.

---

Feel free to contribute or fork for your own collaborative real-time applications!

