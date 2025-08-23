const path = require('path');

module.exports = 
{
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: 
      {
        authors: "Karol Ambroziński",
        setupIcon: path.resolve(__dirname, 'resources', 'logo.ico'),
        iconUrl: path.resolve(__dirname, 'resources', 'logo.ico'),
      }
    },
    {
      name: '@electron-forge/maker-zip'
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.resolve(__dirname, 'resources', 'logo.png'),
          maintainer: 'Karol Ambroziński',
          homepage: 'https://github.com/zero-jedynkowy'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/zero-jedynkowy'
        }
      }
    },
    {
      name: '@electron-forge/maker-flatpak',
      config: {
        options: {
          categories: ['Science'],
          mimeType: ['video/h264']
        }
      }
    }
  ],
  packagerConfig: 
  {
    name: "TempPress App",
    asar: true,
    icon: path.resolve(__dirname, 'resources', 'logo')
  }
};