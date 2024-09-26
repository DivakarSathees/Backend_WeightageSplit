const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const fetch = require('node-fetch');
const apiKey = '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'; // Replace 'your_openai_api_key' with your actual API key


// async function Description(files, subfolderPath) {
//     let testContent = ``;
//     let modelCount = 1;
//     files.forEach((file) => {
//         testContent += `${file}\n`;
//         if(path.extname(file) === '.cs'){
//             // testContent += `This is a C# file\n`;
//             const filePath = path.join(subfolderPath, file);
//             const fileContent = fs.readFileSync(filePath, "utf8");
//             let dbContextMatch = fileContent.match(/public class (\w+) : DbContext/);
//             let ModelsnamespaceMatch = fileContent.match(/namespace (\w+\.Models)/);
//             let ControllernamespaceMatch = fileContent.match(/namespace (\w+\.Controllers)/);
//             if(ModelsnamespaceMatch && !dbContextMatch){
//                 const propertyRegex2 = /(\[.*?\])?\s*public (\w+) (\w+) { get; set; }/g;
//                 let classNameMatch = fileContent.match(/public class (\w+)/);
//                 const className = classNameMatch[1];
//                 testContent += `This file has a namespace: ${ModelsnamespaceMatch[1]}\n`;
//                 testContent += `Model:
// ${modelCount}. The model class name should be \"${className}\" with the following properties:\n`;
//                 modelCount++;
//                 let match3;
//                 while ((match3 = propertyRegex2.exec(fileContent)) !== null) {
//                     const annotation = match3[1] || 'No Annotation';
//                     const propertyName = match3[3];
//                     console.log('type',match3[2]);
//                     console.log('anno',match3[1]);
//                     if(match3[1] === 'Key' || match3[3].toLowerCase() === 'id' || match3[3].toLowerCase() === `${className}id`){
//                         testContent += `   • ${propertyName}: Unique identifier for the ${className} model with data type \"${match3[2]}\" (Should be auto-incremented)\n`;
//                     } else if(annotation.includes('Required')){
//                         const match = annotation.match(/Required(?:.*?ErrorMessage = "(.*?)")?/);
//                         if(match[1]){
//                             testContent += `   • ${propertyName}: Name of the ${className} model and should be required field with data type \"${match3[2]}\" with error message \"${match[1]}\"\n`;
//                         } else {
//                             testContent += `   • ${propertyName}: Name of the ${className} model and should be required field with data type \"${match3[2]}\"\n`;
//                         }
//                     } else if(annotation.includes('StringLength')){
//                         testContent += `   • ${propertyName}: Property of the ${className} model with a maximum length of \"${match3[1]}\" and data type \"${match3[2]}\"\n`;
//                     } else if(annotation.includes('ForeignKey')){
//                         testContent += `   • ${propertyName}: Property of the ${className} model with a foreign key and data type \"${match3[2]}\"\n`;
//                     } else if(annotation.includes('MaxLength')){                            
//                         const maxLengthMatch = annotation.match(/MaxLength\((\d+)(?:.*?ErrorMessage = "(.*?)")?\)/);
//                         if(maxLengthMatch[2]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a maximum length of \"${maxLengthMatch[1]}\" and data type \"${match3[2]}\" with error message \"${maxLengthMatch[2]}\"\n`;
//                         } else if(maxLengthMatch[1]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a maximum length of \"${maxLengthMatch[1]}\" and data type \"${match3[2]}\"\n`;
//                         }
//                     } else if(annotation.includes('MinLength')){
//                         const match = annotation.match(/MinLength\((\d+)(?:.*?ErrorMessage = "(.*?)")?\)/);
//                         if(match[2]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a minimum length of \"${match[1]}\" and data type \"${match3[2]}\" with error message \"${match[2]}\"\n`;
//                         } else if(match[1]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a minimum length of \"${match[1]}\" and data type \"${match3[2]}\"\n`;
//                         }
//                     } else if(annotation.includes('Range')){
//                         const match = annotation.match(/Range\((\d+), (\d+)(?:.*?ErrorMessage = "(.*?)")?\)/);
//                         if(match[3]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a range of \"${match[1]}\" to \"${match[2]}\" and data type \"${match3[2]}\" with error message \"${match[3]}\"\n`;
//                         } else if(match[1]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a range of \"${match[1]}\" to \"${match[2]}\" and data type \"${match3[2]}\".\n`;
//                         }
//                     } else if(annotation.includes('RegularExpression')){
//                         const regexMatch = annotation.match(/RegularExpression\(@"(.*?)".*?ErrorMessage = "(.*?)"/);
//                         if(regexMatch[2]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a regular expression of \"${regexMatch[1]}\" and data type \"${match3[2]}\" with error message \"${regexMatch[2]}\"\n`;
//                         } else if(regexMatch[1]){
//                             testContent += `   • ${propertyName}: Property of the ${className} model with a regular expression of \"${regexMatch[1]}\" and data type \"${match3[2]}\"\n`;
//                         }
//                     } else if(annotation.includes('DataType')){    
//                         testContent += `   • ${propertyName}: Property of the ${className} model with a data type of \"${match3[1]}\" and data type ${match3[2]}\n`;
//                     } else {
//                         testContent += `   • ${propertyName}: Property of the ${className} model with data type \"${match3[2]}\"\n`;
//                     }
//                 }                
//             }
//             else if(dbContextMatch){
//                 const dbContextName = dbContextMatch[1];
                
