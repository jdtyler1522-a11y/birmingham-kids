# Birmingham Childcare Directory

A bright, playful, mobile-first childcare directory website for the Birmingham, Alabama metro area built with vanilla HTML, CSS, and JavaScript.

## Features

- **Comprehensive Directory**: Browse 15+ childcare centers across Birmingham metro
- **Advanced Filtering**: Filter by location, age range, program type, accreditation, and hours
- **Smart Search**: Fuzzy search across names, neighborhoods, and program descriptions
- **Mobile-First Design**: Responsive layout optimized for all devices
- **Interactive Details**: Modal windows with complete center information
- **Accessible**: WCAG AA compliant with keyboard navigation and screen reader support
- **SEO Optimized**: Schema.org structured data and semantic HTML
- **URL Sharing**: Shareable filtered views via URL hash parameters

## Project Structure

```
├── index.html          # Main HTML file with all sections
├── styles.css          # Complete CSS styling with responsive design
├── app.js              # JavaScript functionality and filtering
├── data/
│   └── centers.json    # Childcare center dataset (editable)
├── assets/
│   ├── logo.svg        # Site logo
│   └── placeholder*.jpg # Sample images for centers
└── README.md           # This file
```

## Data Management

### Adding/Editing Childcare Centers

Edit the `data/centers.json` file to add or modify childcare centers. Each center should follow this schema:

```json
{
  "id": "unique-identifier",
  "name": "Center Name",
  "address": "123 Street Address",
  "city": "City Name",
  "zip": "12345",
  "neighborhood": "Neighborhood Name",
  "phone": "(205) 555-0123",
  "email": "contact@center.com",
  "website": "https://center.com",
  "type": ["Center-based", "In-Home", "Faith-based"],
  "faithBased": true/false,
  "agesServed": ["Infant", "Toddler", "Preschool", "Pre-K", "After-School"],
  "programs": ["Full-time", "Part-time", "After-school"],
  "accreditations": ["AL DHR Licensed", "NAEYC", "First Class Pre-K"],
  "acceptsSubsidy": true/false,
  "firstClassPreK": true/false,
  "qris": "3-star" or null,
  "hours": {"open": "07:00", "close": "18:00"},
  "tuitionRangeMonthlyUSD": [750, 1200],
  "openingsNow": true/false,
  "waitlist": true/false,
  "latitude": 33.5007,
  "longitude": -86.7902,
  "blurb": "Brief description of the center",
  "photos": ["assets/placeholder1.jpg"]
}
```

### Available Cities
- Birmingham
- Homewood
- Mountain Brook
- Hoover
- Vestavia Hills
- Trussville
- Alabaster
- Pelham
- Irondale
- Gardendale

### Age Categories
- **Infant**: 0-12 months
- **Toddler**: 1-3 years
- **Preschool**: 3-5 years
- **Pre-K**: Pre-kindergarten programs
- **After-School**: School-age care

### Program Types
- **Center-based**: Traditional daycare centers
- **In-Home**: Home-based childcare
- **Faith-based**: Religious-affiliated programs

### Accreditation Types
- **AL DHR Licensed**: Alabama Department of Human Resources licensed
- **NAEYC**: National Association for the Education of Young Children
- **First Class Pre-K**: Alabama's state-funded pre-K program
- **AMI Montessori**: Association Montessori Internationale
- **QRIS**: Quality Rating and Improvement System (with star ratings)

## Customization

### Changing Colors

The color palette is defined in CSS custom properties in `styles.css`:

```css
:root {
  --primary: #FFB703;      /* Sunny yellow */
  --accent-1: #8ECAE6;     /* Sky blue */
  --accent-2: #219EBC;     /* Deep teal */
  --accent-3: #FB8500;     /* Orange */
  --neutral-bg: #F7F7F7;   /* Light gray background */
  --neutral-text: #1F2937; /* Dark text */
}
```

### Changing Fonts

Update the Google Fonts link in `index.html` and the font variables in `styles.css`:

```css
:root {
  --font-heading: 'Poppins', sans-serif;  /* Rounded sans for headings */
  --font-body: 'Inter', sans-serif;       /* Humanist sans for body text */
}
```

### Adding Filter Options

1. Update the dropdown HTML in `index.html`
2. Add the new filter logic in `app.js` in the `applyFilters()` method
3. Update the `updateDropdownLabel()` method for new filter types

### Modifying Badges

Badge styles are defined in `styles.css` with classes like `.badge-openings`, `.badge-subsidy`, etc. Add new badge types by:

1. Creating CSS classes for new badge types
2. Updating the `generateBadges()` method in `app.js`

## Deployment

### Hosting on Replit (Easiest)

This project is ready to deploy on Replit:

1. Click the "Deploy" button at the top of your Replit workspace
2. Configure your deployment settings
3. The site will be live with a custom domain option
4. Database and authentication are included

### Hosting on Vercel via GitHub

For serverless deployment to Vercel:

1. See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for complete step-by-step instructions
2. Push your code to GitHub
3. Connect your GitHub repo to Vercel
4. Deploy automatically on every git push

**Key features of Vercel deployment:**
- Serverless functions for API routes
- Automatic HTTPS and CDN
- Preview deployments for branches
- Free tier available

### Other Hosting Options

The site can also be hosted on:
- GitHub Pages (static only, no authentication)
- Netlify (serverless functions supported)
- Any static hosting service

For static-only deployment, simply upload the HTML, CSS, JS, and data files.

### Production Considerations

Before going live:

1. Replace placeholder images with real center photos
2. Update contact email in `index.html` and `app.js` 
3. Verify all center information is accurate and up-to-date
4. Test on multiple devices and browsers
5. Consider adding analytics tracking
6. Set up form handling for center submissions

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management in modals
- High contrast color ratios (WCAG AA)
- Screen reader compatible

## Performance

- Vanilla JavaScript (no framework overhead)
- Optimized CSS with efficient selectors
- Lazy loading considerations built in
- Minimal external dependencies (only Google Fonts)
- Client-side filtering for instant results

## License

This project is provided as-is for community use. Feel free to modify and distribute as needed for your local childcare directory needs.

## Support

For questions about setup or customization, contact the development team or refer to the inline code comments for technical details.