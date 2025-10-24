const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default'
  });

  mainWindow.loadFile('src/index.html');
  
  // Development: Open DevTools
  // mainWindow.webContents.openDevTools();
}

// Create menu template
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Event',
        accelerator: 'CmdOrCtrl+N',
        click: () => mainWindow.webContents.send('menu-new-event')
      },
      { type: 'separator' },
      {
        label: 'Export Events',
        click: () => mainWindow.webContents.send('menu-export-events')
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// IPC Handlers
ipcMain.handle('save-event', async (event, eventData) => {
  try {
    const events = await loadEvents();
    events.push({
      id: Date.now().toString(),
      ...eventData,
      createdAt: new Date().toISOString()
    });
    await saveEvents(events);
    return { success: true, events };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-events', async () => {
  return await loadEvents();
});

ipcMain.handle('delete-event', async (event, eventId) => {
  try {
    const events = await loadEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    await saveEvents(filteredEvents);
    return { success: true, events: filteredEvents };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

async function loadEvents() {
  try {
    const data = await fs.readFile('events.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveEvents(events) {
  await fs.writeFile('events.json', JSON.stringify(events, null, 2));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});