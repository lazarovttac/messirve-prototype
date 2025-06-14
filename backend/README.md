# Developer Assistant API (NodeJS)

A NodeJS/Express server that provides an AI assistant chatbot for developers to manage their skills, projects, and tasks using Google Gemini AI with function calling.

## Features

- **Gemini AI Integration**: Direct integration with Google Gemini AI for natural language processing
- **Function Calling**: Robust tools system that allows the AI to call functions to modify data
- **Firebase Integration**: Full Firebase Firestore integration for data persistence
- **Developer Management**: Comprehensive tools for managing developer profiles, skills, projects, and tasks
- **Real-time Chat**: WebSocket-ready chat system for real-time communication
- **TypeScript**: Fully typed with TypeScript for better development experience

## Architecture

The server is built with the following structure:

```
src/
├── config/
│   ├── settings.ts     # Environment configuration
│   └── firebase.ts     # Firebase client setup
├── services/
│   ├── database.ts     # Database operations
│   ├── chat.ts         # Gemini AI chat service
│   └── tools.ts        # AI function tools
└── index.ts           # Express server and routes
```

## Tools Available

The AI assistant has access to the following tools:

### Profile Management

- `add_skill` / `remove_skill`: Manage technical skills
- `add_soft_skill` / `remove_soft_skill`: Manage soft skills
- `add_public_note` / `remove_public_note`: Manage public notes (visible to team)
- `add_private_note` / `remove_private_note`: Manage private notes

### Task Management

- `change_task_status`: Update task status (todo/doing/done)
- `create_task`: Create new tasks in projects
- `delete_task`: Remove tasks
- `assign_to_task` / `unassign_from_task`: Manage task assignments

### Project Management

- `create_project`: Create new projects
- `add_user_to_project` / `remove_user_from_project`: Manage project assignments
- `set_project_leader`: Assign project leadership

## Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Google API key with Gemini API access

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=7001
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://192.168.0.9:3000

   # Google API Configuration
   GOOGLE_API_KEY=your_google_api_key_here

   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase_key.json
   FIREBASE_APP_NAME=nodejs-main

   # Chatbot Configuration
   MODEL_NAME=gemini-2.0-flash
   MODEL_TEMPERATURE=0.5
   MODEL_MAX_TOKENS=1000
   ```

3. **Firebase Setup:**

   - Place your Firebase service account JSON file as `firebase_key.json` in the root directory
   - Ensure Firestore is enabled in your Firebase project

4. **Build and Run:**

   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## API Endpoints

### Chat

- `POST /api/chats/message` - Send a message to the AI assistant
- `POST /api/chats` - Create a new chat conversation
- `GET /api/users/:userId/chats` - Get user's chat conversations
- `PUT /api/chats/:chatId` - Update chat messages

### Health

- `GET /health` - Health check endpoint

### Debug

- `POST /api/debug/chat` - Debug endpoint for testing

## Usage Examples

### Basic Chat Request

```typescript
const response = await fetch("/api/chats/message", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "I learned React recently, add it to my skills",
    history: { id: "chat123", messages: [] },
    employeeData: {
      id: "user123",
      name: "John Doe",
      role: "developer",
      hard_skills: ["JavaScript"],
      // ... other user data
    },
    allProjects: [
      /* project data */
    ],
    allUsers: [
      /* user data */
    ],
  }),
});
```

### AI Function Calling

When you say "I learned React", the AI will:

1. Recognize the intent to add a skill
2. Call the `add_skill` function with parameter `"React"`
3. Update the database
4. Respond with confirmation

## Key Differences from Python Version

### Removed Features

- **LangChain**: Direct Gemini API integration instead
- **Multiple Prompts**: Single bot configuration
- **Authentication**: No auth middleware
- **Database GET Endpoints**: Focus on chat functionality

### Enhanced Features

- **TypeScript**: Full type safety
- **Modern Node.js**: Latest ES features
- **Express Middleware**: Security, CORS, rate limiting
- **Error Handling**: Comprehensive error management

## Database Schema

The system expects the following Firestore collections:

### Users Collection

```typescript
{
  id: string;
  name: string;
  role: string;
  hard_skills: string[];
  soft_skills: string[];
  public_notes: string[];
  private_notes: string[];
  projects: string[];
  tasks: string[];
  hours: number;
  max_hours: number;
}
```

### Projects Collection

```typescript
{
  id: string;
  name: string;
  description: string;
  leader: string;
  devs: string[];
  created_at: FirebaseTimestamp;
}
```

### Tasks Collection

```typescript
{
  id: string;
  name: string;
  description: string;
  projectId: string;
  state: 'todo' | 'doing' | 'done';
  hours: number;
  skills: string[];
  dev: string;
}
```

### Chats Collection

```typescript
{
  id: string;
  user_id: string;
  receiver_id: string;
  created_at: FirebaseTimestamp;
  updated_at: FirebaseTimestamp;
  messages: Message[];
}
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run watch` - Development with nodemon

### Project Structure

The codebase follows clean architecture principles with separation of concerns:

- **Config**: Environment and service configuration
- **Services**: Business logic and external integrations
- **Routes**: HTTP endpoint definitions
- **Types**: TypeScript interfaces and types

## Monitoring and Logging

The server includes:

- **Morgan**: HTTP request logging
- **Helmet**: Security headers
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error catching and logging

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Configure proper logging
4. Set up health check monitoring
5. Configure reverse proxy (nginx)
6. Enable HTTPS

## Troubleshooting

### Common Issues

1. **Firebase Connection**: Ensure service account key path is correct
2. **Gemini API**: Verify API key and model name
3. **CORS**: Check CORS origins configuration
4. **Rate Limiting**: Adjust limits for your use case

### Debugging

Enable debug mode by setting logging levels and using the debug endpoint to test functionality.

## Contributing

When contributing:

1. Follow TypeScript best practices
2. Add proper error handling
3. Update documentation
4. Test with different scenarios
5. Ensure Firebase security rules compatibility
