const express = require('express');
const fs = require('fs');
const fs1 = require('fs-extra');
const unzipper = require('unzipper');
const path = require('path');
const bodyParser = require('body-parser');
const readline = require('readline');
const multer = require('multer');
const cors = require('cors');
const junitShFile = require('./junitShFile');
const AdmZip = require('adm-zip');
const  Description  = require('./Description');
const archiver = require('archiver');
const e = require('express');
const karmaShFile = require('./karmaShFile');
const modelsTest = require('./modelsTest');
const { testNames } = require('./nunitShFile');
const { readAndStoreEchoStatements } = require('./shEchoStatements');
const { processRunShFile } = require('./weightageShFile');
const httpTest = require('./httpTest');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');  // Import ObjectId
// const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');
const jestShFile = require('./jestShFile');
const uri = "mongodb+srv://Divakar:HIGHjump@cluster0.grfzp.mongodb.net/Scaffolding?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
let gfsUploads;
let gfsFs;
let gfsDefaultScaffolding;
const conn = mongoose.connection;
conn.once('open', async () => {
  console.log('Connected to MongoDB');  
  // Initialize GridFS stream
  gfsUploads = new GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  gfsFs = new GridFSBucket(conn.db, {
    bucketName: 'fs'
  });
  gfsDefaultScaffolding = new GridFSBucket(conn.db, {
    bucketName: 'defaultScaffolding'
  });

  // const filePath = './springapp.zip';
  // if (!fs.existsSync(filePath)) {
  //   console.error('File does not exist:', filePath);
  //   return;
  // }

  // try {
  //   const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
  // const db = client.db();
  // const bucket = new GridFSBucket(db,{
  //   bucketName: 'defaultScaffolding'
  // });

  //   const zipStream = fs.createReadStream(filePath);
    
  //   zipStream.on('error', (err) => {
  //     console.error('Error reading file:', err);
  //   });

  //   zipStream.on('data', (chunk) => {
  //     console.log(`Reading chunk of size: ${chunk.length}`);
  //   });

  //   zipStream.on('end', () => {
  //     console.log('File read complete.');
  //   });

  //   const uploadStream = bucket.openUploadStream('springapp.zip');
  //   const id = uploadStream.id;
  //   console.log('File upload started with id:', id);

  //  // Pipe file to MongoDB GridFS
  //   zipStream.pipe(uploadStream)
  //     .on('finish', async () => {
  //       console.log('Zip file stored in MongoDB:', id);
  //     })
  //     .on('error', (err) => {
  //       console.error('Error storing zip in MongoDB:', err);
  //     });

  //   uploadStream.on('close', () => {
  //     console.log('Upload stream closed.');
  //   });

  //   const downloadStream = bucket.openDownloadStream(new ObjectId('66f57215e29957b57eb0b6b6'));
  //   const fileStream = fs.createWriteStream(`./output/path/ang.zip`);
  //   downloadStream.pipe(fileStream)  
  //   .on('error', (error) => {
  //     console.error('Error downloading file:', error);
  //     // reject(error);
  //   })
  //   .on('finish', () => {
  //     console.log('Zip file downloaded successfully.');
  //     // resolve(id);
  //   });

  //   uploadStream.on('data', (chunk) => {
  //     console.log(`Uploaded chunk of size: ${chunk.length}`);
  //   });

  //   // Set a timeout for the upload process
  //   setTimeout(() => {
  //     if (!uploadStream.destroyed) {
  //       console.log('Upload is taking too long, closing stream...');
  //       uploadStream.end(); // Force the stream to end if it’s stuck
  //     }
  //   }, 10000); // 10-second timeout

  // } catch (mongoError) {
  //   console.error('Error storing zip in MongoDB:', mongoError);
  // }
});


// output.on('error', (err) => {
// console.error('Error zipping subfolder:', err);
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);





const app = express();
const port = 3000;
app.use(cors({ origin: 'https://forntend-weightagesplit-1.onrender.com' }));
// app.use(cors({ origin: 'http://localhost:4200' }));

app.use(bodyParser.json());
// const upload = multer({ dest: 'uploads/' });
const storage = new GridFsStorage({
  url: uri,
  // options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    console.log(file);
    
    return {
      bucketName: 'uploads', // Name of the GridFS collection
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});
const upload = multer({ storage });



app.use(express.json());

function extractZip(zipFilePath, destinationFolder) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: destinationFolder }))
      .on('finish', () => resolve())
      .on('error', (err) => reject(err));
  });
}

