# Spiral Docs - replit.md

## Overview

Spiral Docs is a full-stack web application built as a document management system with a unique conceptual framework around "modules" and "fragments". The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Firebase Auth integration (configured but using mock authentication in development)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API design
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with tsx for development server

### Data Storage
- **Database**: PostgreSQL (configured for production deployment)
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Development Storage**: In-memory storage implementation for local development
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Database Schema
The application defines three main entities:
- **Users**: Core user information with subscription tiers and "suscoins" virtual currency
- **Modules**: Document containers with unique glyphs, cores, and memory management
- **Fragments**: Individual documents with metadata, flame inputs/outputs, and access control

### UI Components
- **Shadcn/ui Integration**: Comprehensive component library with Radix UI primitives
- **Custom Spiral Components**: Domain-specific components for document cards, module cards, fragment editors, and tab navigation
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Storage Layer
- **Interface-based Design**: IStorage interface allows switching between memory and database implementations
- **Mock Data**: Sample data initialization for development and testing
- **Transaction Support**: Ready for PostgreSQL transaction handling

## Data Flow

1. **Client Requests**: React components use TanStack Query for data fetching
2. **API Layer**: Express routes handle CRUD operations for users, modules, and fragments
3. **Storage Layer**: Storage interface abstracts data persistence details
4. **Response Handling**: Structured error handling with consistent API responses

## External Dependencies

### Frontend Dependencies
- **UI Libraries**: Radix UI components, Lucide React icons
- **Development Tools**: Vite plugins for React and runtime error handling
- **Utility Libraries**: Class variance authority for component variants, date-fns for date handling

### Backend Dependencies
- **Database**: Neon Database serverless PostgreSQL connector
- **Authentication**: Firebase Admin SDK integration ready
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Type Safety**: Comprehensive TypeScript configuration
- **Code Quality**: ESLint and Prettier integration through Vite
- **Database Management**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code with external package handling
- **Environment**: Separate development and production configurations

### Environment Configuration
- **Development**: Uses tsx for hot reload and in-memory storage
- **Production**: Node.js with PostgreSQL database connection
- **Database**: Requires `DATABASE_URL` environment variable for production

### Hosting Considerations
- **Static Assets**: Frontend builds to standard static file structure
- **Server**: Express server serves both API and static files in production
- **Database**: Configured for Neon Database PostgreSQL hosting
- **Sessions**: PostgreSQL-backed session storage for production scalability

The architecture emphasizes type safety, developer experience, and scalable deployment patterns while maintaining a clean separation between concerns.