//                 testContent += `This file has a DbContext class: ${dbContextName}\n`;
//                 testContent += `${modelCount}. ${dbContextName}:
//     • The ${dbContextName} class should be created in ${ModelsnamespaceMatch[1].split('.')[1]} folder with namespace ${ModelsnamespaceMatch[1]}.
//     • Define a DbSet for the`;
//                 const propertyRegex = /public DbSet<(\w+)> (\w+) { get; set; }/g;
//                 let match;
//                 let dbSets = [];

//                 while ((match = propertyRegex.exec(fileContent)) !== null) {
//                     const dbSetName = match[2];
//                     const dbSetType = match[1];
//                     dbSets.push({dbSetType, dbSetName});
//                 }
//                 if(dbSets.length === 1){
//                     testContent += ` table`;
//                 } else {
//                     testContent += ` tables`;
//                 }
//                 for(let i = 0; i < dbSets.length; i++){
//                     if(i === dbSets.length - 1){
//                         testContent += `and ${dbSets[i].dbSetName}) `;
//                     } else if(dbSets.length != 1){
//                         testContent += `(${dbSets[i].dbSetName}, `;
//                     } else {
//                         testContent += `(${dbSets[i].dbSetName}) `;
//                     }
//                 }
//                 testContent += `in the ${dbContextName} class.\n`;                
//             }
//             else if(ControllernamespaceMatch){
//                 const controllerNameMatch = fileContent.match(/public class (\w+)/);
//                 const controllerName = controllerNameMatch[1];
//                 testContent += `This file has a namespace: ${ControllernamespaceMatch[1]}\n`;
//                 testContent += `${modelCount}. ${controllerName}:`;
//                 testContent += `The controller class name should be \"${controllerName}\" with the following Methods:\n`;
//                 modelCount++;
//                 const methodRegex = /public (\w+) (\w+)\((.*?)\)/g;
//                 let match;
//                 let methods = [];
//                 while ((match = methodRegex.exec(fileContent)) !== null) {
//                     const methodName = match[2];
//                     const methodType = match[1];
//                     const methodParams = match[3];
//                     methods.push({methodType, methodName, methodParams});
//                     console.log('method',methods);
//                 }
//             }
//         }
//     });
//     const testFileName = `description.txt`;
//     fs.writeFileSync(testFileName, testContent);
// }

