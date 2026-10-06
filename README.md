# WatchUp – YouTube Watch Party

WatchUp is a real-time YouTube Watch Party application where multiple users can watch YouTube videos together in the same room.

## Project Goal

To provide synchronized YouTube watching with real-time communication and role-based controls.

## Project Links

* **Live Demo:** https://watchup-client.onrender.com
* **Repository:** https://github.com/mdimtiyaz93/WatchUp

## Features

* Create and join rooms
* Host can assign roles and remove participants
* Host/Moderator playback controls
* Play/Pause synchronization
* Seek synchronization
* Change video synchronization
* Participant action requests
* Real-time chat and reactions
* User authentication

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Socket.IO Client, Clerk
**Backend:** Node.js, Express.js, Socket.IO, MongoDB, Mongoose
**Deployment:** Render

## Architecture

```text
Users
  ↓
React Frontend
  ↓ Socket.IO
Node.js + Express
  ↓
MongoDB
```

Socket.IO handles real-time video synchronization, participant updates and chat.

## Backend Socket Events

| Event                | Purpose        |
| -------------------- | -------------- |
| `join_room`          | Join room      |
| `leave_room`         | Leave room     |
| `assign_role`        | Assign role    |
| `remove_participant` | Remove user    |
| `request_action`     | Request action |
| `approve_request`    | Approve/Reject |
| `play / pause`       | Playback sync  |
| `seek`               | Seek sync      |
| `change_video`       | Video sync     |
| `chat-message`       | Chat           |
| `reaction`           | Reactions      |

## Project Structure

```text
WatchUp/
├── backend/    # Node.js + Express + Socket.IO
├── client/     # React + Vite + Tailwind
└── README.md
```

## Setup & Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Create:

```text
backend/.env
```

Add the required MongoDB and server variables.

### Frontend

```bash
cd client
npm install
npm run dev
```

Create:

```text
client/.env
```

Add the required Clerk and backend URL variables.

## Author

**Md Imtiyaz**

