const fs = require('fs');
const readline = require('readline');

function readAndStoreEchoStatements(filePath) {
  console.log("shecho"+filePath);
  
    return new Promise((resolve, reject) => {
      const echoStatements = [];
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
      });
  
      rl.on('line', (line) => {
        if (line.startsWith('    echo ') && line.endsWith('FAILED";')) {
          echoStatements.push(line.substring(10, line.length - 9));
        }
      });
  
      rl.on('close', () => {
        resolve(echoStatements);
      });
  
      rl.on('error', (err) => {
        reject(err);
      });
    });
  }

  module.exports = { readAndStoreEchoStatements };