# Overview

Birmingham Kids is a bright, playful, mobile-first tri-directory web application designed to help parents find quality childcare options, pediatrician providers, and pediatric dentists across the Birmingham, Alabama metro area. The application features a modern Node.js/Express backend with user authentication and a vanilla JavaScript frontend. It provides three comprehensive directories: (1) **278 verified childcare centers** with advanced filtering and collapsible filter interface, (2) **77 pediatrician providers** with specialty and insurance-based filtering, and (3) **55 pediatric dentists** with location and rating information. The application emphasizes user experience with a modern, friendly aesthetic inspired by kids' libraries and features a sunny color palette (#FFB703 primary yellow, #8ECAE6 sky blue, #219EBC teal accents) with rounded components and playful iconography. The logo features the iconic Vulcan statue silhouette, representing Birmingham's proud heritage.

**Landing Page**: The site opens with a beautiful landing page featuring a happy child photo with decorative blobs, hero text "Raising Kids in Birmingham Just Got Easier", and three directory selection cards.

**User Authentication**: Users can sign in with Replit Auth to save favorite listings across devices. Favorites are stored in a PostgreSQL database and synchronized across all sessions.

**Status**: Fully functional with real verified data. All three directories are running successfully with tab-based navigation, search, filtering, modal details, form submission functionality, authenticated favorites system, and landing page navigation.

# Recent Changes

## October 7, 2025 - Interactive Map View
- **Added map view for Childcare and Pediatricians**: Implemented interactive Leaflet.js map with markers showing all filtered listings (dentists excluded as they lack coordinates)
- **List/Map view toggle**: Added toggle buttons to switch between traditional list view and map view, with icons for clear visual distinction
- **Map markers with popups**: Each marker shows listing name, location, and "View Details" link that opens the full listing modal
- **Filter synchronization**: Map automatically updates markers when filters are applied, maintaining consistency between views
- **Auto-fit bounds**: Map automatically zooms to show all visible markers based on current filter results
- **View state management**: Display logic properly respects current view mode, ensuring list stays hidden in map view and vice versa
- **Empty state handling**: Map clears markers when no results match filters, preventing stale data display

## October 3, 2025 - Authentication System
- **Migrated to Node.js/Express backend**: Replaced Python simple HTTP server with Node.js/Express for production-ready server
- **Implemented Replit Auth**: Full user authentication system with secure session management using Replit's built-in auth
- **Created PostgreSQL database**: Set up database with three tables (users, sessions, favorites) for storing user accounts and favorites
- **Database-backed favorites**: Favorites now persist in the database and sync across all devices when user is logged in
- **Added login/logout UI**: Professional navigation bar with "Sign In" button and user dropdown menu
- **Security hardening**: Implemented SameSite cookies, removed wide-open CORS, added duplicate favorites handling
- **Rebranded to "Birmingham Kids"**: Updated all references from "Birmingham Family Resources" to "Birmingham Kids"
- **Updated landing page**: New hero copy "Raising Kids in Birmingham Just Got Easier" with Magic City reference
- **Added professional navigation**: Sticky navigation bar with Home, Childcare, Pediatricians, and Dentists links
- **Cache version update**: Set to v=2025-10-03-auth for all assets

