# Overview

The Birmingham Childcare Directory is a bright, playful, mobile-first web application designed to help parents find quality childcare options across the Birmingham, Alabama metro area. Built entirely with vanilla HTML, CSS, and JavaScript, this single-page application provides a comprehensive directory of 31 real childcare centers from across Birmingham, Homewood, Vestavia Hills, Mountain Brook, and Hoover with advanced filtering, smart search capabilities, collapsible filter interface, and accessible design. The application emphasizes user experience with a modern, friendly aesthetic inspired by kids' libraries and features a sunny color palette (#FFB703 primary yellow, #8ECAE6 sky blue, #219EBC teal accents) with rounded components and playful iconography. The logo features the iconic Vulcan statue silhouette, representing Birmingham's proud heritage.

**Status**: Fully functional and deployed with real data. The website is running successfully with 31 verified Birmingham-area childcare centers and all features implemented including search, filtering, collapsible filters, modal details, and form submission functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application follows a single-page application (SPA) architecture built with vanilla web technologies:

- **Single HTML File**: All UI sections are contained within `index.html`, using anchor-based navigation for different sections
- **Component-Based CSS**: Modular CSS architecture with CSS custom properties (variables) for consistent theming and responsive design
- **Class-Based JavaScript**: Core functionality encapsulated in a `ChildcareDirectory` class that manages state, filtering, and rendering
- **Mobile-First Responsive Design**: Progressive enhancement approach starting with mobile layouts and enhancing for larger screens

## Data Management
- **Static JSON Data Store**: Childcare center data stored in `data/centers.json` with a well-defined schema including location, programs, accreditations, and operational details
- **Client-Side Filtering**: All filtering and search operations performed in-browser using JavaScript array methods and fuzzy search algorithms
- **URL State Management**: Filter states and search parameters encoded in URL hash for shareable filtered views

## User Interface Design
- **Design System**: Consistent color palette using CSS custom properties with sunny yellow primary (#FFB703), sky blue and teal accents
- **Typography**: Google Fonts integration with Poppins for headings and Inter for body text
- **Accessibility**: WCAG AA compliance with semantic HTML, ARIA labels, keyboard navigation, and sufficient color contrast
- **Interactive Elements**: Modal windows for detailed center information, pill-style filter buttons, and responsive card layouts

## Search and Filtering System
- **Multi-Criteria Filtering**: Support for location, age range, program type, accreditation, hours, and subsidy acceptance
- **Fuzzy Search**: Search across center names, neighborhoods, and program descriptions with debounced input handling
- **Real-Time Updates**: Immediate filter application with URL synchronization for bookmarkable results
- **Sort Functionality**: Multiple sorting options including alphabetical and distance-based ordering

## Performance Optimizations
- **Debounced Search**: Input debouncing to prevent excessive filtering operations during typing
- **Lazy Loading**: Efficient rendering of filtered results with minimal DOM manipulation
- **Responsive Images**: Placeholder images optimized for different screen sizes

# External Dependencies

## Third-Party Services
- **Google Fonts**: Typography service providing Poppins and Inter font families with preconnect optimization for performance
- **Schema.org**: Structured data markup for SEO optimization and search engine visibility

## Development Dependencies
- **No Build Process**: Pure vanilla implementation requiring no compilation, bundling, or preprocessing steps
- **Static File Hosting**: Designed for deployment on any static web hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Data Sources
- **Local JSON Dataset**: Self-contained childcare center database stored in `data/centers.json`
- **Manual Data Management**: Content updates performed through direct JSON file editing
- **Static Asset Storage**: Local image assets stored in `assets/` directory for center photos and logos

## Browser Requirements
- **Modern Browser Support**: ES6+ JavaScript features requiring modern browser compatibility
- **CSS Grid and Flexbox**: Advanced layout techniques for responsive design
- **Fetch API**: Modern HTTP request handling for JSON data loading