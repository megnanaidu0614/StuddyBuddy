# StudyBuddy

A comprehensive study management application that combines multiple learning techniques to help students master their academic material effectively.

## Features

### **Class & File Management**
- **Organized Class Structure**: Create and manage multiple classes with nested folder organization
- **File Upload & Management**: Upload, view, edit, and delete files within your class structure
- **Mind Map Integration**: Create and save interactive mind maps directly within your classes
- **Flashcard System**: Build comprehensive flashcard sets with text, images, and math equations

### **Study Techniques**

#### **Feynman Technique**
- Explain complex topics in simple terms
- AI-powered analysis of your explanations
- Detailed feedback on understanding gaps
- Personalized improvement suggestions
- Knowledge scoring and progress tracking

#### **Pomodoro Technique**
- 25-minute focused study sessions
- 5-minute short breaks
- 25-minute long breaks every 4 sessions
- Session tracking and statistics
- Confetti celebration on completion
- Automatic state persistence

#### **Mind Mapping**
- Interactive canvas for visual learning
- Multiple shape types: rectangles, circles, text boxes, arrows
- Customizable color palette with earthy tones
- Drag, resize, and rotate functionality
- Real-time collaboration-ready structure

#### **Active Recall Flashcards**
- Spaced repetition algorithm
- Knowledge level tracking (1-5 scale)
- Smart card ordering based on performance
- Progress statistics and analytics
- Image and LaTeX math equation support

### **User Experience**
- **Earthy Tone Design**: Calming brown and green color scheme
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Auto-Save**: Content automatically saved to localStorage
- **State Persistence**: Maintains your work across page reloads
- **Intuitive Navigation**: Clean, organized interface

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studybuddy.git
   cd studybuddy
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

5. **Start the application**
   
   **Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with custom earthy color palette
- **State Management**: React hooks with localStorage persistence
- **Icons**: Lucide React
- **File Handling**: Client-side image processing

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Storage**: Local file system with organized structure
- **API**: RESTful endpoints for all CRUD operations

### Key Components

#### **Dashboard**
- Class management and navigation
- Welcome screen with study technique cards
- Sidebar with class selection and actions

#### **Class Directory**
- Hierarchical folder structure
- File upload and management
- Flashcard set creation and organization
- Mind map integration

#### **Study Techniques**
- **Feynman**: AI-powered explanation analysis
- **Pomodoro**: Timer with session tracking
- **Mind Mapping**: Interactive canvas with shape tools
- **Flashcards**: Active recall with spaced repetition

## Project Structure

```
studyBuddy/
├── backend/
│   ├── controllers/          # API route handlers
│   ├── middleware/           # Authentication & validation
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   └── uploads/             # File storage
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── feynmanTechnique/    # Feynman analysis
│   │   │   ├── pomodoro/            # Timer application
│   │   │   ├── mindMapping/         # Visual mind mapping
│   │   │   ├── createFlashcardSet/  # Flashcard creation
│   │   │   ├── editFlashcardSet/    # Flashcard editing
│   │   │   └── practiceFlashcardSet/ # Active recall practice
│   │   └── components/      # Reusable React components
│   └── public/              # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Classes
- `GET /api/classes` - Get user's classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Files & Folders
- `GET /api/classes/:id/folders` - Get folders
- `POST /api/classes/:id/folders` - Create folder
- `GET /api/classes/:id/files` - Get files
- `POST /api/classes/:id/files` - Upload file
- `GET /api/classes/:id/files/:fileId/download` - Download file

### Flashcards
- `GET /api/classes/:id/flashcardSets` - Get flashcard sets
- `POST /api/classes/:id/flashcardSets` - Create flashcard set
- `PUT /api/classes/:id/flashcardSets/:setId` - Update flashcard set
- `POST /api/classes/:id/flashcardSets/:setId/activeRecall` - Update active recall data

### Feynman Technique
- `POST /api/feynman/analyze` - Analyze explanation


## Security Features

- JWT-based authentication
- Protected API routes
- File upload validation
- Input sanitization
- Secure password handling


## Acknowledgments

- **Next.js** for the amazing React framework
- **Tailwind CSS** for the utility-first styling
- **Lucide** for the beautiful icons
- **MongoDB** for the flexible database
- **Express.js** for the robust backend


---

**Happy Studying!
