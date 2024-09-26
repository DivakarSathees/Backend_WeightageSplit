const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');
const readline = require('readline');
const decompress = require("decompress");
const AdmZip = require("adm-zip");




// Function to extract a zip file
function extractZip(zipFilePath, destinationFolder) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: destinationFolder }))
      .on('finish', () => resolve())
      .on('error', (err) => reject(err));
  });
}

// function decompress(zipFilePath, dist){
//   return
// }

// Function to read the contents of a folder
async function readFolderContents(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

// Function to read the contents of a file
async function readFileContents(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


// Function to read the contents of a file line by line and store in an array
function readAndStoreEchoStatements(filePath) {
    console.log("bye"+filePath);
  return new Promise((resolve, reject) => {
    const echoStatements = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });
    console.log(rl);

    rl.on('line', (line) => {
        console.log("555"+line.startsWith(' '));
      if (line.startsWith('    echo ') && line.endsWith('FAILED";')) {
        echoStatements.push(line.substring(10,line.length - 9)); // Remove "echo " prefix
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

function createJsonObject(echoStatements) {
    const totalWeightage = 1.0;
    const weightagePerStatement = totalWeightage / echoStatements.length;
  
    const jsonObject = {
      evaluation_type: 'NUnit',
      testcases: [],
      testcase_run_command: 'sh /home/coder/project/workspace/nunit/run.sh',
      testcase_path: '/home/coder/project/workspace/nunit',
    };
  
    for (const echoStatement of echoStatements) {
      jsonObject.testcases.push({
        name: echoStatement,
        weightage: weightagePerStatement, // Format weightage to 2 decimal places
      });
    }
  
    return jsonObject;
  }
  async function extractZip(zipFilePath, destinationFolder) {
    await decompress(zipFilePath, destinationFolder)
  .then((files) => {
    console.log(files);
  })
  .catch((error) => {
    console.log(error);
  });
  }


async function processRunShFile(runShFilePath) {
  try {
    // console.log("hai"+runShFilePath)
    const echoStatements = await readAndStoreEchoStatements(runShFilePath);

    console.log('Stored echo statements:');
    echoStatements.forEach((echoStatement, index) => {
      console.log(`Variable ${index + 1}: ${echoStatement}`);
    });
    const jsonObject = createJsonObject(echoStatements);

    // Convert JSON object to a string and pretty-print it
    const jsonString = JSON.stringify(jsonObject, null, 2);
    console.log(jsonString);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function processZipFile(zipFilePath) {
  try {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo("dist");


  //  await decompress(zipFilePath, "dist")
  // .then((files) => {
  //   console.log(files);
  // })
  // .catch((error) => {
  //   console.log(error);
  // });

  
  // await decompress(zipFilePath, "extractionFolder");
  // await extractZip(zipFilePath, 'dist');

    const extractionFolder = path.join(__dirname, 'dist');


    const nunitFolderPath = path.join(extractionFolder, 'eventcricket', 'nunit');
    const nunitFolderContents = await readFolderContents(nunitFolderPath);

    const runShFilePath = path.join(nunitFolderPath, 'run.sh');
    const runShFileContents = await readFileContents(runShFilePath);

    

    return runShFilePath;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}


// Usage example
const zipFilePath = 'D:/virtusa dotnet/angular/eventcricket.zip';
processZipFile(zipFilePath)
  .then((runShFilePath) => {
    const runShFilePath1 = runShFilePath;
    processRunShFile(runShFilePath1);

  })
  .catch((error) => {
    console.error('Error in processing zip file:', error);
  });
