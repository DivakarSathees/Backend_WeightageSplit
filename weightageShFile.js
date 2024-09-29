const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { junitTestNames } = require('./junitTestNames');
const { readAndStoreEchoStatements } = require('./shEchoStatements');
const { jestTestNames } = require('./jestTestNames');

async function processRunShFile(runShFilePath, evaluationTypeWeights, extractionFolder, fileName) {
    try {
      console.log("runShFilePath: ", runShFilePath);
      console.log("react " + runShFilePath.replace(/\\/g, '/').includes("/react/"));
      console.log("react " + runShFilePath.includes("\\react\\"));

      
      // if runShFilePath is junit/junit.sh, 
      if(runShFilePath.replace(/\\/g, '/').includes("/junit/"))        
      {
        echoStatements = await junitTestNames(extractionFolder, fileName);
        console.log("junitTestNames: ", echoStatements);
      }else if(runShFilePath.replace(/\\/g, '/').includes("/react/")){
        echoStatements = await jestTestNames(extractionFolder, fileName);
        console.log("echoStatements: ", echoStatements);        
      }else{
      echoStatements = await readAndStoreEchoStatements(runShFilePath);
      console.log("echoStatements: ", echoStatements);
    }
      
  
      // Determine the evaluation type based on the folder name
      const folderName = path.basename(path.dirname(runShFilePath));
      console.log("1"+folderName);
      let jsonObject;
      if(folderName == "karma")
      {
         jsonObject = {
          evaluation_type: "Karma", 
          testcases: [],
          testcase_run_command: `sh /home/coder/project/workspace/karma/karma.sh`, 
          testcase_path: '/home/coder/project/workspace/karma', 
        };
      }
      if(folderName == "nunit")
      {
         jsonObject = {
          evaluation_type: "NUnit", // Use the folder name as the evaluation type
          testcases: [],
          testcase_run_command: `sh /home/coder/project/workspace/nunit/run.sh`, 
          testcase_path: '/home/coder/project/workspace/nunit', 
        };
      }
      if(folderName == "junit")
      {
         jsonObject = {
          evaluation_type: "JUnit", // Use the folder name as the evaluation type
          testcases: [],
          testcase_run_command: `sh /home/coder/project/workspace/junit/junit.sh`, 
          testcase_path: '/home/coder/project/workspace/junit', 
        };
      }
      if(folderName == "react")
      {
         jsonObject = {
          evaluation_type: "Jest", // Use the folder name as the evaluation type
          testcases: [],
          testcase_run_command: `sh /home/coder/project/workspace/react/react.sh`, 
          testcase_path: '/home/coder/project/workspace/react', 
        };
      }
  
  
      // Calculate the weightage per test case for this evaluation type
      // const weightagePerTestCase = 1.0 / echoStatements.length;
      const weightagePerTestCase = 1.0 / echoStatements.length;
  
      // Set the weightages for test cases within this evaluation type
      for (const echoStatement of echoStatements) {
        jsonObject.testcases.push({
          name: echoStatement,
          weightage: weightagePerTestCase,
        });
      }
  
      // Normalize the weightages based on evaluation type weights
      const totalWeightage = evaluationTypeWeights[jsonObject.evaluation_type] || 0;
      if (totalWeightage === 0) {
        throw new Error(`Invalid evaluation type: ${jsonObject.evaluation_type}`);
      }
  
      for (const testcase of jsonObject.testcases) {
        testcase.weightage *= totalWeightage;
      }
  
      const jsonString = JSON.stringify(jsonObject, null, 2);
      // console.log(jsonString);
  
      return jsonString;
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  module.exports = { processRunShFile };