function readFolderContents(folderPath) {
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

let runShFilePaths1 = [];
let outputId = 0;
let karmaOutputId = 0;
async function processZipFile(zipFilePath, evaluationTypes, projectType, fileName) {
  console.log("zipFilePath123 "+zipFilePath);
  // 
  outputId = 0;
  runShFilePaths1 = [];
  try {
    const zipFileNameWithoutExtension = path.basename(zipFilePath, '.zip');
    console.log(zipFileNameWithoutExtension);
    
    const extractionFolder = path.join(__dirname, 'dist1', zipFileNameWithoutExtension);

    if (!fs.existsSync(extractionFolder)) {
      fs.mkdirSync(extractionFolder, { recursive: true });
    }

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractionFolder);

    const filesInExtractionFolder = await readFolderContents(extractionFolder);
    console.log(filesInExtractionFolder);

    // Assuming there's a subfolder inside with a dynamic name, find it
    var dynamicFolderName = filesInExtractionFolder.find((folder) =>
      fs.statSync(path.join(extractionFolder, folder)).isDirectory()
    );

    let subfolderContents;
    console.log("dyna "+dynamicFolderName);
    
    if (dynamicFolderName) {
      const subfolderPath = path.join(extractionFolder, dynamicFolderName);
       subfolderContents = await readFolderContents(subfolderPath);
    
      console.log("sub foldersssss "+subfolderContents);
    }  
    var unitFilePath;
    var jestFilePath;
    var karmaFilePath;
    var junitFilePath;

    if (!dynamicFolderName) {
      console.log(extractionFolder);
      console.log("qwe "+extractionFolder, dynamicFolderName);
      
      // if no subfolder is found, check for evaluation types & extract a ./dotnetapp.zip file to the extraction folder
      if (evaluationTypes.includes('NUnit') ) {
        console.log(evaluationTypes);
        // read the contents of the zip file
        const zipContents = await readFolderContents(extractionFolder);
        console.log(zipContents);
        unitFilePath = zipContents.find((file) => file.endsWith('.cs'));
        console.log(unitFilePath);

        // split the file name with . and get the first part
        const unitFileName = unitFilePath.split('.')[0];
        console.log("Diva File "+unitFileName);
        var dotnetAppZipFilePath;
        if(projectType.toLowerCase() == 'mvc'){
          // dotnetAppZipFilePath = path.join('dotnetappmvc.zip');
          // get the zip dotnetappmvc from bd with id & store it in the folder
          const fileId = new mongoose.Types.ObjectId('66f57296fad85d1129292789');
          const downloadStream = gfsDefaultScaffolding.openDownloadStream(fileId);
          // create a folder with name defaultScaffoldings to store the zip file
          const defaultScaffoldingFolder = path.join(__dirname, 'defaultScaffoldings');
          if (!fs.existsSync(defaultScaffoldingFolder)) {
            fs.mkdirSync(defaultScaffoldingFolder, { recursive: true });
          }
          dotnetAppZipFilePath = path.join(defaultScaffoldingFolder, 'dotnetappmvc.zip');
          const writeStream = fs.createWriteStream(dotnetAppZipFilePath);
           downloadStream.pipe(writeStream);
           writeStream.on('close', () => {
            console.log('File downloaded successfully');
        
            // Now check if the file exists
            if (!fs.existsSync(dotnetAppZipFilePath)) {
              console.error('File does not exist:', dotnetAppZipFilePath);
              return;
            }
        
            // Extract the zip file to the folder
            // const dotnetAppZip = new AdmZip(dotnetAppZipFilePath);
            // dotnetAppZip.extractAllTo(extractionFolder);
            // console.log('File extracted successfully');
          });
        
          writeStream.on('error', (err) => {
            console.error('Error writing file:', err);
          });
        } else if(projectType.toLowerCase() == 'webapi'){
          // dotnetAppZipFilePath = path.join('dotnetappwebapi.zip');
          // get the zip dotnetappwebapi from bd with id & store it in the folder
          const fileId = new mongoose.Types.ObjectId('66f5ceeca5101faa6066ffad');
          const downloadStream = gfsDefaultScaffolding.openDownloadStream(fileId);
          // create a folder with name defaultScaffoldings to store the zip file
          const defaultScaffoldingFolder = path.join(__dirname, 'defaultScaffoldings');
          if (!fs.existsSync(defaultScaffoldingFolder)) {
            fs.mkdirSync(defaultScaffoldingFolder, { recursive: true });
          }
          dotnetAppZipFilePath = path.join(defaultScaffoldingFolder, 'dotnetappwebapi.zip');
          const writeStream = fs.createWriteStream(dotnetAppZipFilePath);
           downloadStream.pipe(writeStream);
           writeStream.on('close', () => {
            console.log('File downloaded successfully');
        
            // Now check if the file exists
            if (!fs.existsSync(dotnetAppZipFilePath)) {
              console.error('File does not exist:', dotnetAppZipFilePath);
              return;
            }
        
            // Extract the zip file to the folder
            // const dotnetAppZip = new AdmZip(dotnetAppZipFilePath);
            // dotnetAppZip.extractAllTo(extractionFolder);
            // console.log('File extracted successfully');
          });

          writeStream.on('error', (err) => {
            console.error('Error writing file:', err);
          });
        }
        console.log(dotnetAppZipFilePath);
        // check if the file exists in the folder & extract it to the folder
        if (!fs.existsSync(dotnetAppZipFilePath)) {
          console.error('File does not exist:', dotnetAppZipFilePath);
          return;
        }
        // extract the zip file to the folder
        const dotnetAppZip = new AdmZip(dotnetAppZipFilePath);
        dotnetAppZip.extractAllTo(extractionFolder);
        console.log(extractionFolder);
        
        

        // rename the extracted folder to uploader zip file name
        const dotnetAppFolder = path.join(extractionFolder, 'dotnetapp');
        const renamedDotnetAppFolder = path.join(extractionFolder, fileName);
        if(fs.existsSync(renamedDotnetAppFolder)){
          console.log("folder exists");
          
          const angularAppFolder = path.join(extractionFolder, 'dotnetapp');
          const angularAppContents = await readFolderContents(angularAppFolder);
          for (const file of angularAppContents) {
            const destinationFilePath = path.join(renamedDotnetAppFolder);
            // fs.copyFileSync(path.join(angularAppFolder, file), destinationFilePath);
            // console.log(`Copied ${file} to: ${destinationFilePath}`);
            await fs1.ensureDir(destinationFolder);
            await fs1.copy(path.join(angularAppFolder, file), destinationFolder);
            console.log(`Copied ${file} to: ${destinationFilePath}`);

          }
        }else {
          fs.renameSync(dotnetAppFolder, renamedDotnetAppFolder);
          console.log(`Renamed ${dotnetAppFolder} to ${renamedDotnetAppFolder}`);
        }
        const destinationFolder = path.join(extractionFolder, fileName, 'nunit', 'test', 'TestProject');

        // Ensure the destination folder exists (create it if not)
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
          console.log(`Created destination folder: ${destinationFolder}`);
        }

        // Define the destination file path
        const destinationFilePath = path.join(destinationFolder, path.basename(unitFilePath));
        console.log(destinationFilePath);
        console.log(extractionFolder);
        console.log("1234567890 "+unitFilePath);
        
        // Copy the .cs file into the destination folder (instead of moving)
        fs.copyFileSync(path.join(extractionFolder, unitFilePath), destinationFilePath);
        console.log(`Copied .cs file to: ${destinationFilePath}`);
        const zipfullContents = await readFolderContents(extractionFolder);
        console.log(zipfullContents);
        dynamicFolderName = zipfullContents.find((folder) =>
          fs.statSync(path.join(extractionFolder, folder)).isDirectory()
        );
        console.log(dynamicFolderName);
        const subfolderPath = path.join(extractionFolder, dynamicFolderName);
        subfolderContents = await readFolderContents(subfolderPath);      
        console.log("sub foldersssss123 "+subfolderContents);
      }

      if (evaluationTypes.includes('Karma')) {
        console.log("asd78945612 "+evaluationTypes);
        // read the contents of the zip file
        const zipContents = await readFolderContents(extractionFolder);
        console.log(zipContents);
        // there will more than one file in the zip file end with .spec.ts
        karmaFilePath = zipContents.find((file) => file.endsWith('.spec.ts'));
        console.log(karmaFilePath);

        // split the file name with . and get the first part
        const unitFileName = karmaFilePath.split('.')[0];
        console.log("789456512 "+unitFileName);
        // return 0;
        // const angularAppZipFilePath = path.join('angularapp.zip');
        // get the zip angularapp from bd with id & store it in the folder
        const fileId = new mongoose.Types.ObjectId('66f57215e29957b57eb0b6b6');
        const downloadStream = gfsDefaultScaffolding.openDownloadStream(fileId);
        // create a folder with name defaultScaffoldings to store the zip file
        const defaultScaffoldingFolder = path.join(__dirname, 'defaultScaffoldings');
        if (!fs.existsSync(defaultScaffoldingFolder)) {
          fs.mkdirSync(defaultScaffoldingFolder, { recursive: true });
        }
        const angularAppZipFilePath = path.join(defaultScaffoldingFolder, 'angularapp.zip');
        const writeStream = fs.createWriteStream(angularAppZipFilePath);

        downloadStream.pipe(writeStream);
        writeStream.on('close', () => {
          console.log('File downloaded successfully');
      
          // Now check if the file exists
          if (!fs.existsSync(angularAppZipFilePath)) {
            console.error('File does not exist:', angularAppZipFilePath);
            return;
          }
      
          // Extract the zip file to the folder
          // const angularAppZip = new AdmZip(angularAppZipFilePath);
          // angularAppZip.extractAllTo(extractionFolder);
          // console.log('File extracted successfully');
        });

        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
        }
        );
        console.log(angularAppZipFilePath);

        const angularAppZip = new AdmZip(angularAppZipFilePath);
        angularAppZip.extractAllTo(extractionFolder);
        // // rename the extracted folder to uploader zip file name
        const dotnetAppFolder = path.join(extractionFolder, 'angularapp');
        const renamedDotnetAppFolder = path.join(extractionFolder, fileName);
        // if folder with the same name already exists, copy the contnets in angularapp folder to the folder with the same name
        if(fs.existsSync(renamedDotnetAppFolder)){
          console.log("folder exists");
          
          const angularAppFolder = path.join(extractionFolder, 'angularapp');
          const angularAppContents = await readFolderContents(angularAppFolder);
          for (const file of angularAppContents) {
            const destinationFilePath = path.join(renamedDotnetAppFolder);
            console.log(destinationFilePath);
            
            // fs.copyFileSync(path.join(angularAppFolder, file), destinationFilePath);
            // console.log(`Copied ${file} to: ${destinationFilePath}`);
            await fs1.ensureDir(destinationFilePath);
            await fs1.copy(path.join(angularAppFolder), destinationFilePath);
            console.log(`Copied ${file} to: ${destinationFilePath}`);

          }
        } else {
          fs.renameSync(dotnetAppFolder, renamedDotnetAppFolder);
        console.log(`Renamed ${dotnetAppFolder} to ${renamedDotnetAppFolder}`);
        }
        
        const destinationFolder = path.join(extractionFolder, fileName, 'karma');

        // // Ensure the destination folder exists (create it if not)
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
          console.log(`Created destination folder: ${destinationFolder}`);
        }
        // copy all the zipcontents file to destination folder
        for (const file of zipContents) {
          const destinationFilePath = path.join(destinationFolder, path.basename(file));
          // copy the file with .spec.ts to the destination folder
          if(file.endsWith('.spec.ts')){
            fs.copyFileSync(path.join(extractionFolder, file), destinationFilePath);
            console.log(`Copied ${file} to: ${destinationFilePath}`);
          }
        }
        
        const zipfullContents = await readFolderContents(extractionFolder);
        // dynamicFolderName = zipfullContents.find((folder) =>
        //   fs.statSync(path.join(extractionFolder)).isDirectory()
        // );
        console.log(fileName);
        
        dynamicFolderName = zipfullContents.find((folder) =>
          fs.statSync(path.join(extractionFolder, folder)).isDirectory() && folder == fileName
        );
        console.log(dynamicFolderName);
        const subfolderPath = path.join(extractionFolder, dynamicFolderName);
        subfolderContents = await readFolderContents(subfolderPath);      
        console.log("sub foldersssss123 "+subfolderContents);
      }
      console.log("1diva123 "+evaluationTypes);
      
      if (evaluationTypes.includes('JUnit')){
        console.log("JUnit here");
        const zipContents = await readFolderContents(extractionFolder);
        console.log(zipContents);
        junitFilePath = zipContents.find((file) => file.endsWith('.java'));
        console.log(junitFilePath);
        const unitFileName = junitFilePath.split('.')[0];
        console.log("name"+unitFileName);
        console.log("name"+fileName);
        // // var javaAppZipFilePath;
        // const javaAppZipFilePath = path.join(__dirname, 'springapp.zip');
        // if(!fs.existsSync(javaAppZipFilePath)){
        //   console.error('File does not exist:', javaAppZipFilePath);
        //   return;
        // }
        const fileId = new mongoose.Types.ObjectId('66f6947369172bda2e86a478');
        const downloadStream = gfsDefaultScaffolding.openDownloadStream(fileId);
        // create a folder with name defaultScaffoldings to store the zip file
        const defaultScaffoldingFolder = path.join(__dirname, 'defaultScaffoldings');
        if (!fs.existsSync(defaultScaffoldingFolder)) {
          fs.mkdirSync(defaultScaffoldingFolder, { recursive: true });
        }
        const springAppZipFilePath = path.join(defaultScaffoldingFolder, 'springapp.zip');
        const writeStream = fs.createWriteStream(springAppZipFilePath);

        downloadStream.pipe(writeStream);
        writeStream.on('close', () => {
          console.log('File downloaded successfully');
      
          // Now check if the file exists
          if (!fs.existsSync(springAppZipFilePath)) {
            console.error('File does not exist:', springAppZipFilePath);
            return;
          }
      
          // Extract the zip file to the folder
          // const angularAppZip = new AdmZip(angularAppZipFilePath);
          // angularAppZip.extractAllTo(extractionFolder);
          // console.log('File extracted successfully');
        });

        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
        }
        );
        const javaAppZip = new AdmZip(springAppZipFilePath);
        javaAppZip.extractAllTo(extractionFolder);
        console.log(extractionFolder);

        const javaAppFolder = path.join(extractionFolder, 'springapp');
        const renamedJavaAppFolder = path.join(extractionFolder, fileName);
        if(fs.existsSync(renamedJavaAppFolder)){
          console.log("folder exists");
          
          const javaAppFolder = path.join(extractionFolder, 'springapp');
          const javaAppContents = await readFolderContents(javaAppFolder);
          for (const file of javaAppContents) {
            const destinationFilePath = path.join(renamedJavaAppFolder);
            // fs.copyFileSync(path.join(angularAppFolder, file), destinationFilePath);
            // console.log(`Copied ${file} to: ${destinationFilePath}`);
            await fs1.ensureDir(destinationFilePath);
            await fs1.copy(path.join(javaAppFolder), destinationFilePath);
            console.log(`Copied ${file} to: ${destinationFilePath}`);

          }
        } else {  
          fs.renameSync(javaAppFolder, renamedJavaAppFolder);
          console.log(`Renamed ${javaAppFolder} to ${renamedJavaAppFolder}`);
        }

        const destinationFolder = path.join(extractionFolder, fileName, 'junit', 'test', 'java', 'com', 'example', 'springapp');
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
          console.log(`Created destination folder: ${destinationFolder}`);
        }
        for (const file of zipContents) {
          const destinationFilePath = path.join(destinationFolder, path.basename(file));
          if(file.endsWith('.java')){
            fs.copyFileSync(path.join(extractionFolder, file), destinationFilePath);
            console.log(`Copied ${file} to: ${destinationFilePath}`);
          }
        }
        const zipfullContents = await readFolderContents(extractionFolder);
        dynamicFolderName = zipfullContents.find((folder) =>
          fs.statSync(path.join(extractionFolder, folder)).isDirectory()
        );
        console.log(dynamicFolderName);
        const subfolderPath = path.join(extractionFolder, dynamicFolderName);
        subfolderContents = await readFolderContents(subfolderPath);
        console.log("sub foldersssss123 "+subfolderContents);
      }

      if (evaluationTypes.includes('Jest')){
        console.log("Jest here");
        const zipContents = await readFolderContents(extractionFolder);
        console.log(zipContents);
        jestFilePath = zipContents.find((file) => file.endsWith('.js'));
        console.log(jestFilePath);
        const unitFileName = jestFilePath.split('.')[0];
        console.log("name"+unitFileName);
        console.log("name"+fileName);
        // // var javaAppZipFilePath;
        // const javaAppZipFilePath = path.join(__dirname, 'springapp.zip');
        // if(!fs.existsSync(javaAppZipFilePath)){
        //   console.error('File does not exist:', javaAppZipFilePath);
        //   return;
        // }
        const fileId = new mongoose.Types.ObjectId('66f90a41c7e0e7ed88c78555');
        const downloadStream = gfsDefaultScaffolding.openDownloadStream(fileId);
        // create a folder with name defaultScaffoldings to store the zip file
        const defaultScaffoldingFolder = path.join(__dirname, 'defaultScaffoldings');
        if (!fs.existsSync(defaultScaffoldingFolder)) {
          fs.mkdirSync(defaultScaffoldingFolder, { recursive: true });
        }
        const springAppZipFilePath = path.join(defaultScaffoldingFolder, 'reactapp.zip');
        const writeStream = fs.createWriteStream(springAppZipFilePath);

        downloadStream.pipe(writeStream);
        writeStream.on('close', () => {
          console.log('File downloaded successfully');
      
          // Now check if the file exists
          if (!fs.existsSync(springAppZipFilePath)) {
            console.error('File does not exist:', springAppZipFilePath);
            return;
          }
      
          // Extract the zip file to the folder
          // const angularAppZip = new AdmZip(angularAppZipFilePath);
          // angularAppZip.extractAllTo(extractionFolder);
          // console.log('File extracted successfully');
        });

        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
        }
        );
        const javaAppZip = new AdmZip(springAppZipFilePath);
        javaAppZip.extractAllTo(extractionFolder);
        console.log(extractionFolder);

        const javaAppFolder = path.join(extractionFolder, 'reactapp');
        const renamedJavaAppFolder = path.join(extractionFolder, fileName);
        if(fs.existsSync(renamedJavaAppFolder)){
          console.log("folder exists");
          
          const javaAppFolder = path.join(extractionFolder, 'reactapp');
          const javaAppContents = await readFolderContents(javaAppFolder);
          for (const file of javaAppContents) {
            const destinationFilePath = path.join(renamedJavaAppFolder);
            // fs.copyFileSync(path.join(angularAppFolder, file), destinationFilePath);
            // console.log(`Copied ${file} to: ${destinationFilePath}`);
            await fs1.ensureDir(destinationFilePath);
            await fs1.copy(path.join(javaAppFolder), destinationFilePath);
            console.log(`Copied ${file} to: ${destinationFilePath}`);

          }
        } else {  
          fs.renameSync(javaAppFolder, renamedJavaAppFolder);
          console.log(`Renamed ${javaAppFolder} to ${renamedJavaAppFolder}`);
        }

        const destinationFolder = path.join(extractionFolder, fileName, 'react', 'tests');
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
          console.log(`Created destination folder: ${destinationFolder}`);
        }
        for (const file of zipContents) {
          const destinationFilePath = path.join(destinationFolder, path.basename(file));
          if(file.endsWith('.js')){
            fs.copyFileSync(path.join(extractionFolder, file), destinationFilePath);
            console.log(`Copied ${file} to: ${destinationFilePath}`);
          }
        }
        const zipfullContents = await readFolderContents(extractionFolder);
        dynamicFolderName = zipfullContents.find((folder) =>
          fs.statSync(path.join(extractionFolder, folder)).isDirectory()
        );
        console.log(dynamicFolderName);
        const subfolderPath = path.join(extractionFolder, dynamicFolderName);
        subfolderContents = await readFolderContents(subfolderPath);
        console.log("sub foldersssss123 "+subfolderContents);
      }
    }

    const runShFilePaths = [];
    for (const type of evaluationTypes) {
      // let outputId;
      const lowercaseType = type.toLowerCase(); // Convert to lowercase
      console.log(lowercaseType);
      switch (lowercaseType) {
        case 'nunit': // Use 'nunit' with lowercase

          // const runShFilePath = path.join(extractionFolder, dynamicFolderName, 'nunit', 'run.sh');
          // runShFilePaths.push(runShFilePath);
          // const csFilePath = path.join(extractionFolder, dynamicFolderName, 'nunit', 'test', 'TestProject', unitFilePath?unitFilePath:'UnitTest1.cs');
          const csFilePath = path.join(extractionFolder, fileName, 'nunit', 'test', 'TestProject', unitFilePath?unitFilePath:'UnitTest1.cs');
          console.log("unitFilePath "+unitFilePath);
          
          //  outputId = await testNames(csFilePath, extractionFolder, dynamicFolderName, subfolderContents, conn);
           outputId = await testNames(csFilePath, extractionFolder, fileName, subfolderContents, conn);
          console.log("diva "+outputId);
          // localStorage.setItem('outputId', outputId);
          
          const runShFilePath = path.join(extractionFolder, fileName, 'nunit', 'run.sh');
          // const runShFilePath = path.join(extractionFolder, dynamicFolderName, 'nunit', 'run.sh');
          console.log(runShFilePath);
          runShFilePaths.push(runShFilePath);
          runShFilePaths1.push(runShFilePath);
          // Read the content of the file asynchronously
          
          break;
        case 'karma':
          console.log("asd7894561 "+extractionFolder);
          console.log("asd7894562 "+dynamicFolderName);
          console.log("asd7894563 "+subfolderContents);
          
          karmaOutputId = await karmaShFile(extractionFolder, fileName, subfolderContents);
console.log("karmaOutputId "+karmaOutputId);

          const runShFilePath1 = path.join(extractionFolder, fileName, 'karma', 'karma.sh');
          runShFilePaths.push(runShFilePath1);
          runShFilePaths1.push(runShFilePath1);
          break;
        case 'junit':
          const javaFilePath = path.join(extractionFolder, fileName, 'junit', 'test', 'java', 'com', 'example', 'springapp', junitFilePath?junitFilePath:'SpringappApplicationTests.java');
          outputId = await junitShFile(extractionFolder, fileName, subfolderContents);
          console.log("outputId "+outputId);
          const runShFilePath2 = path.join(extractionFolder, fileName, 'junit', 'junit.sh');
          runShFilePaths.push(runShFilePath2);
          runShFilePaths1.push(runShFilePath2);
          break;
        case 'jest':
          const jsFilePath = path.join(extractionFolder, fileName, 'react', 'tests', jestFilePath?jestFilePath:'App.test.js');
          console.log(jsFilePath);
          
          outputId = await jestShFile(extractionFolder, fileName, subfolderContents);
          console.log("outputId "+outputId);
          const runShFilePath3 = path.join(extractionFolder, fileName, 'react', 'ṛeact.sh');
          runShFilePaths.push(runShFilePath3);
          runShFilePaths1.push(runShFilePath3);
          break;
        default:
          throw new Error(`Invalid evaluation type: ${type}`);
      }
    }
    console.log("iddd "+runShFilePaths);
    console.log(runShFilePaths1);
    // runShFilePaths1 = runShFilePaths || [];
    // i need to return runShFilePaths & outputId
    return {runShFilePaths, outputId, karmaOutputId};

    
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}

