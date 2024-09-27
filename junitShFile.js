const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { MongoClient, GridFSBucket } = require('mongodb');

async function junitShFile(extractionFolder, dynamicFolderName, subfolderContents) {
    const dynamicFolderPath = path.join(extractionFolder, dynamicFolderName, 'junit');
    const filesInDynamicFolder = fs.readdirSync(dynamicFolderPath);
    
    const filePath = path.join(extractionFolder, dynamicFolderName, 'junit', 'junit.sh');

    // Create the script for junit.sh
    let scriptContent = `#!/bin/bash
cp -r /home/coder/project/workspace/junit/test /home/coder/project/workspace/springapp/src/;
cd /home/coder/project/workspace/springapp/;
mvn clean test
`;

    // Create the `junit.sh` file with the generated content
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

module.exports = junitShFile;
