# GIS Application - Complete Setup Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** for version control
- **Google Maps API Key** - [Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key)

## Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd app

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Google Maps API key to .env
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Start development server
npm run dev
```

## Package Installation Guide

### 1. Core React Dependencies

```bash
# React ecosystem
npm install react@^18.3.1 react-dom@^18.3.1

# Routing
npm install react-router-dom@^7.9.1
```

### 2. State Management (Redux)

```bash
# Redux Toolkit (modern Redux)
npm install @reduxjs/toolkit@^2.9.0 react-redux@^9.2.0
```

**Why Redux Toolkit?**
- Simplified Redux setup with less boilerplate
- Built-in Immer for immutable updates
- Integrated with Redux DevTools
- Includes createAsyncThunk for async operations

### 3. UI Component Libraries

```bash
# Material-UI (Primary UI library)
npm install @mui/material@^7.3.2 @mui/icons-material@^7.3.2 @mui/lab@^7.0.0-beta.16

# Chakra UI (Secondary UI library)
npm install @chakra-ui/react@^3.25.0

# Emotion (Required for Material-UI)
npm install @emotion/react@^11.14.0 @emotion/styled@^11.14.1

# Animation library
npm install framer-motion@^12.23.12

# Icon libraries
npm install lucide-react@^0.542.0 react-icons@^5.5.0
```

### 4. GIS and Mapping

```bash
# Google Maps integration
npm install @react-google-maps/api@^2.20.7

# Marker clustering for performance
npm install @googlemaps/markerclusterer@^2.6.2
```

**Google Maps Setup:**
1. Get API key from Google Cloud Console
2. Enable Maps JavaScript API
3. Enable Places API (for search functionality)
4. Enable Elevation API (for terrain data)

### 5. Data Visualization

```bash
# Chart.js ecosystem
npm install chart.js@^4.5.0 react-chartjs-2@^5.3.0 chartjs-plugin-zoom@^2.2.0

# ApexCharts
npm install apexcharts@^5.3.4 react-apexcharts@^1.7.0

# Recharts (React-specific charting)
npm install recharts@^3.1.2
```

### 6. File Processing

```bash
# CSV parsing
npm install papaparse@^5.5.3

# Excel file handling
npm install xlsx@^0.18.5

# GeoJSON conversion
npm install @tmcw/togeojson@^7.1.2

# ZIP file handling
npm install jszip@^3.10.1 @zip.js/zip.js@^2.8.2

# File download utility
npm install file-saver@^2.0.5
```

### 7. Utility Libraries

```bash
# Date manipulation
npm install dayjs@^1.11.18

# UI components
npm install @radix-ui/react-tabs@^1.1.13 @radix-ui/react-tooltip@^1.2.8
```

### 8. Development Dependencies

```bash
# Build tool
npm install --save-dev vite@^7.1.2 @vitejs/plugin-react@^5.0.2

# Linting
npm install --save-dev eslint@^9.35.0 @eslint/js@^9.33.0
npm install --save-dev eslint-plugin-react@^7.37.5 eslint-plugin-react-hooks@^5.2.0
npm install --save-dev eslint-plugin-react-refresh@^0.4.20

# CSS framework
npm install --save-dev tailwindcss@^4.1.12 autoprefixer@^10.4.21 postcss@^8.5.6

# Type definitions (if using TypeScript)
npm install --save-dev @types/react@^19.1.10 @types/react-dom@^19.1.7

# Global utilities
npm install --save-dev globals@^16.3.0
```

## Environment Configuration

### 1. Create Environment File

```bash
# Create .env file in project root
touch .env
```

### 2. Environment Variables

```env
# .env file content
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:3001/api
```

**Environment Variables Explained:**
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `VITE_USE_MOCK`: Set to `true` for development mode (uses localStorage)
- `VITE_API_BASE_URL`: Backend API URL for production

### 3. Google Maps API Setup

1. **Go to Google Cloud Console**
2. **Create a new project** or select existing
3. **Enable APIs:**
   - Maps JavaScript API
   - Places API
   - Elevation API
   - Geocoding API
4. **Create credentials** (API Key)
5. **Restrict API key** (recommended for production)

## Project Structure Setup

### 1. Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### 2. Tailwind CSS Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. ESLint Configuration

```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

## Development Setup

### 1. Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

### 2. Git Configuration

```bash
# Initialize git repository
git init

# Create .gitignore
echo "node_modules/
dist/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*" > .gitignore
```

### 3. Default Login Credentials

The application comes with pre-configured users for development:

```javascript
// Default users (stored in localStorage during development)
const defaultUsers = [
  {
    username: "admin",
    password: "admin123",
    role: "Admin",
    permissions: {
      distance: true,
      polygon: true,
      elevation: true,
      infrastructure: true,
      userManagement: true
    }
  },
  {
    username: "manager1",
    password: "manager123",
    role: "Manager",
    permissions: {
      distance: true,
      polygon: true,
      elevation: false,
      infrastructure: true,
      userManagement: false
    }
  },
  {
    username: "user1",
    password: "user123",
    role: "Normal User",
    permissions: {
      distance: false,
      polygon: false,
      elevation: false,
      infrastructure: true,
      userManagement: false
    }
  }
];
```

## Running the Application

### 1. Development Mode

```bash
# Start development server
npm run dev

# Application will be available at:
# http://localhost:3000
```

### 2. Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

## Troubleshooting

### Common Issues

1. **Google Maps not loading:**
   - Check if API key is correctly set in .env
   - Verify API key has proper permissions
   - Check browser console for API errors

2. **Build errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for version conflicts in package.json

3. **Redux DevTools not working:**
   - Install Redux DevTools browser extension
   - Ensure development mode is enabled

4. **Styling issues:**
   - Check if Tailwind CSS is properly configured
   - Verify Material-UI theme provider is set up

### Performance Optimization

1. **Code Splitting:**
```javascript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const GISTools = lazy(() => import('./components/GISTools'));
```

2. **Bundle Analysis:**
```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-analyzer

# Analyze bundle
npm run build && npx vite-bundle-analyzer
```

## Deployment

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 2. Netlify Deployment

```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
```

### 3. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Additional Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Material-UI Documentation](https://mui.com/)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the project documentation
3. Check browser console for errors
4. Verify environment variables are set correctly

This setup guide provides everything needed to get the GIS application running in both development and production environments.