app.post('/process-zip', upload.single('zipFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log(req.file);
  console.log(new mongoose.Types.ObjectId(req.file.id));
  
  
  // const fileName = path.basename(req.file.originalname, '.zip');
  // var zipFilePath = req.file.path;
  // const evaluationTypes = req.body.evaluationTypes.split(',');
  // const projectType = req.body.projectType;
  const fileName = path.basename(req.file.originalname, '.zip');
  const fileId = new mongoose.Types.ObjectId(req.file.id); // MongoDB ID of the uploaded file
  const evaluationTypes = req.body.evaluationTypes.split(',');
  const projectType = req.body.projectType;
  console.log(evaluationTypes);

  try {
    console.log(fileId);
    
    // const runShFilePaths = await processZipFile(zipFilePath, evaluationTypes, projectType, fileName);
    const runShFilePaths = await processZipFromDB(fileId, evaluationTypes, projectType, fileName);
    console.log("jsonObjects1");
    
    console.log(runShFilePaths);
    res.json(runShFilePaths);

    // delete all the files in the dist1 folder
    fs1.emptyDirSync(path.join(__dirname, 'dist1'));

    

    // const evaluationTypeWeights = {}; // Store weights for each evaluation type
    // for (const type of evaluationTypes) {
    //   evaluationTypeWeights[type] = 1.0 / evaluationTypes.length;
    // }

    
    // const jsonObjects = [];
    // for (const runShFilePath of runShFilePaths) {
    //   const jsonString = await processRunShFile(runShFilePath, evaluationTypeWeights);
    //   const jsonObject = JSON.parse(jsonString);
    //   jsonObjects.push(jsonObject);
    // }
    // console.log("jsonObjects123556");
    // console.log(jsonObjects);
    
    
    // res.json(jsonObjects);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during processing' });
  }
});

