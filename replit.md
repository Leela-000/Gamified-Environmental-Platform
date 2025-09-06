# Overview

This is a React-based environmental awareness web application featuring an interactive 3D Earth globe as the centerpiece. The application promotes environmental conservation through an immersive landing page design with topics like ocean conservation, climate change, arctic preservation, and water conservation. Built with modern web technologies, it combines a React frontend with an Express backend and uses PostgreSQL for data storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server for fast hot reloading
- **Tailwind CSS** for utility-first styling with shadcn/ui component library
- **Three.js** integration for 3D Earth globe rendering and interaction
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and API caching

## Backend Architecture
- **Express.js** server with TypeScript support
- **RESTful API** design with health check endpoints
- **File serving** capabilities for 3D model assets (.glb files)
- **In-memory storage** implementation with interface for future database integration
- **Session management** prepared with connect-pg-simple for PostgreSQL sessions

## Component Design
- **Modular UI components** using Radix UI primitives for accessibility
- **3D Globe component** with interactive drag controls and smooth rotation
- **Topic card system** with hover effects and navigation capabilities
- **Social media sidebar** with platform integration points
- **Responsive design** optimized for desktop and mobile experiences

## Database Strategy
- **Drizzle ORM** configured for PostgreSQL database operations
- **Type-safe schema** definitions with Zod validation
- **Migration system** set up for database schema evolution
- **User management** schema with authentication foundations

## Build and Development
- **TypeScript** configuration for full-stack type safety
- **ESM modules** throughout the application
- **Development/production** build processes with esbuild optimization
- **Hot module replacement** during development
- **Static asset serving** for production deployments

# External Dependencies

## Database Services
- **PostgreSQL** database (configured via DATABASE_URL environment variable)
- **Neon Database** serverless PostgreSQL provider integration
- **Drizzle Kit** for database migrations and schema management

## UI and Styling
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography
- **Google Fonts** integration for typography (Inter, DM Sans, Fira Code, Geist Mono)

## 3D Graphics and Animation
- **Three.js** for 3D rendering and WebGL operations
- **GLTFLoader** for loading 3D Earth model assets
- **Canvas-based rendering** for interactive globe experience

## Development Tools
- **Replit** platform integration with cartographer and error overlay plugins
- **PostCSS** with Autoprefixer for CSS processing
- **TypeScript** compiler with strict type checking
- **Vite plugins** for React and development enhancement

## External Content
- **Unsplash** image API for environmental topic imagery
- **Social media platforms** integration points (Twitter, Instagram, Facebook)