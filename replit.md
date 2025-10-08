# Overview

Birmingham Kids is a mobile-first five-directory web application designed to help parents find quality childcare, pediatricians, pediatric dentists, speech & occupational therapists, and Mother's Day Out programs in the Birmingham, Alabama metro area. The application features a Node.js/Express backend with user authentication and a vanilla JavaScript frontend. It offers five comprehensive directories: (1) 278 childcare centers, (2) 77 pediatricians, (3) 55 pediatric dentists, (4) 23 speech & OT therapists, and (5) 21 Mother's Day Out programs - all with advanced filtering, tab-based navigation, and an interactive map view for childcare and pediatricians. The project's ambition is to simplify parenting in Birmingham by providing a user-friendly platform with verified data and a modern, playful aesthetic.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
The application utilizes a Node.js/Express backend with TypeScript, integrating Replit Auth for secure user authentication and session management. A PostgreSQL database, managed with Drizzle ORM, stores user data and favorites. RESTful API endpoints handle authentication and favorite listings.

## Frontend Architecture
The frontend is a vanilla JavaScript single-page application (SPA) with a five-directory structure. It uses `auth.js` for user authentication and favorites synchronization, and `directory-manager.js` to dynamically switch between childcare, pediatrician, dentist, therapist, and MDO data/UI. Key features include an interactive Leaflet.js map for childcare and pediatricians, component-based CSS with custom properties, and a mobile-first responsive design approach. Core functionality is encapsulated within a `ChildcareDirectory` class.

## Data Management
The application manages data through five local JSON datasets (`centers.json`, `pediatricians.json`, `dentists.json`, `therapists.json`, `mdo.json`) for directory listings. User favorites are stored in a PostgreSQL database. All filtering and search operations are performed client-side using JavaScript, and filter states are synchronized with the URL hash for shareable views.

## User Interface Design
The design system features a consistent, playful aesthetic with a sunny color palette (yellow, sky blue, teal accents) and Google Fonts (Poppins, Inter). It prioritizes accessibility (WCAG AA compliance) with semantic HTML and ARIA labels. Interactive elements include modal windows for details, pill-style filter buttons, and icon-based tab navigation.

## Search and Filtering System
The system offers comprehensive filtering capabilities specific to each directory (e.g., location, age range, program type for childcare; specialty, insurance for pediatricians and dentists). It includes fuzzy search functionality with debounced input and real-time updates, along with directory-aware sorting.

## Performance Optimizations
Optimizations include debounced search inputs, efficient rendering of filtered results, and cache busting for JavaScript files to ensure optimal performance.

## Database Schema
The PostgreSQL database includes `users` (id, email, firstName, lastName, profileImageUrl), `sessions` (for Express sessions), and `favorites` (userId, directory, listingId) tables.

# External Dependencies

## Third-Party Services
- **Replit Auth**: OpenID Connect provider for user authentication.
- **Leaflet.js**: JavaScript library for interactive maps using OpenStreetMap tiles.
- **Google Fonts**: Provides Poppins and Inter font families.
- **Schema.org**: Structured data markup for SEO.

## Backend Dependencies
- **Node.js & TypeScript**: Runtime and type system.
- **Express**: Web framework.
- **Drizzle ORM**: Type-safe PostgreSQL database operations.
- **Passport.js**: Authentication middleware.
- **tsx**: TypeScript execution for development.

## Data Sources
- **Local JSON Datasets**: `data/centers.json`, `data/pediatricians.json`, `data/dentists.json`, `data/therapists.json`, `data/mdo.json`.
- **Static Asset Storage**: Local image assets in `assets/` directory.