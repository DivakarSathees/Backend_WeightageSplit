const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { MongoClient, GridFSBucket } = require('mongodb');

async function jestShFile(extractionFolder, dynamicFolderName, subfolderContents) {
    const dynamicFolderPath = path.join(extractionFolder, dynamicFolderName, 'react');
    const filesInDynamicFolder = fs.readdirSync(dynamicFolderPath);
    
    const filePath = path.join(extractionFolder, dynamicFolderName, 'react', 'react.sh');

    // Create the script for jest.sh
    let scriptContent = `#!/bin/bash
if [ -d "/home/coder/project/workspace/reactapp/src/tests/" ]
then
    rm -r /home/coder/project/workspace/reactapp/src/tests;
fi
cp -r /home/coder/project/workspace/react/tests /home/coder/project/workspace/reactapp/src/;
cd /home/coder/project/workspace/reactapp/;
source /usr/local/nvm/nvm.sh
nvm use 20
export CI=true;
if [ -d "/home/coder/project/workspace/reactapp/node_modules" ]; then
    cd /home/coder/project/workspace/reactapp/
    npx jest --verbose --testPathPattern=src/tests 2>&1;
else
    cd /home/coder/project/workspace/reactapp/
    yes | npm install
    npx jest --verbose --testPathPattern=src/tests 2>&1;
fi
`;

    // Create the `jest.sh` file with the generated content
    return new Promise(async (resolve, reject) => {
        await fs.writeFile(filePath, scriptContent, (err) => {
            if (err) {
                console.error(`Error creating file: ${err}`);
                reject(err);
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
            zlib: { level: 9 }, // Set the compression level
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
                const id = uploadStream.id;

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

            } catch (mongoError) {
                console.error('Error storing zip in MongoDB:', mongoError);
                reject(mongoError);
            }
        });

        output.on('error', (err) => {
            console.error('Error zipping subfolder:', err);
            reject(err);
        });
    });
}

module.exports = jestShFile;
