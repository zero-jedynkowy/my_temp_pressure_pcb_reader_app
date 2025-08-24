const { version } = require('os');
const path = require('path');

module.exports = 
{
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: 
      {
        name: "TempPress",
        authors: "Karol Ambroziński",
        description: "App for reading temperature and pressure from the custom PCB",
        version: '1.0.0',
        setupIcon: path.resolve(__dirname, 'resources', 'logo.ico'),
        iconUrl: path.resolve(__dirname, 'resources', 'logo.ico'),
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          name: "TempPress",
          productName: "TempPress",
          icon: path.resolve(__dirname, 'resources', 'logo.png'),
          maintainer: 'Karol Ambroziński',
          homepage: 'https://github.com/zero-jedynkowy'
        }
      }
    },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {
    //     options: {
    //       homepage: 'https://github.com/zero-jedynkowy'
    //     }
    //   }
    // },
    // {
    //   name: '@electron-forge/maker-flatpak',
    //   config: {
    //     options: {
    //       categories: ['Science'],
    //       mimeType: ['video/h264']
    //     }
    //   }
    // }
  ],
  packagerConfig: 
  {
    name: "TempPress",
    executableName: "temp-press-app",
    asar: true,
    icon: path.resolve(__dirname, 'resources', 'logo')
  }
};