// async function Description(files, subfolderPath) {
//     // console.log('files',files);
//     // console.log('subfolderPath',subfolderPath);
//     try{
//     let testContent = ``;
//     let modelCount = 1;
//     const descriptions = [];
//     // await Promise.all(files.map(async (file) => {
//       await Promise.all(files.map(async (file) => {
//         testContent += `${file}\n`;
//         if(path.extname(file) === '.cs'){
//             // testContent += `This is a C# file\n`;
//             const filePath = path.join(subfolderPath, file);
//             const fileContent = fs.readFileSync(filePath, "utf8");
//             let dbContextMatch = fileContent.match(/public class (\w+) : DbContext/);
//             let ModelsnamespaceMatch = fileContent.match(/namespace (\w+\.Models)/);
//             let ControllernamespaceMatch = fileContent.match(/namespace (\w+\.Controllers)/);
//             if(ModelsnamespaceMatch && !dbContextMatch){
//                 const classRegex = /public class (\w+)\s*{([^}]+)}/;
//                 const match = fileContent.match(classRegex);
//                 // console.log('match',match);

//                 if (!match) {
//                     console.error('Class structure not found in the file.');
//                     // continue; // Skip to the next file
//                 }

//                 const className = match[1];
//                 // console.log("Class Name:", className); 

//                 // regex to extract attributes from class
//                 const attributeRegex = /((?:\[\w+(?:\([^\)]*\))?\]\s*)*)public\s+([^\s]+)\s+(\w+)/g; 

//                 let attributeMatch;
//                 const classAttributes = [];

//                 while ((attributeMatch = attributeRegex.exec(fileContent)) !== null) {
//                     const annotations = attributeMatch[1]
//                         ? attributeMatch[1].match(/\[\w+(?:\([^\)]*\))?\]/g)
//                         : [];
//                     classAttributes.push({
//                         name: attributeMatch[3].trim(), // Extract attribute name
//                         annotations: annotations, // Extract annotations
//                         datatype: attributeMatch[2].trim() // Extract datatype
//                     });
//                 }

//                 const description = await generateClassDescription(className, classAttributes)
//                 descriptions.push(description);
//                 console.log('descriptions');
//                 console.log(descriptions[0].description.message);
//                 console.log(descriptions);
//                 // // return {descriptions};
//             }
//             else if(filePath.includes('Controller'))
//             {
//                 const data = await fs.promises.readFile(filePath, 'utf8');

//                 // fs.readFile(filePath, 'utf8', async (err, data) => {
//                 //     if (err) {
//                 //       console.error('Error reading file:', err);
//                 //       return;
//                 //     }
//                     const dataWithoutComments = data.replace(/\/\/.*$/gm, '');
                  
//                     // Extract controller name
//                     const controllerRegex = /public class (\w+)Controller/;
//                     const controllerMatch = dataWithoutComments.match(controllerRegex);
//                     const controllerName = controllerMatch ? controllerMatch[1] : 'Not found';
                  
//                     // Extract controller route
//                     const controllerRouteRegex = /\[Route\("([^"]+)"\)\]/;
//                     const controllerRouteMatch = dataWithoutComments.match(controllerRouteRegex);
//                     const controllerRoute = controllerRouteMatch ? controllerRouteMatch[1] : 'Not found';
                  
//                     // Extract method types, names, endpoints and status codes
//                     // const methodRegex = /(\[Http\w+\])?\s+public (?:async Task<.*?>|IActionResult|ActionResult) (\w+)\(([\s\S]*?)\)\s*\{([\s\S]*?)\}/g;
//                     const methodRegex = /(\[Http\w+\])?\s+public (?:async Task<.*?>|IActionResult|ActionResult) (\w+)\(([\s\S]*?)\)\s*\{/g;
                  
