const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

async function modelsTest(files, subfolderPath) {
    let testContent = `using System.Numerics;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace TestProject
{
  public class Tests
  {
`;
    const classNames = [];
    files.forEach((file) => {
      const modelProps = [];
      if (path.extname(file) === '.cs') {
        const filePath = path.join(subfolderPath, file);
        // //console.log(filePath);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let dbContextMatch = fileContent.match(/public class (\w+) : DbContext/);
        let ModelsnamespaceMatch = fileContent.match(/namespace (\w+\.Models)/);
        let ControllersnamespaceMatch = fileContent.match(/namespace (\w+\.Controllers)/);
        let classNameMatch = fileContent.match(/public class (\w+)/);
        let namespaceMatch = fileContent.match(/namespace (\w+)/);
        let dbContext = dbContextMatch ? dbContextMatch[1] : 'UnknownDbContext';
        // //console.log('DbContext:', dbContext);
        const namespace = namespaceMatch ? namespaceMatch[1] : 'UnknownNamespace';
        let Modelsnamespace;
        let dbContextName;
        // //console.log(ModelsnamespaceMatch );
        if(ModelsnamespaceMatch && !dbContextMatch){
          //console.log("hai");
            Modelsnamespace = ModelsnamespaceMatch[1];
        }else if(ControllersnamespaceMatch){
            Modelsnamespace = ControllersnamespaceMatch[1];
        }else{
          //console.log("bye");
            Modelsnamespace = dbContext;
        }
        //console.log('Modelsnamespace:', Modelsnamespace);
        // const Modelsnamespace = ModelsnamespaceMatch ? ModelsnamespaceMatch[1] : ControllersnamespaceMatch[1] || 'UnknownNamespace';
        const className = classNameMatch ? classNameMatch[1] : 'UnknownClass';
        // //console.log('Class name:', className);
        const classType = Modelsnamespace.split('.').pop();
        // //console.log('Class type:', classType); 
        //console.log("classnAME: " + className);
        classNames.push({className});
        //console.log("Class Names: " + classNames[0].className);
  
        if(classType == "Models" || classType == "Controllers")
        {
        const usingStatements = `using ${Modelsnamespace};`;
          const lines = testContent.split('\n');
  
          if (!lines.includes(usingStatements)) {
              lines.splice(1, 0, usingStatements);
              testContent = lines.join('\n');
          }
        }

        if(classType == "Models" || classType == "Controllers")
        {           
  
        let classTestMethod = `
    // Test to check whether ${className} ${classType} Class exists
    [Test]
    public void ${className}_${classType}_ClassExists()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);
      Type ${className}Type = assembly.GetType(typeName);
      Assert.IsNotNull(${className}Type);
    }
    `;
      testContent += classTestMethod; 
    }

    if (Modelsnamespace.slice(-7).toLowerCase() === "context") {
      //console.log("DbContext: " + Modelsnamespace.slice(-7).toLowerCase());
      
      const regex = /public DbSet<(.+?)> (\w+) { get; set; }/g; // Note the 'g' flag for global matching

      const modelNames = [];
      // //console.log("File Content: " + fileContent);

      let match;
      while ((match = regex.exec(fileContent)) !== null) {
        const modelName = match[1];
        const modelType = match[2];
        modelNames.push({modelName, modelType});
      }

      //console.log("Model Names: " + modelNames[0].modelName);
      //console.log("Model Names: " + modelNames[0].modelType);
      modelNames.forEach(model=> {
      let classTestMethod = `
    // Test to check that ${Modelsnamespace} Contains DbSet for model ${model.modelName}
    [Test]
    public void ${Modelsnamespace}_ContainsDbSet_${model.modelName}()
    {
        Assembly assembly = Assembly.GetAssembly(typeof(${Modelsnamespace}));
        Type contextType = assembly.GetTypes().FirstOrDefault(t => typeof(DbContext).IsAssignableFrom(t));
        if (contextType == null)
        {
            Assert.Fail("No DbContext found in the assembly");
            return; 
        }
        Type ${model.modelName}Type = assembly.GetTypes().FirstOrDefault(t => t.Name == "${model.modelName}");
        if (${model.modelName}Type == null)
        {
            Assert.Fail("No DbSet found in the DbContext");
            return; 
        }
        var propertyInfo = contextType.GetProperty("${model.modelType}");
        if (propertyInfo == null)
        {
            Assert.Fail("${model.modelType} property not found in the DbContext");
            return; 
        }
        else
        {
          Assert.AreEqual(typeof(DbSet<>).MakeGenericType(${model.modelName}Type), propertyInfo.PropertyType);
        }
    }
    `;
  testContent += classTestMethod;
});

        


// Print the extracted model names

    //     let classTestMethod = `
    // [Test]
    // public void ${Modelsnamespace}_ContainsDbSet_${className}()
    // {
    //     Assembly assembly = Assembly.GetAssembly(typeof(${Modelsnamespace}));
    //     Type ${Modelsnamespace}Type = assembly.GetTypes().FirstOrDefault(t => typeof(DbContext).IsAssignableFrom(t));
    //     if (${Modelsnamespace}Type != null)
    //     {
    //         Assert.Fail("No DbContext found in the assembly");
    //         return; 
    //     }
    //     Type ${className}Type = assembly.GetTypes().FirstOrDefault(t => t.Name == "${className}");
    // }
    // `;
    }      
      if(classType == "Models")
      {
        const propertyRegex = /public (\w+) (\w+) { get; set; }/g;
        // const propertyRegex = /public (\w+(?:<\w+>)?) (\w+) { get; set; }/g;
  
        let propertyMatches;
        const properties = [];
        while ((propertyMatches = propertyRegex.exec(fileContent)) !== null) {
          const type = propertyMatches[1];
          const name = propertyMatches[2];
          properties.push({ type, name });
          modelProps.push({name});
        }
        modelProps.forEach(property => {
          //console.log("propname"+property.name);
        })

        
        properties.forEach(property => {
          let propertyTestMethod = `
    // Test to Check ${className} ${classType} Property ${property.name} Exists with correcct datatype ${property.type}    
    [Test]
    public void ${className}_${property.name}_PropertyExists_ReturnExpectedDataTypes_${property.type}()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);
      Type ${className}Type = assembly.GetType(typeName);
      PropertyInfo propertyInfo = ${className}Type.GetProperty("${property.name}");
      Assert.IsNotNull(propertyInfo,"Property ${property.name} does not exist in ${className} class");
      Type expectedType = propertyInfo.PropertyType;
      Assert.AreEqual(typeof(${property.type}), expectedType, "Property ${property.name} in ${className} class is not of type ${property.type}");
    }
    `;
      testContent += propertyTestMethod;
        });
      }
      //console.log("Class Type: " + classType);

      if (classType === "Controllers") {
        const methodNameRegex = /\bpublic\s+(\w+)\s+(\w+)\s*\(([^)]*)\)/g;
        const methodNameRegex1 = /\bpublic\s+async\s+Task<(.+?)>\s+(\w+)\s*\(([^)]*)\)/g;
        let match;
        const methods = [];
        while ((match = methodNameRegex1.exec(fileContent)) !== null) {
            const methodName = match[2];
            const result = match[1];
            const paramsType = match[3];
            //console.log(`Method Type: ${paramsType}`);
            //console.log(`Method Name: ${match[3]}`);
            //console.log(`Return Name: ${match[1]}`);
            methods.push({ methodName, result, paramsType });
        }
        while ((match = methodNameRegex.exec(fileContent)) !== null) {
            const methodName = match[2];
            const paramsType = match[3];
            const result = match[1];
            //console.log(`Method Type: ${paramsType}`);
            //console.log(`Method Name: ${match[3]}`);
            //console.log(`return type: ${match[1]}`);
            methods.push({ methodName, result, paramsType });
        }
        methods.forEach(methods => {
        //console.log("Methods: " + methods.methodName);
        let methodTestMethod = `
    // Test to Check ${className} ${classType} Method ${methods.methodName} Exists
    [Test]
    public void ${className}_${methods.methodName}_MethodExists()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);
      Type ${className}Type = assembly.GetType(typeName);
      MethodInfo methodInfo = ${className}Type.GetMethod("${methods.methodName}");
      Assert.IsNotNull(methodInfo,"Method ${methods.methodName} does not exist in ${className} class");
    }

    // Test to Check ${className} ${classType} Method ${methods.methodName} Returns ${methods.result}
    [Test]
    public void ${className}_${methods.methodName}_MethodReturns_${methods.result}()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);
      Type ${className}Type = assembly.GetType(typeName);
      MethodInfo methodInfo = ${className}Type.GetMethod("${methods.methodName}");
      Assert.AreEqual(typeof(${methods.result}), methodInfo.ReturnType, "Method ${methods.methodName} in ${className} class is not of type ${methods.result}");
    }
    `;    
      testContent += methodTestMethod;   
//console.log("Params Type: " + methods.paramsType);
      
      if(methods.paramsType == '' || methods.paramsType == undefined){
        let methodTestMethod = `
    // Test to Check ${className} ${classType} Method ${methods.methodName} with no parameter Returns ${methods.result}
    [Test]
    public void ${className}_${methods.methodName}_Method_with_NoParams_Returns_${methods.result}()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);
      Type ${className}Type = assembly.GetType(typeName);
      MethodInfo methodInfo = ${className}Type.GetMethod("${methods.methodName}", Type.EmptyTypes);
      Assert.AreEqual(typeof(${methods.result}), methodInfo.ReturnType, "Method ${methods.methodName} in ${className} class is not of type ${methods.result}");
    }
    `
    testContent += methodTestMethod;   
      }
// //console.log("Params Type: " + methods.paramsType);
      else if(methods.paramsType != ''){
        let words = methods.paramsType.split(' ');
        //console.log("Params: ", words);
        let word = [];
        for(let i=0; i<words.length; i++){
          if(words[i] == "string" || words[i] == "int" || words[i] == "bool" || words[i] == "float" || words[i] == "double" || words[i] == "decimal" || words[i] == "char" || words[i] == "long" || words[i] == "short" || words[i] == "byte" || words[i] == "object" || words[i] == "uint" || words[i] == "ulong" || words[i] == "ushort" || words[i] == "sbyte" || words[i] == "DateTime" || words[i] == "DateTimeOffset" || words[i] == "TimeSpan" || words[i] == "Guid" || words[i] == "BigInteger"){
            word.push(words[i]);
          }
          else {
            //console.log("Class Names123: ", classNames.length);
            for(let j=0; j<classNames.length; j++){
              if(words[i] == classNames[j].className){
                word.push(words[i]);
              }
            }
          }
        }
        //console.log("Word: ", word);
        if(word.length == 1){
        for(let i=0; i<word.length; i++){
          // if(word[i] == "string" || word[i] == "int" || word[i] == "bool" || word[i] == "float" || word[i] == "double" || word[i] == "decimal" || word[i] == "char" || word[i] == "long" || word[i] == "short" || word[i] == "byte" || word[i] == "object" || word[i] == "uint" || word[i] == "ulong" || word[i] == "ushort" || word[i] == "sbyte" || word[i] == "DateTime" || word[i] == "DateTimeOffset" || word[i] == "TimeSpan" || word[i] == "Guid" || word[i] == "BigInteger"){
            let methodTestMethod = `
    // Test to Check ${className} ${classType} Method ${methods.methodName} with parameter ${word[i]} Returns ${methods.result}
    [Test]
    public void ${className}_${methods.methodName}_Method_Invokes_with_${word[i]}_Param_Returns_${methods.result}()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);`;
      if(word[i] != "string" && word[i] != "int" && word[i] != "bool" && word[i] != "float" && word[i] != "double" && word[i] != "decimal" && word[i] != "char" && word[i] != "long" && word[i] != "short" && word[i] != "byte" && word[i] != "object" && word[i] != "uint" && word[i] != "ulong" && word[i] != "ushort" && word[i] != "sbyte" && word[i] != "DateTime" && word[i] != "DateTimeOffset" && word[i] != "TimeSpan" && word[i] != "Guid" && word[i] != "BigInteger"){
        methodTestMethod += `
      string typeName1 = "${namespace}.Models.${word[i]}";
      Type ${word[i]}Type = assembly.GetType(typeName1);
      object instance1 = Activator.CreateInstance(${word[i]}Type);`;
      }
      methodTestMethod += `
      Type ${className}Type = assembly.GetType(typeName);
      object instance = Activator.CreateInstance(${className}Type);
      MethodInfo methodInfo = ${className}Type.GetMethod("${methods.methodName}", new Type[] { `;
      //console.log("Word1152: ", word[i]);
      if(word[i] != "string" && word[i] != "int" && word[i] != "bool" && word[i] != "float" && word[i] != "double" && word[i] != "decimal" && word[i] != "char" && word[i] != "long" && word[i] != "short" && word[i] != "byte" && word[i] != "object" && word[i] != "uint" && word[i] != "ulong" && word[i] != "ushort" && word[i] != "sbyte" && word[i] != "DateTime" && word[i] != "DateTimeOffset" && word[i] != "TimeSpan" && word[i] != "Guid" && word[i] != "BigInteger"){
        methodTestMethod += ` ${word[i]}Type });
      object result = methodInfo.Invoke(instance, new object[] { instance1 });`;
      }
      if(word[i] == "string" || word[i] == "int" || word[i] == "bool" || word[i] == "float" || word[i] == "double" || word[i] == "decimal" || word[i] == "char" || word[i] == "long" || word[i] == "short" || word[i] == "byte" || word[i] == "object" || word[i] == "uint" || word[i] == "ulong" || word[i] == "ushort" || word[i] == "sbyte" || word[i] == "DateTime" || word[i] == "DateTimeOffset" || word[i] == "TimeSpan" || word[i] == "Guid" || word[i] == "BigInteger"){
        //console.log("Wordint: ", word[i]);
        methodTestMethod += ` typeof(${word[i]}) });
      object result = methodInfo.Invoke(instance, new object[] { default(${word[i]}) });`;
      }
      
      methodTestMethod += `
      Assert.IsNotNull(result, "Result should not be null");
    }
      `;
      testContent += methodTestMethod;   
          // }
        }
      }
      if(word.length > 1){
        let length = word.length;
        let methodTestMethod = `
    // Test to Check ${className} ${classType} Method ${methods.methodName} with parameters`;
        for(let i=0; i<length; i++){
          if(i==length-1){
            methodTestMethod += ` ${word[i]}`;
          }else{
            methodTestMethod += ` ${word[i]} and`;
          }
        }
        methodTestMethod += ` Returns ${methods.result}
    [Test]
    public void ${className}_${methods.methodName}_Method_Invokes_with`;
        for(let i=0; i<length; i++){
          if(i==length-1){
            methodTestMethod += `_${word[i]}_Params`;
          }else{
            methodTestMethod += `_${word[i]}_and`;
          }
        }
        methodTestMethod += `_Returns_${methods.result}()
    {
      string assemblyName = "${namespace}";
      string typeName = "${Modelsnamespace}.${className}";
      Assembly assembly = Assembly.Load(assemblyName);`;
      for(let i=0; i<length; i++){
        if(word[i] != "string" && word[i] != "int" && word[i] != "bool" && word[i] != "float" && word[i] != "double" && word[i] != "decimal" && word[i] != "char" && word[i] != "long" && word[i] != "short" && word[i] != "byte" && word[i] != "object" && word[i] != "uint" && word[i] != "ulong" && word[i] != "ushort" && word[i] != "sbyte" && word[i] != "DateTime" && word[i] != "DateTimeOffset" && word[i] != "TimeSpan" && word[i] != "Guid" && word[i] != "BigInteger"){
          methodTestMethod += `
      string typeName${i} = "${namespace}.Models.${word[i]}";
      Type ${word[i]}Type = assembly.GetType(typeName${i});
      object instance${i} = Activator.CreateInstance(${word[i]}Type);`;
        }
      }
      methodTestMethod += `      
      Type ${className}Type = assembly.GetType(typeName);
      object instance = Activator.CreateInstance(${className}Type);
      MethodInfo methodInfo = ${className}Type.GetMethod("${methods.methodName}", new Type[] {`;
          for(let i=0; i<length; i++){
            if(i==length-1){
              if(word[i] != "string" && word[i] != "int" && word[i] != "bool" && word[i] != "float" && word[i] != "double" && word[i] != "decimal" && word[i] != "char" && word[i] != "long" && word[i] != "short" && word[i] != "byte" && word[i] != "object" && word[i] != "uint" && word[i] != "ulong" && word[i] != "ushort" && word[i] != "sbyte" && word[i] != "DateTime" && word[i] != "DateTimeOffset" && word[i] != "TimeSpan" && word[i] != "Guid" && word[i] != "BigInteger"){
                methodTestMethod += ` ${word[i]}Type });`;
              }
              if(word[i] == "string" || word[i] == "int" || word[i] == "bool" || word[i] == "float" || word[i] == "double" || word[i] == "decimal" || word[i] == "char" || word[i] == "long" || word[i] == "short" || word[i] == "byte" || word[i] == "object" || word[i] == "uint" || word[i] == "ulong" || word[i] == "ushort" || word[i] == "sbyte" || word[i] == "DateTime" || word[i] == "DateTimeOffset" || word[i] == "TimeSpan" || word[i] == "Guid" || word[i] == "BigInteger"){
                methodTestMethod += ` typeof(${word[i]}) });`;
              }
              // methodTestMethod += ` typeof(${word[i]}) });`;
            }else{
              if(word[i] != "string" && word[i] != "int" && word[i] != "bool" && word[i] != "float" && word[i] != "double" && word[i] != "decimal" && word[i] != "char" && word[i] != "long" && word[i] != "short" && word[i] != "byte" && word[i] != "object" && word[i] != "uint" && word[i] != "ulong" && word[i] != "ushort" && word[i] != "sbyte" && word[i] != "DateTime" && word[i] != "DateTimeOffset" && word[i] != "TimeSpan" && word[i] != "Guid" && word[i] != "BigInteger"){
                methodTestMethod += ` ${word[i]}Type,`;
              }
              if(word[i] == "string" || word[i] == "int" || word[i] == "bool" || word[i] == "float" || word[i] == "double" || word[i] == "decimal" || word[i] == "char" || word[i] == "long" || word[i] == "short" || word[i] == "byte" || word[i] == "object" || word[i] == "uint" || word[i] == "ulong" || word[i] == "ushort" || word[i] == "sbyte" || word[i] == "DateTime" || word[i] == "DateTimeOffset" || word[i] == "TimeSpan" || word[i] == "Guid" || word[i] == "BigInteger"){
                methodTestMethod += ` typeof(${word[i]}),`;
              }
              // methodTestMethod += ` typeof(${word[i]}),`;
            }
          }
          methodTestMethod += `
      object result = methodInfo.Invoke(instance, new object[] {`;
          for(let i=0; i<length; i++){
            if(i==length-1){
              methodTestMethod += ` default(${word[i]}) });`;
            }else{
              methodTestMethod += ` default(${word[i]}),`;
            }
          }
          methodTestMethod += `
      Assert.IsNotNull(result, "Result should not be null");
    }`;     
      testContent += methodTestMethod;   
              }
    }

    
        });
      }
    


      }
    });
      testContent += `
  }
}
  `;
    const testFileName = `UnitTest1.cs`;
    fs.writeFileSync(testFileName, testContent);
    // return in json format
    return { testFileName, testContent };
    // return testFileName;
  }

  module.exports = modelsTest;