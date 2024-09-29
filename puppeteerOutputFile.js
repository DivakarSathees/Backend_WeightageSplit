const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { MongoClient, GridFSBucket } = require('mongodb');

async function puppeteerOutputFile(extractionFolder, dynamicFolderName, subfolderContents) {
    // const dynamicFolderPath = path.join(extractionFolder, dynamicFolderName, 'puppeteer');

    return new Promise(async (resolve, reject) => {
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

        // Add the contents of the subfolder to the archive
        // for (const file of subfolderContents) {
        //     const filePath = path.join(subfolderPath, file);
        //     archive.file(filePath, { name: file });
        // }

        // Finalize the archive and resolve the promise
        archive.finalize();
        output.on('close', async () => {
            console.log(`Archive ${zipFilePath} created successfully.`);
            
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

        // Handle any errors during archiving
        archive.on('error', (err) => {
            console.error(`Error creating archive: ${err}`);
            reject(err);
        });
    });

}

module.exports = { puppeteerOutputFile };