async function processZipFromDB(fileId, evaluationTypes, projectType, fileName) {
  return new Promise((resolve, reject) => {
    try {
      // Stream the file from MongoDB GridFS
      const downloadStream = gfsUploads.openDownloadStream(fileId);
      const extractionFolder = path.join(__dirname, 'dist1', fileName);

      if (!fs.existsSync(extractionFolder)) {
        fs.mkdirSync(extractionFolder, { recursive: true });
      }

      // Write file from stream to local filesystem
      const zipFilePath = path.join(extractionFolder, `${fileName}.zip`);
      const writeStream = fs.createWriteStream(zipFilePath);

      downloadStream.pipe(writeStream);

      writeStream.on('close', async () => {
        try {
          // Proceed with processing the zip file after it's saved locally
          const runShFilePaths = await processZipFile(zipFilePath, evaluationTypes, projectType, fileName);
          console.log("runShFilePaths" +runShFilePaths.runShFilePaths);
          console.log("runShFilePaths1" +runShFilePaths.outputId);
          
          const evaluationTypeWeights = {};
          for (const type of evaluationTypes) {
            evaluationTypeWeights[type] = 1.0 / evaluationTypes.length;
          }
          console.log(runShFilePaths.runShFilePaths);
          

          const jsonObjects = [];
          for (const runShFilePath of runShFilePaths.runShFilePaths) {
            console.log("processRunShFile dive: "+runShFilePath[0]);
            
            const jsonString = await processRunShFile(runShFilePath, evaluationTypeWeights, extractionFolder, fileName);
            const jsonObject = JSON.parse(jsonString);
            jsonObjects.push(jsonObject);
          }
          console.log("jsonObjects123");
          
          console.log(jsonObjects);
          // resolve = {jsonObjects, runShFilePaths};
          // console.log(resolve);
          nunitid = runShFilePaths.outputId;
          karmaid = runShFilePaths.karmaOutputId;
          

          resolve({jsonObjects, nunitid, karmaid}); // Resolve the promise with jsonObjects
        } catch (processError) {
          reject(processError); // Reject the promise if processing fails
        }
      });

      writeStream.on('error', (err) => {
        reject(err); // Handle write stream errors
      });
      
    } catch (error) {
      console.error('An error occurred:', error);
      reject(error); // Reject the promise if there's an initial error
    }
  });
}

