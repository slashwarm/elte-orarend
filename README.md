# ELTE Órarend (Timetable)

A modern web application for managing and viewing ELTE (Eötvös Loránd University) course timetables. This monorepo contains both the frontend web application and the backend API service.

> **Note**: This is an unofficial application and is not affiliated with or endorsed by ELTE University.

## 🌐 Live Demo

Try the application online: [https://elte-orarend.vercel.app](https://elte-orarend.vercel.app)

## 🎯 Features

-   **Course Search**: Search for courses by subject, teacher, or course code
-   **Timetable Management**: Create and manage personal timetables
-   **Calendar View**: Interactive calendar display
-   **Event Editing**: Edit and customize lesson details
-   **Data Export**: Export timetables as images or shareable URLs
-   **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites

-   Node.js 22 or higher
-   pnpm 10 or higher (`corepack enable pnpm`)

### Development Setup

Install every workspace once from the repository root:

```bash
pnpm install
```

Then start both apps together:

```bash
pnpm dev
```

Or start one app at a time:

```bash
pnpm dev:api   # API on http://localhost:3000/api
pnpm dev:web   # Web app on http://localhost:5173
```

The web app calls `/api` on its own origin. In development the Vite dev server
proxies that path to the local API, so no API URL has to be configured.

## 📦 Repository Layout

```
.
├── api/index.ts      Vercel Function entry point. Mounts the Hono app on /api.
├── apps/api          Hono API. Scrapes tanrend.elte.hu.
├── apps/web          React + Vite front end.
├── pnpm-workspace.yaml
└── vercel.json       Build configuration for the single Vercel project.
```

## 🚀 Deployment

One Vercel project serves both parts from one origin:

-   `apps/web` builds to static files that Vercel serves from the domain root.
-   `apps/api` runs as a Vercel Function on `/api`, mounted by `api/index.ts`.

Vercel deploys automatically on every push to `main`. The relevant project
settings are Root Directory `./` and Node.js 22.x. Everything else comes from
`vercel.json`.

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
