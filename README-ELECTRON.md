# GCS Client Desktop Application

This is an Electron-based desktop application that packages your React frontend and Express backend into a single distributable app.

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup
1. Install dependencies in all directories:
```bash
# Install root dependencies (Electron)
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies  
cd server && npm install && cd ..
```

### Development Mode
Run the app in development mode (with hot reload):
```bash
npm run electron-dev
```

This will:
- Start the Express server on port 8080
- Start the Vite dev server on port 5173
- Launch Electron with dev tools enabled

## Building for Distribution

### Build the Application
```bash
npm run build
```

This will:
- Build the React app (`client/dist/`)
- Build the Express server (`server/dist/`)

### Create DMG for macOS
```bash
npm run dist:mac
```

This will create a DMG file in the `dist/` directory that you can distribute.

### Create for All Platforms
```bash
npm run dist
```

## How It Works

### Architecture
- **Frontend**: React app built with Vite
- **Backend**: Express server that runs locally within the Electron app
- **Desktop**: Electron wrapper that provides native desktop functionality

### In Development
- Vite dev server serves the React app with hot reload
- Express server runs separately for API calls
- Electron loads the Vite dev server URL

### In Production
- React app is built to static files
- Express server is compiled to JavaScript
- Electron starts the Express server internally and serves the static React files
- Everything runs locally - no external server needed

## Distribution

The built DMG file contains:
- Your React frontend
- Your Express backend
- Node.js runtime
- All dependencies

Users can install and run the app without needing:
- Node.js installed
- Any external servers
- Internet connection (except for your GCS API calls)

## Configuration

### App Details
Edit `package.json` to customize:
- `build.appId`: Your app identifier
- `build.productName`: Display name
- `build.dmg.title`: DMG title

### Icons
Add app icons in the `build/` directory:
- `icon.icns` for macOS
- `icon.ico` for Windows
- `icon.png` for Linux

## Troubleshooting

### Port Conflicts
- Client dev server: port 5173
- Server: port 8080
- Make sure these ports are available

### Build Issues
- Ensure all dependencies are installed in client/, server/, and root
- Check that TypeScript compiles without errors
- Verify environment variables are set correctly 