// async function processZipFromDB(fileId, evaluationTypes, projectType, fileName) {
//   return new Promise((resolve, reject) => {
//     try {
//       // Stream the file from MongoDB GridFS
//       const downloadStream = gfsUploads.openDownloadStream(fileId);
//       const jsonObjects = [];
//       // create one collection in db & store the file in that collection & then read the file from that collection
//       // since project is going to deploy on cloud, so we need to store the file in db

      

      
        
//     } catch (error) {
//       console.error('An error occurred:', error);
//       reject(error); // Reject the promise if there's an initial error
//     }
//   });
// }

// // give method to process files not zip files
// app.post('/process-files', async (req, res) => {
//   const { files, evaluationTypes } = req.body;
//   console.log(files);
//   console.log(evaluationTypes);
//   const evaluationTypeWeights = {}; // Store weights for each evaluation type
//   for (const type of evaluationTypes) {
//     evaluationTypeWeights[type] = 1.0 / evaluationTypes.length;
//   }

//   const jsonObjects = [];
//   for (const file of files) {
//     const jsonString = await processRunShFile(file, evaluationTypeWeights);
//     const jsonObject = JSON.parse(jsonString);
//     jsonObjects.push(jsonObject);
//   }

//   res.json(jsonObjects);
// });


// endpoint to delete all the files from the db in uploads collection & dont delete the collection
app.delete('/deleteall', async (req, res) => {
  try {
    // Delete all files from the uploads collection
    await gfsUploads.drop();
    await gfsFs.drop();
    console.log(res.status(204));
    // send response to the client in json format
    res.json({ message: 'All files deleted successfully' });
    
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('An error occurred while deleting files');
  }
});





