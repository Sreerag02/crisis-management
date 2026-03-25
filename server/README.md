# Crisis Management Backend

This is the backend for the Crisis Management system built with Node.js, Express, and MongoDB.

## Tech Stack
- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database (using Mongoose ODM)
- **dotenv**: Environment variable management
- **CORS**: Cross-Origin Resource Sharing

## Directory Structure
- `config/`: Configuration files (e.g., database connection)
- `controllers/`: Logic for handling requests for each model
- `middlewares/`: Custom middlewares (e.g., error handling, async handling)
- `models/`: Mongoose schemas for data models
- `routes/`: API route definitions

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### Installation
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file in the `server` directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/crisis-management
NODE_ENV=development
```

### Running the Server
- Development mode (with nodemon):
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

## API Endpoints
- `/api/shelters`: Shelter management
- `/api/volunteers`: Volunteer management
- `/api/broadcasts`: Broadcast/Notice management
- `/api/families`: Family status management
- `/api/resources`: Resource tracking
- `/api/alerts`: Emergency alerts
