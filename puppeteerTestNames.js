const fs = require('fs');
const path = require('path');
const readline = require('readline');

function puppeteerTestNames(extractionFolder, fileName) {
    return new Promise((resolve, reject) => {
        const logFilePath = path.join(extractionFolder, fileName, 'puppeteer', 'test.js'); // Adjust the path as per your file structure
        console.log("logFilePath: ", logFilePath);

        const puppeteerTestNames = new Set(); // Use a Set to store unique test names

        const rl = readline.createInterface({
            input: fs.createReadStream(logFilePath),
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            line = line.trim(); // Clean up any leading/trailing whitespace
            console.log("line: ", line);

            // Regex to match TESTCASE:test_case_name:failure or TESTCASE:test_case_name:success
            const testCaseRegex = /TESTCASE:(.*?):(failure|success)/;
            const match = testCaseRegex.exec(line);

            if (match) {
                const testName = match[1]; // Extract the test name
                puppeteerTestNames.add(testName); // Add to Set to ensure uniqueness
            }
        });

        rl.on('close', () => {
            const uniqueTestNames = Array.from(puppeteerTestNames); // Convert Set to array for return
            console.log("Extracted Puppeteer Test Names: ", uniqueTestNames);
            resolve(uniqueTestNames);  // Resolve the promise with the array of unique test names
        });

        rl.on('error', (error) => {
            console.error('Error reading file:', error);
            reject(error);  // Reject the promise if an error occurs
        });
    });
}

module.exports = { puppeteerTestNames };