## Earlier October 3, 2025
- **Created new landing page**: Added a beautiful gradient landing page with directory selection cards featuring the Vulcan logo, hero text ("Your Family's Journey to Quality Care Starts Here"), and three clickable directory cards (Childcare, Pediatricians, Dentists)
- **Added navigation system**: Implemented JavaScript navigation to show/hide the landing page when switching between landing and directory views; added "Home" button in directory navigation tabs to return to landing page
- **Enhanced visual hierarchy**: Landing cards feature color-coded top borders (yellow/orange for childcare, blue/teal for pediatricians, orange for dentists), icon styling, and smooth hover animations with lift effect
- **Mobile-responsive landing page**: Added media queries for mobile devices with adjusted typography, logo sizing, and single-column card layout
- **Updated cache versions**: Set styles.css to v2025-10-03-landing, app.js to v2025-10-03-landing for cache busting
- **Added favorite/star functionality**: Visitors can now mark listings as favorites by clicking star icons in the top-right corner of each card; favorites persist in localStorage separately for each directory
- **Expanded dentist directory**: Added 36 additional pediatric dentists from new CSV data (now 55 total unique dentists, deduplicated)
- **Added third directory - Pediatric Dentists**: Created new dentist directory with verified pediatric dental practices extracted from CSV data
- **Updated to tri-directory architecture**: Added tooth icon tab for dentists, updated directory-manager.js and app.js to handle three directories (childcare, pediatricians, dentists)
- **Created dentist card template**: Added createDentistCard() function with specialty badges, ratings, reviews, and contact information
- **Fixed filter visibility**: Hidden childcare-only quick filters (Openings Now, Accepts Subsidy, First Class Pre-K) when in pediatrician or dentist mode
- **Significantly expanded pediatrician directory**: Added 36 new providers including individual doctors and specialty practices (now 77 total providers, up from 41)
- **Fixed pediatrician rendering bugs**: Added null safety checks throughout app.js to prevent crashes when DOM elements don't exist in pediatrician mode
- **Fixed sorting compatibility**: Updated `applySort()` method to handle both childcare data structures (name, hours.open/close) and pediatrician structures (displayName, string hours)
- **Improved toggle methods**: Added null checks in `toggleFiltersPanel()` and `updateActiveFiltersCount()` to prevent null reference errors
- **Cache busting**: Updated cache version to v=2025-10-03-dentists-v2 for app.js and v=2025-10-03-dentists for directory-manager.js

## Previous Updates
- Expanded childcare directory from 52 to 278 verified Birmingham metro centers
- Expanded pediatrician directory from 36 to 77 providers (including individual doctors and specialty practices)
- Implemented early directory detection in app.js to avoid script loading race conditions
- Automated duplicate detection and data processing with Python scripts

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
The application uses a Node.js/Express backend with TypeScript:

- **Express Server**: Production-ready Node.js server running on port 5000 with static file serving
- **Replit Auth Integration**: Secure authentication using Replit's OpenID Connect (OIDC) provider
- **PostgreSQL Database**: Neon-backed PostgreSQL database with Drizzle ORM for type-safe database operations
- **Session Management**: Secure session storage in PostgreSQL using connect-pg-simple with SameSite cookies
- **API Routes**: RESTful API endpoints for authentication (`/api/login`, `/api/logout`) and favorites (`/api/favorites`)
- **Security**: SameSite=lax cookies, httpOnly, secure flags, same-origin request enforcement

## Frontend Architecture
The application follows a tri-directory single-page application (SPA) architecture built with vanilla web technologies:

- **Single HTML File**: All UI sections contained within `index.html`, using tab-based navigation to switch between Childcare, Pediatricians, and Dentists directories
- **Authentication Manager**: `auth.js` handles user authentication state, login/logout, and favorites synchronization
- **Directory Manager**: `directory-manager.js` handles switching between childcare, pediatrician, and dentist data/UI dynamically
- **Interactive Map View**: Leaflet.js integration for childcare and pediatricians with list/map toggle, auto-updating markers, and popup modals
- **Component-Based CSS**: Modular CSS architecture with CSS custom properties (variables) for consistent theming and responsive design
- **Class-Based JavaScript**: Core functionality in `ChildcareDirectory` class that manages state, filtering, rendering, and map views for all three directories
- **Mobile-First Responsive Design**: Progressive enhancement starting with mobile layouts and enhancing for larger screens

## Data Management
- **Three JSON Data Stores**: 
  - `data/centers.json` - 278 childcare centers with locations, programs, accreditations, operational details
  - `data/pediatricians.json` - 77 pediatrician providers with specialties, insurance acceptance, locations
  - `data/dentists.json` - 55 pediatric dentists with specialties, ratings, reviews, contact information
