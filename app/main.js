const {app, BrowserWindow, ipcMain, systemPreferences, nativeTheme} = require('electron/main')
const path = require('node:path')
const { SerialPort } = require('serialport') 
let settings = require('electron-settings');
const YAML = require('yaml')
var fs = require('fs')

console.log(settings)

const createWindow = () => 
{
    const win = new BrowserWindow(
    {
        width: 700,
        height: 600,
        titleBarStyle: 'hidden',
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: 
        {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    console.log(settings.file())
    win.loadFile('index.html')
    // win.openDevTools()
}

app.whenReady().then(() => 
{
    // SERIALPORT
    ipcMain.handle('serialport.list', () =>
    {
        return SerialPort.list()
    })
    
    // SETTINGS
    ipcMain.handle('settings.hasSync', (event, {id}) => 
    {
        console.log(id)
        return settings.hasSync()
    })

    ipcMain.handle('settings.getSync', (event, {id}) => 
    {
        return settings.getSync()
    })

    ipcMain.handle('settings.setSync', (event, {val}) => 
    {
        console.log(val)
        return settings.setSync(val)
    })

    ipcMain.handle('settings.isDarkMode', () => 
    {
        let isDarkMode = null
        if (process.platform === 'darwin') 
        {
            isDarkMode = systemPreferences.isDarkMode()
            console.log('Ciemny motyw:', isDarkMode)
        }
        else
        {
            isDarkMode = nativeTheme.shouldUseDarkColors
        }
        return isDarkMode
    })

    ipcMain.handle('settings.loadLanguage', (event, {lang}) => 
    {
        const file = fs.readFileSync('./' + lang + '.yml', 'utf8')
        return YAML.parse(file)
    })
    
    
    createWindow()
    // app.on('activate', () => 
    // {
    //     if (BrowserWindow.getAllWindows().length === 0) 
    //     {
    //         createWindow()
    //     }
    // })
})

app.on('window-all-closed', () => 
{
    if (process.platform !== 'darwin') 
    {
        app.quit()
    }
})