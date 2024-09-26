// const fs = require('fs');
// const path = require('path');
// const archiver = require('archiver');
// const { MongoClient, GridFSBucket } = require('mongodb');



// async function testNames(csFilePath, extractionFolder, dynamicFolderName, subfolderContents) {
//     console.log(csFilePath);
//     console.log(subfolderContents);
//     return new Promise(async (resolve, reject) => {

//     try {
//       const data = fs.readFileSync(csFilePath, 'utf8');
      
//       // const regex = /\[Test\]\s+public\s+void\s+(\w+)\(/g;
//       // const testNames = [];
      
//       // let match;
//       // while ((match = regex.exec(data)) !== null) {
//       //   // match[1] contains the captured test method name
//       //   testNames.push(match[1]);
//       // }
//       // const regex = /\[Test\]\s+public\s+(async\s+)?(Task\s+)?(\w+)\(/g;
//       // const regex = /\[Test\]\s+public\s+(async\s+)?\w+\s+(\w+)\(/g;
//       const regex = /\[Test(?:,\s*Order\(\d+\))?\]\s+public\s+(async\s+)?\w+\s+(\w+)\(/g;

//       const testNames = [];
      
//       let match;
//       while ((match = regex.exec(data)) !== null) {
//         // match[3] contains the captured test method name
//         const methodName = match[3];
//         const asyncKeyword = match[1] || '';
//         const taskKeyword = match[2] || '';
  
//         const fullMethodName = taskKeyword;
        
//         testNames.push(fullMethodName);
//       }
  
//       console.log('Test Names:');
//       console.log(testNames);
//       let dotnetapp;
//       const filePath = path.join(extractionFolder, dynamicFolderName, 'nunit', 'run.sh');
//       for (const app of subfolderContents){
//         if(app != 'nunit' && app != 'karma' && app != 'angularapp'){
//           dotnetapp = app;
//         }
//       }
//       console.log(dotnetapp);
  
//       const fileContent = `#!/bin/bash  
// if [ ! -d "/home/coder/project/workspace/${dotnetapp}/" ]
// then
//     cp -r /home/coder/project/workspace/nunit/${dotnetapp} /home/coder/project/workspace/;
// fi
// if [ -d "/home/coder/project/workspace/${dotnetapp}/" ]
// then
//     echo "project folder present"
//     # checking for src folder
//     if [ -d "/home/coder/project/workspace/${dotnetapp}/" ]
//     then
//         cp -r /home/coder/project/workspace/nunit/test/TestProject /home/coder/project/workspace/;
//         cp -r /home/coder/project/workspace/nunit/test/${dotnetapp}.sln /home/coder/project/workspace/${dotnetapp}/;
//         cd /home/coder/project/workspace/${dotnetapp} || exit;
//         dotnet clean;
//         dotnet build && dotnet test -l "console;verbosity=normal";
//     else
//         ${testNames.map(testName => `echo "${testName} FAILED";`).join('\n        ')}
//     fi
// else
//     ${testNames.map(testName => `echo "${testName} FAILED";`).join('\n    ')}
// fi
// `;
  
//       await fs.writeFile(filePath, fileContent, (err) => {
//         if (err) {
//           console.error(`Error creating file: ${err}`);
//         } else {
//           console.log(`File '${filePath}' created successfully.`);
//         }
//       });
  
//       const parentFolderPath = extractionFolder;
  
//       const subfolderName = dynamicFolderName;
  
//       const outputFolderPath = path.join('output');
//       fs.mkdirSync(outputFolderPath, { recursive: true });
  
//       const output = fs.createWriteStream(path.join(outputFolderPath, `${dynamicFolderName}.zip`));
  
//       const archive = archiver('zip', {
//         zlib: { level: 9 }, 
//       });
//       console.log("outpt "+output.path);
//       archive.pipe(output);
  
//       const subfolderPath = path.join(parentFolderPath, subfolderName);
//       archive.directory(subfolderPath,subfolderName, false);
  
//       archive.finalize();
  
//       output.on('close', () => {
//         console.log('Subfolder successfully zipped.');
//         resolve("true");
//       });
  
//       output.on('error', (err) => {
//         console.error('Error zipping subfolder:', err);
//         resolve("false");
//       });
  
  
//     } catch (err) {
//       console.error(`Error reading file: ${err}`);
//       reject(err);
//     }
//   }
//   );
//   }

// module.exports = { testNames };
  
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { MongoClient, GridFSBucket } = require('mongodb');

async function testNames(csFilePath, extractionFolder, dynamicFolderName, subfolderContents, db) {
  console.log(csFilePath);
  console.log(subfolderContents);
  // console.log(db);
  let id;
  
  
  return new Promise(async (resolve, reject) => {
    try {
      const data = fs.readFileSync(csFilePath, 'utf8');
      const regex = /\[Test(?:,\s*Order\(\d+\))?\]\s+public\s+(async\s+)?\w+\s+(\w+)\(/g;
      const testNames = [];
      
      let match;
      while ((match = regex.exec(data)) !== null) {
        testNames.push(match[2]); // The test method name
      }

      console.log('Test Names:', testNames);

      let dotnetapp;
      const filePath = path.join(extractionFolder, dynamicFolderName, 'nunit', 'run.sh');
      for (const app of subfolderContents) {
        if (app != 'nunit' && app != 'karma' && app != 'angularapp') {
          dotnetapp = app;
        }
      }

      console.log(dotnetapp);

      const fileContent = `#!/bin/bash  
if [ ! -d "/home/coder/project/workspace/${dotnetapp}/" ]
then
    cp -r /home/coder/project/workspace/nunit/${dotnetapp} /home/coder/project/workspace/;
fi
if [ -d "/home/coder/project/workspace/${dotnetapp}/" ]
then
    echo "project folder present"
    if [ -d "/home/coder/project/workspace/${dotnetapp}/" ]
    then
        cp -r /home/coder/project/workspace/nunit/test/TestProject /home/coder/project/workspace/;
        cp -r /home/coder/project/workspace/nunit/test/${dotnetapp}.sln /home/coder/project/workspace/${dotnetapp}/;
        cd /home/coder/project/workspace/${dotnetapp} || exit;
        dotnet clean;
        dotnet build && dotnet test -l "console;verbosity=normal";
    else
        ${testNames.map(testName => `echo "${testName} FAILED";`).join('\n        ')}
    fi
else
    ${testNames.map(testName => `echo "${testName} FAILED";`).join('\n    ')}
fi
`;

      await fs.writeFile(filePath, fileContent, (err) => {
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
      archive.directory(subfolderPath, subfolderName, false);
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

      output.on('error', (err) => {
        console.error('Error zipping subfolder:', err);
        reject(err);
      });
    } catch (err) {
      console.error(`Error processing file: ${err}`);
      reject(err);
    }
  });
}

module.exports = { testNames };