//                     let methodMatch;
//                     const methods = [];
//                     // while ((methodMatch = methodRegex.exec(dataWithoutComments)) !== null) {
//                     //   const methodStartIndex = methodMatch.index + methodMatch[0].length;
//                     //   let braceCount = 1;
//                     //   let i = methodStartIndex;
//                     //   while (braceCount > 0 && i < data.length) {
//                     //     if (data[i] === '{') {
//                     //       braceCount++;
//                     //     } else if (data[i] === '}') {
//                     //       braceCount--;
//                     //     }
//                     //     i++;
//                     //   }
//                     //   const methodBody = data.slice(methodStartIndex, i - 1);
//                     //   // console.log('Method body:', methodBody);
//                     // }
//                     while ((methodMatch = methodRegex.exec(dataWithoutComments)) !== null) {
//                       console.log(methodMatch[4]);
//                       const method = {
//                         type: methodMatch[1] ? methodMatch[1].replace('[', '').replace(']', '') : 'Not specified',
//                         name: methodMatch[2],
//                         endpoint: `${controllerRoute}`,
//                         statusCodes: [],
//                         parameters: methodMatch[3] ? methodMatch[3].split(',').map(param => param.trim()).filter(param => param) : 'Not specified',
//                         returns: []
//                       };
                  
//                       // const methodBody = methodMatch[4];
//                       // console.log(methodBody);
//                       const methodStartIndex = methodMatch.index + methodMatch[0].length;
//                       let braceCount = 1;
//                       let i = methodStartIndex;
//                       while (braceCount > 0 && i < dataWithoutComments.length) {
//                         if (dataWithoutComments[i] === '{') {
//                           braceCount++;
//                         } else if (dataWithoutComments[i] === '}') {
//                           braceCount--;
//                         }
//                         i++;
//                       }
//                       const methodBody = dataWithoutComments.slice(methodStartIndex, i - 1);
//                       console.log('Method body:', methodBody);
                  
//                       const returnRegex = /return (Ok|BadRequest|CreatedAtAction|StatusCode|NotFound)\(/g;
//                       let returnMatch;
//                       while ((returnMatch = returnRegex.exec(methodBody)) !== null) {
//                         const returnStartIndex = returnMatch.index + returnMatch[0].length;
//                         let parenCount = 1;
//                         let i = returnStartIndex;
//                         while (parenCount > 0 && i < methodBody.length) {
//                           if (methodBody[i] === '(') {
//                             parenCount++;
//                           } else if (methodBody[i] === ')') {
//                             parenCount--;
//                           }
//                           i++;
//                         }
//                         const returnContent = methodBody.slice(returnStartIndex, i - 1);
//                         method.statusCodes.push(`${returnMatch[1]} ${returnContent}`);
//                           }
                  
//                           const returnRegex1 = /return (View|RedirectToAction)\(/g;
//                           let returnMatch1;
//                           while ((returnMatch1 = returnRegex1.exec(methodBody)) !== null) {
//                             const returnStartIndex = returnMatch1.index + returnMatch1[0].length;
//                             let parenCount = 1;
//                             let i = returnStartIndex;
//                             while (parenCount > 0 && i < methodBody.length) {
//                               if (methodBody[i] === '(') {
//                                 parenCount++;
//                               } else if (methodBody[i] === ')') {
//                                 parenCount--;
//                               }
//                               i++;
//                             }
//                             const returnContent = methodBody.slice(returnStartIndex, i - 1);
//                             method.returns.push(`${returnMatch1[1]} ${returnContent}`);
//                               }
                  
//                       methods.push(method);
//                     }
//                     const description = await generateControllerDescription(controllerName, methods)
//                     descriptions.push(description);
//                     console.log('descriptions123',descriptions);
//                     // return {descriptions}

//                     // generateControllerDescription(controllerName, methods)
//                     // .then(description => console.log(description))
//                     // .catch(error => console.error('Error:', error));
//                 //   });
//                   console.log("asd"+ descriptions);
//                 //   return {descriptions}

//             }
//         }
//     console.log('descriptions1',descriptions);
//     // return { descriptions };
//     }
//     ))
//     return { descriptions };

//     // console.log('descriptions1',descriptions);
//     // wait till descriptions are generated for all files and then return desc
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
//     // const testFileName = `description.txt`;
//     // fs.writeFileSync(testFileName, testContent);
// }

