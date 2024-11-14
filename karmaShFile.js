const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { MongoClient, GridFSBucket } = require('mongodb');



async function karmaShFile(extractionFolder, dynamicFolderName, subfolderContents) {
    const dynamicFolderPath = path.join(extractionFolder, dynamicFolderName, 'karma');
    const filesInDynamicFolder = fs.readdirSync(dynamicFolderPath);
    const specFiles = filesInDynamicFolder.filter((fileName) => fileName.endsWith('.spec.ts'));
    const allKarmaTestNames = [];
    const filePath = path.join(extractionFolder, dynamicFolderName, 'karma', 'karma.sh');



    let scriptContent = `#!/bin/bash
export CHROME_BIN=/usr/bin/chromium
if [ ! -d "/home/coder/project/workspace/angularapp" ]
then
    cp -r /home/coder/project/workspace/karma/angularapp /home/coder/project/workspace/;
fi

if [ -d "/home/coder/project/workspace/angularapp" ]
then
    echo "project folder present"
    find /home/coder/project/workspace/angularapp -type f -name "*.spec.ts" -delete
    cp /home/coder/project/workspace/karma/karma.conf.js /home/coder/project/workspace/angularapp/karma.conf.js;
    cp /home/coder/project/workspace/karma/test.ts /home/coder/project/workspace/angularapp/src/test.ts;
    cp /home/coder/project/workspace/karma/tsconfig.spec.json /home/coder/project/workspace/angularapp/tsconfig.spec.json;
`;
return new Promise(async (resolve, reject) => {
// Iterate through each file in specFiles
for (const fileName of specFiles) {
const fileNameParts = fileName.split('.');
const folderName = fileNameParts[0];
const fileTypeName = fileNameParts[1];
const fileExtension = fileNameParts[2];
console.log("fileExtension: ", fileExtension);
console.log("folderName: ", folderName);
console.log("fileType: ", fileTypeName);
const filePath = path.join(dynamicFolderPath, fileName);
const fileContent = fs.readFileSync(filePath, 'utf8');

scriptContent += `    # checking for ${fileName} component\n`;
if (fileTypeName == 'component') {
  scriptContent += `    if [ -d "/home/coder/project/workspace/angularapp/src/app/components/${folderName.toLowerCase()}" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/components/${folderName.toLowerCase()}/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'service') {
  scriptContent += `    if [ -e "/home/coder/project/workspace/angularapp/src/app/services/${folderName}.${fileTypeName}.ts" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/services/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'pipe') {
  scriptContent += `    if [ -e "/home/coder/project/workspace/angularapp/src/app/pipes/${folderName}.${fileTypeName}.ts" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/pipes/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'directive') {
  scriptContent += `    if [ -e "/home/coder/project/workspace/angularapp/src/app/directives/${folderName}.${fileTypeName}.ts" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/directives/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'model') {
  scriptContent += `    if [ -e "/home/coder/project/workspace/angularapp/src/app/models/${folderName}.${fileTypeName}.ts" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/models/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'guard') {
  scriptContent += `    if [ -e "/home/coder/project/workspace/angularapp/src/app/guards/${folderName}.${fileTypeName}.ts" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/guards/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'interceptor') {
  scriptContent += `    if [ -d "/home/coder/project/workspace/angularapp/src/app/interceptors" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/interceptors/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
} else if (fileTypeName == 'module') {
  scriptContent += `    if [ -d "/home/coder/project/workspace/angularapp/src/app/modules" ]\n`;
  scriptContent += `    then\n`;
  scriptContent += `        cp /home/coder/project/workspace/karma/${fileName.toLowerCase()} /home/coder/project/workspace/angularapp/src/app/modules/${fileName.toLowerCase()};\n`;
  scriptContent += `    else\n`;
}

// Define a regular expression to match test names
const testRegex = /(?<!\/\/.*)fit\(['"](.+?)['"]/g;
const karmatestNames = [];
let match;

// Find and store all test names in the array
while ((match = testRegex.exec(fileContent)) !== null) {
  const testName = match[1];
  karmatestNames.push(testName);
  scriptContent += `        echo "${testName} FAILED";\n`;
}
scriptContent += `    fi\n
`;

allKarmaTestNames.push(...karmatestNames);
}
console.log("Karma test names: ", allKarmaTestNames);

scriptContent += `    if [ -d "/home/coder/project/workspace/angularapp/node_modules" ]; 
    then
        cd /home/coder/project/workspace/angularapp/
        npm test;
    else
        cd /home/coder/project/workspace/angularapp/
        yes | npm install
        npm test
    fi 
else   
    ${allKarmaTestNames.map(testName => `echo "${testName} FAILED";`).join('\n    ')}
fi
`;

// console.log(scriptContent);

await fs.writeFile(filePath, scriptContent, (err) => {
if (err) {
  console.error(`Error creating file: ${err}`);
} else {
  console.log(`File '${filePath}' created successfully.`);
}
});

const parentFolderPath = extractionFolder;

const subfolderName = dynamicFolderName;


const outputFolderPath = path.join('output');
fs.mkdirSync(outputFolderPath, { recursive: true });
const zipFilePath = path.join(outputFolderPath, `${dynamicFolderName}.zip`);
const output = fs.createWriteStream(zipFilePath);

const archive = archiver('zip', {
zlib: { level: 9 }, 
});

archive.pipe(output);

const subfolderPath = path.join(parentFolderPath, subfolderName);
archive.directory(subfolderPath,subfolderName, false);

archive.finalize();

output.on('close', async () => {
console.log('Subfolder successfully zipped.');
 // Save the zip file to MongoDB GridFS
 try {
  const client = await MongoClient.connect("mongodb+srv://Divakar:HIGHjump@cluster0.grfzp.mongodb.net/Scaffolding?retryWrites=true&w=majority&appName=Cluster0", { useUnifiedTopology: true });
  const db = client.db();
  const bucket = new GridFSBucket(db);

  const zipStream = fs.createReadStream(zipFilePath);
  const uploadStream = bucket.openUploadStream(`${dynamicFolderName}.zip`);
  id = uploadStream.id;

  zipStream.pipe(uploadStream)
    .on('finish', async () => {
      console.log('Zip file stored in MongoDB:', id);
      const outputId = id.toString();
      resolve(id);
    })
    .on('error', (err) => {
      console.error('Error storing zip in MongoDB:', err);
      reject(err);
    });

    // // extract the zip file from db to local 
    // const downloadStream = bucket.openDownloadStream(id);
    // const fileStream = fs.createWriteStream(`./output/path/${dynamicFolderName}.zip`);
    // downloadStream.pipe(fileStream)  
    // .on('error', (error) => {
    //   console.error('Error downloading file:', error);
    //   reject(error);
    // })
    // .on('finish', () => {
    //   console.log('Zip file downloaded successfully.');
    //   resolve(id);
    // });


} catch (mongoError) {
  console.error('Error storing zip in MongoDB:', mongoError);
  reject(mongoError);
}
});

// output.on('error', (err) => {
// console.error('Error zipping subfolder:', err);
// });
});
}

module.exports = karmaShFile;    