app.post('/model', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).send('No file uploaded.');
  }
  
  const zipFileNameWithoutExtension = path.basename(uploadedFile.path, '.zip');
    const extractionFolder = path.join(__dirname, 'dist1', zipFileNameWithoutExtension);

    if (!fs.existsSync(extractionFolder)) {
      fs.mkdirSync(extractionFolder, { recursive: true });
    }

    const zip = new AdmZip(uploadedFile.path);
    zip.extractAllTo(extractionFolder);

    const filesInExtractionFolder = await readFolderContents(extractionFolder);

    const dynamicFolderName = filesInExtractionFolder.find((folder) =>
      fs.statSync(path.join(extractionFolder, folder)).isDirectory()
    );
    let subfolderPath;
    let subfolderContents;
    if (dynamicFolderName) {
      subfolderPath = path.join(extractionFolder, dynamicFolderName);
       subfolderContents = await readFolderContents(subfolderPath);
    } 

    fs.readdir(subfolderPath, async (err, files) => { 
      if (err) {
        return res.status(500).send('Error reading the extracted folder.');
      }

      // modelsTest(files,subfolderPath);
      const jsonObjects = [];
    const jsonObject = await modelsTest(files, subfolderPath);
    const desc = await Description(files,subfolderPath);
    console.log("jsonObject");
    console.log(desc);
    console.log("jsonObject123");
    console.log(desc);
    console.log(jsonObject);
    // pass this desc as json object
    jsonObjects.push(jsonObject);
    jsonObjects.push(desc);
  

    // }
    res.json(jsonObjects);
      // res.send('Files processed and tests generated.');
    });
  });

  app.post('/httptest', upload.single('file'), async (req, res) => {
    const uploadedFile = req.file;
    if (!uploadedFile) {
      return res.status(400).send('No file uploaded.');
    }
    
    const zipFileNameWithoutExtension = path.basename(uploadedFile.path, '.zip');
      const extractionFolder = path.join(__dirname, 'dist1', zipFileNameWithoutExtension);
  
      if (!fs.existsSync(extractionFolder)) {
        fs.mkdirSync(extractionFolder, { recursive: true });
      }
  
      const zip = new AdmZip(uploadedFile.path);
      zip.extractAllTo(extractionFolder);
  
      const filesInExtractionFolder = await readFolderContents(extractionFolder);
  
      const dynamicFolderName = filesInExtractionFolder.find((folder) =>
        fs.statSync(path.join(extractionFolder, folder)).isDirectory()
      );
      let subfolderPath;
      let subfolderContents;
      if (dynamicFolderName) {
        subfolderPath = path.join(extractionFolder, dynamicFolderName);
         subfolderContents = await readFolderContents(subfolderPath);
      } 
  
      fs.readdir(subfolderPath, async (err, files) => { 
        if (err) {
          return res.status(500).send('Error reading the extracted folder.');
        }
  
        // httpTest(files,subfolderPath);
        const jsonObjects = [];
    const jsonObject = await httpTest(files, subfolderPath);
    const desc = await Description(files,subfolderPath);
    // console.log("jsonObject123");
    console.log(desc);
    console.log(jsonObject);
    // pass this desc as json object
    jsonObjects.push(jsonObject);
    jsonObjects.push(desc);
    res.json(jsonObjects);

        // res.send('Files processed and tests generated.');
      });
    });

