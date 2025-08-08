# Multiplayer Trivia Backend

## Setup Instructions

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will run on https://fiveo5a.onrender.com

## Features

- Real-time multiplayer communication using Socket.IO
- Session-based game management
- Team coordination and scoring
- Question distribution and timer management
- Mobile-optimized team interfaces

## Game Flow

1. Host enters 4-digit password (default: 1234)
2. Host creates session and gets 6-character code
3. Teams join using session code on mobile devices
4. Host starts game and selects questions
5. Teams answer questions in real-time
6. Automatic scoring and turn management

## API Endpoints

The backend uses Socket.IO events for real-time communication. No REST endpoints needed.
