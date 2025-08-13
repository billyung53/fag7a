# React + Vite Project

A modern React.js application built with Vite for fast development and optimized production builds.

## Features

- ⚡️ Fast development with Vite's Hot Module Replacement (HMR)
- ⚛️ React 19.1.1 with modern functional components
- 🔧 ESLint configuration for code quality
- 📁 Clean project structure ready for development

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

Dependencies are already installed. If you need to reinstall them:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Create a production build:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
src/
├── components/     # Reusable React components
├── assets/         # Static assets (images, fonts, etc.)
├── App.jsx         # Main App component
├── main.jsx        # Application entry point
└── index.css       # Global styles

public/             # Static files served directly
├── vite.svg        # Vite logo
└── ...

```

## Development Guidelines

- Use modern React patterns with hooks and functional components
- Follow the existing ESLint configuration
- Keep components focused and reusable
- Use proper file naming conventions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
