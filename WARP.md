# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Initial Setup
```powershell
# Install all dependencies (backend and frontend)
npm run build

# Create .env file in backend directory (copy from .env.example):
copy backend\.env.example backend\.env

# Create .env file in frontend directory (copy from .env.example):
copy frontend\.env.example frontend\.env

# Required backend environment variables:
# PORT=5001
# MONGODB_URI=mongodb://localhost:27017/chatapp
# JWT_SECRET=your_jwt_secret
# CLOUDINARY_CLOUD_NAME=your_cloudinary_name
# CLOUDINARY_API_KEY=your_cloudinary_key  
# CLOUDINARY_API_SECRET=your_cloudinary_secret
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----"
# NODE_ENV=development

# Required frontend environment variables:
# VITE_FIREBASE_API_KEY=your-api-key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
# VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
# VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Development
```powershell
# Start backend development server (with nodemon)
npm run dev --prefix backend

# Start frontend development server (Vite)
npm run dev --prefix frontend

# Start production backend server
npm run start

# Build frontend for production
npm run build --prefix frontend
```

### Linting and Code Quality
```powershell
# Lint frontend code
npm run lint --prefix frontend

# Preview frontend production build
npm run preview --prefix frontend
```

### Testing and Debugging
```powershell
# Run specific backend file for debugging
node backend/src/seeds/user.seed.js

# Check backend logs in development
# Logs include MongoDB connection status, socket connections, and API requests
```

## Architecture Overview

### Technology Stack
- **Backend**: Node.js + Express.js with Socket.io for real-time communication
- **Frontend**: React 19 + Vite with Tailwind CSS and DaisyUI
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Zustand stores
- **Authentication**: Dual authentication system - JWT tokens with HTTP-only cookies + Firebase Authentication with Google Sign-In
- **File Upload**: Cloudinary integration for image handling
- **Styling**: Tailwind CSS with DaisyUI components

### Key Architecture Patterns

#### Backend Structure (MVC Pattern)
- `backend/src/index.js` - Main server entry point with Express app and Socket.io setup
- `backend/src/lib/socket.js` - Socket.io server configuration and user socket mapping
- `backend/src/controllers/` - Business logic handlers (auth, messages)
- `backend/src/models/` - Mongoose schemas (User, Message)
- `backend/src/routes/` - Express route definitions
- `backend/src/middleware/` - Authentication middleware
- `backend/src/lib/` - Utility modules (DB connection, Cloudinary, utils)

#### Frontend Structure (Component + Store Pattern)
- `frontend/src/App.jsx` - Main app component with routing and auth checks
- `frontend/src/store/` - Zustand stores for global state management:
  - `useAuthStore.js` - Authentication state and Socket.io client connection
  - `useChatStore.js` - Chat messages and users state
  - `useThemeStore.js` - UI theme management
- `frontend/src/components/` - Reusable UI components
- `frontend/src/pages/` - Route-based page components
- `frontend/src/lib/axios.js` - Axios instance with base URL configuration

#### Real-time Communication Flow
1. **Socket Connection**: Established in `useAuthStore.connectSocket()` when user authenticates
2. **User Presence**: Backend tracks online users in `userSocketMap` object
3. **Message Broadcasting**: New messages emitted to specific users via `getReceiverSocketId()`
4. **Frontend Subscription**: `useChatStore.subscribeToMessages()` listens for real-time updates

#### Authentication Flow
**Traditional Email/Password:**
1. JWT tokens stored in HTTP-only cookies for security
2. `auth.middleware.js` validates tokens on protected routes
3. Frontend stores user state in `useAuthStore` with automatic token validation
4. Socket authentication via query parameters with user ID

**Firebase Google Authentication:**
1. Frontend initiates Google sign-in popup via `useAuthStore.googleSignIn()`
2. Firebase returns ID token after successful Google authentication
3. Frontend sends ID token to `/api/auth/firebase` endpoint
4. Backend verifies Firebase token and creates/updates user in MongoDB
5. Backend returns JWT token for session management (same flow as traditional auth)
6. Middleware supports both Firebase Bearer tokens and JWT cookies

#### Data Models
- **User**: Email, fullName, password (bcrypt, optional for Firebase users), profilePic (Cloudinary URL), firebaseUid (optional, for Google auth users)
- **Message**: senderId, receiverId, text, image (optional Cloudinary URL), timestamps

### Environment Configuration
- **Development**: Frontend (localhost:5173) + Backend (localhost:5001)
- **Production**: Static frontend served from backend with fallback routing
- **CORS**: Configured for development cross-origin requests
- **Socket.io**: Separate CORS configuration for WebSocket connections

### State Management Strategy
- **Authentication State**: Centralized in `useAuthStore` with socket connection management
- **Chat State**: Separate `useChatStore` for messages and user lists
- **Real-time Updates**: Socket events directly update Zustand stores
- **Optimistic Updates**: Messages added immediately to state before server confirmation

### File Upload Pattern
- Frontend converts images to base64
- Backend uploads to Cloudinary and stores secure URL
- Image URLs included in message documents for efficient retrieval

### Development vs Production Differences
- **API Base URL**: Environment-based switching in axios configuration
- **Static Serving**: Production serves frontend build from backend
- **Socket URL**: Dynamic based on development/production mode
- **CORS**: Development-only cross-origin configuration
