# ELTE Órarend (Timetable)

A modern web application for managing and viewing ELTE (Eötvös Loránd University) course timetables. This monorepo contains both the frontend web application and the backend API service.

> **Note**: This is an unofficial application and is not affiliated with or endorsed by ELTE University.

## 🌐 Live Demo

Try the application online: [https://gernyimark.web.elte.hu](https://gernyimark.web.elte.hu)

## 🎯 Features

-   **Course Search**: Search for courses by subject, teacher, or course code
-   **Timetable Management**: Create and manage personal timetables
-   **Calendar View**: Interactive calendar display
-   **Event Editing**: Edit and customize lesson details
-   **Data Export**: Export timetables as images or shareable URLs
-   **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Development Setup

1. **Backend (API)**

    ```bash
    cd apps/api
    npm install
    npm run dev
    ```

2. **Frontend (Web)**
    ```bash
    cd apps/web
    npm install
    npm run dev
    ```

The API will be available at `http://localhost:3000` and the web app at `http://localhost:5173`.

## 🚀 Deployment

The frontend builds to static files that can be deployed to any static hosting service.
The backend can be deployed to any Node.js hosting platform.

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
