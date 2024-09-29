const fs = require('fs');
const path = require('path');
const readline = require('readline');

function jestTestNames(extractionFolder, fileName) {
    return new Promise((resolve, reject) => {
        const jestTestPath = path.join(extractionFolder, fileName,'react', 'tests', 'App.test.js');
        console.log("jestTestPath: ", jestTestPath);

        const jestTestNames = [];
        let insideDescribeBlock = false; // Track if we're inside a `describe` block

        const rl = readline.createInterface({
            input: fs.createReadStream(jestTestPath),
            crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
            line = line.trim(); // Clean up any leading/trailing whitespace
            console.log("line: ", line);
            
            // Check for 'describe' block, which groups test cases
            if (line.startsWith('describe')) {
                insideDescribeBlock = true;
            }

            // Check for 'test' or 'it' blocks inside a 'describe' block or standalone
            if (insideDescribeBlock || line.startsWith('test') || line.startsWith('it')) {
                const testRegex = /(test|it)\s*\(\s*['"`](.*?)['"`]/; // Match `test('testName'` or `it('testName'`
                const match = testRegex.exec(line);

                if (match) {
                    const testName = match[2]; // Extract the test name
                    jestTestNames.push(testName);
                }
            }

            // If we reach the end of a describe block, stop tracking
            if (line.startsWith('}')) {
                insideDescribeBlock = false;
            }
        });

        rl.on('close', () => {
            console.log("Extracted Jest Test Names: ", jestTestNames);
            resolve(jestTestNames);  // Resolve the promise with the array of test names
        });

        rl.on('error', (error) => {
            console.error('Error reading file:', error);
            reject(error);  // Reject the promise if an error occurs
        });
    });
}

module.exports = { jestTestNames };