async function Description(files, subfolderPath) {
    try {
        let testContent = ``;
        let modelCount = 1;
        const descriptions = [];

        await Promise.all(files.map(async (file) => {
            testContent += `${file}\n`;
            if (path.extname(file) === '.cs') {
                const filePath = path.join(subfolderPath, file);
                const fileContent = fs.readFileSync(filePath, "utf8");
                let dbContextMatch = fileContent.match(/public class (\w+) : DbContext/);
                let ModelsnamespaceMatch = fileContent.match(/namespace (\w+\.Models)/);
                let ControllernamespaceMatch = fileContent.match(/namespace (\w+\.Controllers)/);
                if (ModelsnamespaceMatch && !dbContextMatch) {
                    const classRegex = /public class (\w+)\s*{([^}]+)}/;
                    const match = fileContent.match(classRegex);

                    if (!match) {
                        console.error('Class structure not found in the file.');
                    } else {
                        const className = match[1];
                        const attributeRegex = /((?:\[\w+(?:\([^\)]*\))?\]\s*)*)public\s+([^\s]+)\s+(\w+)/g;
                        let attributeMatch;
                        const classAttributes = [];

                        while ((attributeMatch = attributeRegex.exec(fileContent)) !== null) {
                            const annotations = attributeMatch[1] ? attributeMatch[1].match(/\[\w+(?:\([^\)]*\))?\]/g) : [];
                            classAttributes.push({
                                name: attributeMatch[3].trim(),
                                annotations: annotations,
                                datatype: attributeMatch[2].trim()
                            });
                        }

                        const description = await generateClassDescription(className, classAttributes);
                        descriptions.push(description);
                        console.log('Class description:', description);
                    }
                } 
                if (filePath.includes('Controller')) {
                    const data = await fs.promises.readFile(filePath, 'utf8');
                    const dataWithoutComments = data.replace(/\/\/.*$/gm, '');

                    const controllerRegex = /public class (\w+)Controller/;
                    const controllerMatch = dataWithoutComments.match(controllerRegex);
                    const controllerName = controllerMatch ? controllerMatch[1] : 'Not found';

                    const controllerRouteRegex = /\[Route\("([^"]+)"\)\]/;
                    const controllerRouteMatch = dataWithoutComments.match(controllerRouteRegex);
                    const controllerRoute = controllerRouteMatch ? controllerRouteMatch[1] : 'Not found';

                    const methodRegex = /(\[Http\w+\])?\s+public (?:async Task<.*?>|IActionResult|ActionResult) (\w+)\(([\s\S]*?)\)\s*\{/g;
                    let methodMatch;
                    const methods = [];

                    while ((methodMatch = methodRegex.exec(dataWithoutComments)) !== null) {
                        const method = {
                            type: methodMatch[1] ? methodMatch[1].replace('[', '').replace(']', '') : 'Not specified',
                            name: methodMatch[2],
                            endpoint: `${controllerRoute}`,
                            statusCodes: [],
                            parameters: methodMatch[3] ? methodMatch[3].split(',').map(param => param.trim()).filter(param => param) : 'Not specified',
                            returns: []
                        };

                        const methodStartIndex = methodMatch.index + methodMatch[0].length;
                        let braceCount = 1;
                        let i = methodStartIndex;

                        while (braceCount > 0 && i < dataWithoutComments.length) {
                            if (dataWithoutComments[i] === '{') {
                                braceCount++;
                            } else if (dataWithoutComments[i] === '}') {
                                braceCount--;
                            }
                            i++;
                        }

                        const methodBody = dataWithoutComments.slice(methodStartIndex, i - 1);

                        const returnRegex = /return (Ok|BadRequest|CreatedAtAction|StatusCode|NotFound)\(/g;
                        let returnMatch;

                        while ((returnMatch = returnRegex.exec(methodBody)) !== null) {
                            const returnStartIndex = returnMatch.index + returnMatch[0].length;
                            let parenCount = 1;
                            let i = returnStartIndex;

                            while (parenCount > 0 && i < methodBody.length) {
                                if (methodBody[i] === '(') {
                                    parenCount++;
                                } else if (methodBody[i] === ')') {
                                    parenCount--;
                                }
                                i++;
                            }

                            const returnContent = methodBody.slice(returnStartIndex, i - 1);
                            method.statusCodes.push(`${returnMatch[1]} ${returnContent}`);
                        }

                        const returnRegex1 = /return (View|RedirectToAction)\(/g;
                        let returnMatch1;

                        while ((returnMatch1 = returnRegex1.exec(methodBody)) !== null) {
                            const returnStartIndex = returnMatch1.index + returnMatch1[0].length;
                            let parenCount = 1;
                            let i = returnStartIndex;

                            while (parenCount > 0 && i < methodBody.length) {
                                if (methodBody[i] === '(') {
                                    parenCount++;
                                } else if (methodBody[i] === ')') {
                                    parenCount--;
                                }
                                i++;
                            }

                            const returnContent = methodBody.slice(returnStartIndex, i - 1);
                            method.returns.push(`${returnMatch1[1]} ${returnContent}`);
                        }

                        methods.push(method);
                    }

                    const description = await generateControllerDescription(controllerName, methods);
                    descriptions.push(description);
                    console.log('Controller description:', description);
                }
            }
        }));

        return { descriptions };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


async function generateClassDescription(className, classAttributes) {
    console.log('classAttributes',classAttributes);
    console.log('className',className);
    try {
        // await delay(5000);

      const response = await fetch('https://api.openai.com/v1/chat/completions',{
          method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model: "gpt-3.5-turbo-16k", // You can choose the GPT model you prefer
      messages: [
          { role: "system", content: `Generate a description for the class ${className} with attributes:` },
          { role: "user", content: classAttributes.map(attr => `- ${attr.name}${attr.datatype}${attr.annotations.length > 0 ? ` (Annotations: ${attr.annotations.join(', ')})` : ''}`).join('\n') },
          { role: "assistant", content: "Description:" }
      ],
      max_tokens: 1000
      }),
      timeout: 15000
  });
      if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
      const completion = await response.json();
      console.log(completion.choices[0]);
  // return in the format of { className, description }
    return { className, description: completion.choices[0] };
    //   return completion.choices[0]
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function generateControllerDescription(controllerName, methods) {
    try {
        await delay(1000);
        console.log('controllerName',controllerName);
        console.log('methods',methods);
      console.log( methods.map(method => `method name - ${method.name}, Parameter - ${method.parameters}, ${method.type != 'Not specified' ? `Type - ${method.type}` : ""}
      ${method.statusCodes && method.statusCodes.length > 0 ? `, Status Codes - ${method.statusCodes}` : ''} ${method.endpoint ? `, Endpoint - ${method.endpoint}` : ""}
      ${method.returns && method.returns.length > 0 ? `, Returns - ${method.returns}` : ''}
      `).join('\n'));
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-16k",
                messages: [
                    { role: "system", content: `Generate a description for the controller ${controllerName} and its methods:` },
                    { role: "user", content: methods.map(method => `method name - ${method.name}, Parameter - ${method.parameters}, ${method.type != 'Not specified' ? `Type - ${method.type}` : ""}
                    ${method.statusCodes && method.statusCodes.length > 0 ? `, Status Codes - ${method.statusCodes}` : ''} ${method.endpoint ? `, Endpoint - ${method.endpoint}` : ""}
                    ${method.returns && method.returns.length > 0 ? `, Returns - ${method.returns}` : ''}
                    `).join('\n') },
                    { role: "assistant", content: "Description:" }
                ],
                max_tokens: 1000
            }),
            timeout: 15000
        });
  
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const completion = await response.json();
        return { controllerName, description: completion.choices[0] };

        // return completion.choices[0]; // Extract generated description
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


module.exports = Description;