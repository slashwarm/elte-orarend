# ELTE Órarend (Timetable)

A modern web application for managing and viewing ELTE (Eötvös Loránd University) course timetables. This monorepo contains both the frontend web application and the backend API service.

## 🏗️ Project Structure

```
elte-orarend/
├── apps/
│   ├── api/                 # Backend API service
│   │   ├── src/
│   │   │   └── index.ts     # Main API server
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                 # Frontend React application
│       ├── src/
│       │   ├── calendars/   # Calendar components
│       │   ├── components/  # Reusable UI components
│       │   ├── utils/       # Utility functions
│       │   ├── styles/      # CSS styles
│       │   ├── App.tsx      # Main application component
│       │   ├── Search.tsx   # Search functionality
│       │   ├── Results.tsx  # Results display
│       │   └── EditEvent.tsx # Event editing
│       ├── public/          # Static assets
│       ├── package.json
│       └── vite.config.js
├── LICENSE
└── README.md
```

## 🚀 Technologies Used

### Backend (API)
- **Hono** - Fast, lightweight web framework
- **Cheerio** - Server-side HTML parsing
- **Zod** - TypeScript-first schema validation
- **TypeScript** - Type-safe JavaScript

### Frontend (Web)
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - React component library
- **FullCalendar** - Calendar component
- **React Query (TanStack Query)** - Data fetching and caching
- **Axios** - HTTP client
- **Day.js** - Date manipulation
- **React Toastify** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Vite** - Development server and build tool

## 🎯 Features

- **Course Search**: Search for courses by subject, teacher, or course code
- **Timetable Management**: Create and manage personal timetables
- **Calendar View**: Interactive calendar display with FullCalendar
- **Event Editing**: Edit and customize lesson details
- **Data Export**: Export timetables as images or shareable URLs
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data fetching with caching

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the API directory:
```bash
cd apps/api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
# Using tsx for TypeScript execution
npx tsx src/index.ts
```

**Note**: The backend is configured for serverless deployment. For local development, you may need to add a server startup script or use a development server like `@hono/node-server`.

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the web directory:
```bash
cd apps/web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The web application will be available at `http://localhost:5173`

## 📖 Usage

### Searching for Courses
1. Use the search interface to find courses by:
   - **Subject**: Search by course name
   - **Teacher**: Search by instructor name
   - **Course Code**: Search by specific course codes

2. Select the academic year and semester

3. View results in the calendar or table format

### Managing Timetables
1. **Add Courses**: Search and select courses to add to your timetable
2. **Edit Events**: Click on events to modify details
3. **Save Timetable**: Your timetable is automatically saved to localStorage
4. **Share Timetable**: Export as URL or image

### Calendar Features
- **Week/Day View**: Switch between different calendar views
- **Event Details**: Click events to see full information
- **Drag & Drop**: Reorganize events (in edit mode)
- **Export**: Download timetable as image

## 🔧 Development

### Project Structure Details

#### Backend (`apps/api/`)
- **`src/index.ts`**: Main server file with Hono framework
- **API Endpoints**: 
  - `POST /api` - Search for course data
- **Data Sources**: Scrapes ELTE's official timetable system

#### Frontend (`apps/web/`)
- **`src/App.tsx`**: Main application component
- **`src/Search.tsx`**: Search interface component
- **`src/Results.tsx`**: Results display component
- **`src/EditEvent.tsx`**: Event editing component
- **`src/calendars/`**: Calendar-related components
- **`src/utils/`**: Utility functions for data processing
- **`src/components/`**: Reusable UI components

### Key Features Implementation

#### Data Management
- **React Query**: Handles data fetching, caching, and synchronization
- **Local Storage**: Persists user timetables
- **URL Parameters**: Shareable timetable links

#### UI/UX
- **Material-UI**: Consistent design system
- **FullCalendar**: Professional calendar interface
- **Responsive Design**: Mobile-first approach

## 🌐 API Documentation

### Endpoints

#### `POST /api`
Search for course timetable data.

**Request Body:**
```json
{
  "mode": "subject" | "teacher" | "course",
  "year": "2024-2025-1",
  "name": "string" | ["string"]
}
```

**Response:**
```json
[
  ["Monday 16:20-18:30 Room 101", "Course Name (CODE)", "Teacher Name (ID)", "location", "type", "course", "teacher", "comment"]
]
```

## 📝 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions, please check the existing issues or create a new one in the repository.
