const path = require('path');

module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: 
      {
        authors: "Karol Ambroziński",
        setupIcon: path.resolve(__dirname, 'resources', 'logo.ico'),
        iconUrl: path.resolve(__dirname, 'resources', 'logo.ico'),
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