app.get('/downloadtest', (req, res) => {
  const filePath = path.join(__dirname, 'UnitTest1.cs');
  console.log(filePath);

  // Send the file as an attachment
  res.download(filePath, 'UnitTest1.cs', (err) => {
    if (err) {
      // Handle errors, e.g., file not found
      res.status(500).send('Error downloading the file.');
    }
  });
});


// app.get('/downloadziporsh', (req, res) => {
//   const fileName = req.query.fileName;
//   console.log(req.query);
//   console.log(fileName);
//   var filePath;
//   const type = req.query.type;
//   if(fileName.includes('zip')){
//   var filePath = path.join(__dirname, "output", fileName);  if (!fs.existsSync(filePath)) {
//     return res.status(404).send('File not found');
//   }

//   // Send the file as an attachment
//   res.download(filePath, fileName, (err) => {
//     if (err) {
//       console.error('Error downloading file:', err);
//       res.status(500).send('Error downloading the file.');
//     }
//   });
// }
// else if(fileName.includes('sh')){
//   console.log(runShFilePaths1);
//   for (const runShFilePath of runShFilePaths1) {
//     console.log(runShFilePath);
//     console.log(type);
//   if(runShFilePath.includes('karma') && type == 'karma'){
//   console.log("run karma "+runShFilePath);
//   const filePath = path.join(`${runShFilePath}`);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).send('File not found');
//   }
//   // Send the file as an attachment
//   res.download(filePath, "run.sh", (err) => {
//     if (err) {
//       console.error('Error downloading file:', err);
//       res.status(500).send('Error downloading the file.');
//     }
//   });
// } else if(runShFilePath.includes('nunit') && type == 'nunit'){
//   console.log("run nunit "+runShFilePath);
//   const filePath = path.join(`${runShFilePath}`);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).send('File not found');
//   }
//   // Send the file as an attachment
//   res.download(filePath, "run.sh", (err) => {
//     if (err) {
//       console.error('Error downloading file:', err);
//       res.status(500).send('Error downloading the file.');
//     }
//   });
// }
//   }
// }
// });