- **Database-Backed Favorites**: User favorites stored in PostgreSQL with userId, directory, and listingId
- **Client-Side Filtering**: All filtering and search operations performed in-browser using JavaScript array methods and fuzzy search algorithms
- **URL State Management**: Filter states and search parameters encoded in URL hash for shareable filtered views
- **Directory Detection**: Early detection logic in app.js sets `window.ACTIVE_DIRECTORY` before class initialization to ensure correct data file loads

## Data Structure Differences
The application handles structural differences between childcare and pediatrician data:
- **Name fields**: Childcare uses `name`, pediatricians use `displayName`
- **Hours format**: Childcare hours is object `{open, close}`, pediatrician hours is string
- **Null safety**: All methods include checks for DOM elements that may not exist in one directory vs the other

## User Interface Design
- **Design System**: Consistent color palette using CSS custom properties with sunny yellow primary (#FFB703), sky blue (#8ECAE6) and teal (#219EBC) accents
- **Typography**: Google Fonts integration with Poppins for headings and Inter for body text
- **Accessibility**: WCAG AA compliance with semantic HTML, ARIA labels, keyboard navigation, and sufficient color contrast
- **Interactive Elements**: Modal windows for detailed information, pill-style filter buttons, and responsive card layouts
- **Tab Navigation**: Icon-based tabs (home icon for Childcare, heartbeat icon for Pediatricians, tooth icon for Dentists)

## Search and Filtering System
- **Childcare Filters**: Location, age range, program type, accreditation, hours, subsidy acceptance, First Class Pre-K
- **Pediatrician Filters**: Location, specialty, insurance acceptance
- **Dentist Filters**: Location-based search with specialty and rating display
- **Fuzzy Search**: Search across center/provider names, neighborhoods, and relevant details with debounced input handling
- **Real-Time Updates**: Immediate filter application with URL synchronization for bookmarkable results
- **Sort Functionality**: Directory-aware sorting handling different data structures

## Performance Optimizations
- **Debounced Search**: Input debouncing to prevent excessive filtering operations during typing
- **Lazy Loading**: Efficient rendering of filtered results with minimal DOM manipulation
- **Cache Busting**: Version parameters on JavaScript files to prevent stale browser caching

## Database Schema
- **users**: Stores user accounts with id, email, firstName, lastName, profileImageUrl
- **sessions**: Stores Express sessions for Replit Auth (managed by connect-pg-simple)
- **favorites**: Stores user favorites with userId, directory, listingId (foreign key to users table)

# External Dependencies

## Third-Party Services
- **Replit Auth**: OpenID Connect authentication provider for secure user login
- **Leaflet.js**: Open-source JavaScript library for mobile-friendly interactive maps using OpenStreetMap tiles
- **Google Fonts**: Typography service providing Poppins and Inter font families with preconnect optimization for performance
- **Schema.org**: Structured data markup for SEO optimization and search engine visibility

## Backend Dependencies
- **Node.js & TypeScript**: Runtime and type system for backend development
- **Express**: Web framework for API routes and static file serving
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Passport.js**: Authentication middleware for Replit Auth
- **tsx**: TypeScript execution for development server

## Development Workflow
- **Development Server**: `npm run dev` starts the Express server with tsx (TypeScript execution)
- **Database Migrations**: `npm run db:push` to sync schema changes to database (use `--force` for data-loss warnings)
- **Database Studio**: `npm run db:studio` to open Drizzle Studio for database inspection

## Data Sources
- **Local JSON Datasets**: 
  - Self-contained childcare database stored in `data/centers.json` (278 centers)
  - Self-contained pediatrician database stored in `data/pediatricians.json` (77 providers)
  - Self-contained pediatric dentist database stored in `data/dentists.json` (55 dentists)
- **Manual Data Management**: Content updates performed through direct JSON file editing or automated Python scripts
- **Static Asset Storage**: Local image assets stored in `assets/` directory for logos and photos

## Browser Requirements
- **Modern Browser Support**: ES6+ JavaScript features requiring modern browser compatibility
- **CSS Grid and Flexbox**: Advanced layout techniques for responsive design
- **Fetch API**: Modern HTTP request handling for JSON data loading
