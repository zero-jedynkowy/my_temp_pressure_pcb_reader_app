const {app, BrowserWindow, nativeTheme} = require('electron/main')
const settings = require('electron-settings')

require('@electron/remote/main').initialize()

function createWindow () 
{
    const win = new BrowserWindow(
    {
        width: 800,
        // minHeight: 500,
        // resizable: false,
        height: 650,
        maximizable: false,
        transparent: true,
        frame: false,
        webPreferences: 
        {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })
    
    require('@electron/remote/main').enable(win.webContents)
    win.loadFile('index.html')
    win.settings = settings
    win.nativeTheme = nativeTheme
    win.webContents.openDevTools();
}

app.whenReady().then(() => 
{
    createWindow()

    app.on('activate', () => 
    {
        if (BrowserWindow.getAllWindows().length === 0) 
        {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => 
{
    if (process.platform !== 'darwin') 
    {
        app.quit()
    }
})