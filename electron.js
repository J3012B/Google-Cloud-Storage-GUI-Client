const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
// Treat any value other than explicit "production" as development.
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;
let serverProcess;

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, 'client/dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const startServer = () => {
  if (!isDev) {
    // In production, start the built server
    const serverPath = path.join(__dirname, 'server/dist/server.js');
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, 'server'),
      env: { ...process.env, NODE_ENV: 'production' }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });
  }
  // In development, server is started separately via npm script
};

const stopServer = () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
};

// App event listeners
app.whenReady().then(() => {
  startServer();
  
  // Give server a moment to start
  setTimeout(() => {
    createWindow();
  }, isDev ? 0 : 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
}); 