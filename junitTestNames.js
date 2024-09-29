const fs = require('fs');
const path = require('path');
const readline = require('readline');

function junitTestNames(extractionFolder, fileName) {
    return new Promise((resolve, reject) => {
        const junitTestPath = path.join(extractionFolder, fileName, 'junit', 'test', 'java', 'com', 'example', 'springapp', 'SpringappApplicationTests.java');
        console.log("junitTestPath: ", junitTestPath);

        const junitTestNames = [];
        let isTestAnnotation = false; // Flag to track when we've encountered a `@Test` annotation

        const rl = readline.createInterface({
            input: fs.createReadStream(junitTestPath),
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            line = line.trim(); // Clean up any leading/trailing whitespace
            // console.log("line: ", line);
            
            // Check for @Test annotation
            if (line.startsWith('@Test')) {
                isTestAnnotation = true; // Mark that we've found a `@Test` annotation
            } else if (isTestAnnotation) {
                // Look for method signature on the next line(s) after `@Test`
                const methodRegex = /\bvoid\s+(\w+)\s*\(/; // Match `void testMethodName()`
                const match = methodRegex.exec(line);

                if (match) {
                    const testName = match[1]; // Extract the test method name
                    junitTestNames.push(testName);
                    isTestAnnotation = false; // Reset the flag after capturing the method name
                }
            }
        });

        rl.on('close', () => {
            console.log("Extracted JUnit Test Names: ", junitTestNames);
            resolve(junitTestNames);  // Resolve the promise with the array of test names
        });

        rl.on('error', (error) => {
            console.error('Error reading file:', error);
            reject(error);  // Reject the promise if an error occurs
        });
    });
}

module.exports = { junitTestNames };
