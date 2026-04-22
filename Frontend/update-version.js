const fs = require('fs');
const packageJson = require('./package.json');

const versionData = {
  version: packageJson.version
};

fs.writeFileSync('./src/assets/version.json', JSON.stringify(versionData, null, 2));