app.get('/downloadziporsh', async (req, res) => {
  try {
    // Ensure gfs is initialized
    if (!gfsFs) {
      return res.status(500).json({ error: 'GridFSBucket is not initialized yet.' });
    }

    // Get the file ID from the query parameters
    const fileId = new mongoose.Types.ObjectId(req.query.id);
    const type = req.query.type || 'zip'; // Default to 'zip' if type is not specified
    console.log(fileId);
    console.log(`Requested Type: ${type}`);

    // Set file extension based on the type parameter
    let fileExtension = 'zip';
    if (type.toLowerCase() === 'sh') {
      fileExtension = 'sh';
    }

    // Find the file in the database using the ID
    const files = await gfsFs.find({ _id: fileId }).toArray();
    console.log(files[0]);
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found in fs bucket' });
    }

    const file = files[0];
    console.log(`Found file: ${file.filename}`);

    // Set the appropriate content type based on the file extension
    let contentType = 'application/zip';
    if (fileExtension === 'sh') {
      contentType = 'text/plain';
    }

    // Set the response headers for downloading
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`
    });

    // Create a download stream from GridFS and pipe it to the response
    const downloadStream = gfsFs.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'An error occurred while downloading the file' });
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'An error occurred while downloading the file' });
  }
});


app.post('/solution', (req, res) => {
  const models = req.body;

  if (!models || !Array.isArray(models)) {
      return res.status(400).json({ error: 'Invalid request payload' });
  }

  models.forEach(({ className, properties }) => {
      if (className && properties) {
          const modelContent = generateModelClass(className, properties);

          const directoryPath = path.join('D:', 'zip prpject', 'WEBAPI', 'dotnetapp', 'Models');
          if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
          }

          const fileName = path.join(directoryPath, `${className}.cs`);
          saveToFile(fileName, modelContent);
      }
  });

  res.json({ success: true, message: 'Model class files generated successfully' });
});

// Existing endpoint to generate DbContext file
app.post('/appdbcontexts', (req, res) => {
  const dbContextDefinitions = req.body;

  if (!dbContextDefinitions || !Array.isArray(dbContextDefinitions)) {
      return res.status(400).json({ error: 'Invalid request payload' });
  }

  dbContextDefinitions.forEach(({ dbContextClassName, dbContextProperties }) => {
      if (dbContextClassName && dbContextProperties) {
          const dbContextContent = generateDbContextClass(dbContextClassName, dbContextProperties);

          const directoryPath = path.join('D:', 'zip prpject', 'WEBAPI', 'dotnetapp', 'Models');
          if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
          }

          const fileName = path.join(directoryPath, `${dbContextClassName}.cs`);
          saveToFile(fileName, dbContextContent);
      }
  });

  res.json({ success: true, message: 'DbContext class files generated successfully' });
});

function generateModelClass(className, properties) {
  const template = `
namespace dotnetapp.Models
{
  public class ${className}
  {
${properties.map(({ name, type }) => `        public ${type} ${name} { get; set; }`).join('\n')}
  }
}
`;
  return template;
}

function generateDbContextClass(className, properties) {
  const template = `
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Models
{
  public class ${className} : DbContext
  {
      public ${className}(DbContextOptions<${className}> options) : base(options)
      {
      }

${properties.map(({ name, type }) => `        public DbSet<${type}> ${name} { get; set; }`).join('\n')}
  }
}
`;
  return template;
}

function saveToFile(fileName, content) {
  fs.writeFileSync(fileName, content, 'utf-8');
  console.log(`File saved: ${fileName}`);
}

app.post('/description', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).send('No file uploaded.');
  }
  
  const zipFileNameWithoutExtension = path.basename(uploadedFile.path, '.zip');
    const extractionFolder = path.join(__dirname, 'dist1', zipFileNameWithoutExtension);

    if (!fs.existsSync(extractionFolder)) {
      fs.mkdirSync(extractionFolder, { recursive: true });
    }

    const zip = new AdmZip(uploadedFile.path);
    zip.extractAllTo(extractionFolder);

    const filesInExtractionFolder = await readFolderContents(extractionFolder);

    const dynamicFolderName = filesInExtractionFolder.find((folder) =>
      fs.statSync(path.join(extractionFolder, folder)).isDirectory()
    );
    let subfolderPath;
    let subfolderContents;
    if (dynamicFolderName) {
      subfolderPath = path.join(extractionFolder, dynamicFolderName);
       subfolderContents = await readFolderContents(subfolderPath);
    } 

    fs.readdir(subfolderPath, async (err, files) => { 
      if (err) {
        return res.status(500).send('Error reading the extracted folder.');
      }

      const desc = await Description(files,subfolderPath);
      res.json({ desc });

      // res.send('Files processed and tests generated.');
    });
  });

  // write endpoint that open one third party url & proceed by clicking on button
  app.post('/thirdparty', async (req, res) => {
    const { url, username, password } = req.body; // Expecting URL, username, and password in the body
    console.log(url);
  
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage(
        {width: 1920, height: 1080}
      );
      
      await page.goto(url);
  
      // Check if already logged in by checking for a specific element, for example, a logout button
      const isLoggedIn = false;
      // await page.evaluate(() => {
      //   return !!document.querySelector('selector-for-logged-in-element'); // Replace with actual selector
      // });
  
      if (!isLoggedIn) {
        // Perform login
        await page.type('input[name="Email"]', username); // Replace with actual input selector
        await page.type('input[name="password"]', password); // Replace with actual input selector
        await page.click('button[label="Login"]'); // Replace with actual button selector
        // wait for navigation after login dont use wait for navigation
      await page.screenshot({ path: 'example.png' });
      await page.waitForSelector('.form-fields ng-star-inserted', { timeout: 60000 }); // Replace with actual selector


        // await page.waitForSelector('app-side-nav-bar'); // Replace with actual selector
      }
  
      await page.screenshot({ path: 'example.png' });
      await browser.close();
  
      res.status(200).send('Screenshot taken successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
