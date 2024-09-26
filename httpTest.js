const e = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

async function httpTest(files, subfolderPath) {

    let testContent = `using NUnit.Framework;
using System;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
[TestFixture]
public class UnitTest2
{
    private HttpClient _httpClient;
    private string _generatedToken;
    
    [SetUp]
    public void Setup()
    {
        _httpClient = new HttpClient();
        _httpClient.BaseAddress = new Uri("http://localhost:8080");
    }
    `;
    files.forEach((file) => {
        const modelProps = [];
        if (path.extname(file) === '.cs') {
          const filePath = path.join(subfolderPath, file);
          // console.log(filePath);
          const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log(fileContent);
        const className = fileContent.match(/class\s+(\w+)/)[1];
        console.log(className);
            if(className.toLowerCase() == "user" || className.toLowerCase() == "login" || className.toLowerCase() == "signup")
            {
                const propertyRegex = /public (\w+) (\w+) { get; set; }/g || /public (\w+) (\w+) {get;set;}/g || /public (\w+) (\w+) {get; set;}/g || /public (\w+) (\w+) { get;set;}/g || /public (\w+) (\w+) {get; set;}/g || /public (\w+) (\w+) { get; set;}/g || /public (\w+) (\w+) {get;set;}/g || /public (\w+) (\w+) { get; set; }/g || /public (\w+) (\w+) {get; set; }/g;
                
                let propertyMatches;
        const properties = [];
        while ((propertyMatches = propertyRegex.exec(fileContent)) !== null) {
          const type = propertyMatches[1];
          const name = propertyMatches[2];
          properties.push({ type, name });
          modelProps.push({name});
        }
        modelProps.forEach(property => {
          console.log("propname"+property.name);
        })
        console.log(modelProps.length);
                testContent += `
    [Test, Order(1)]
    public async Task Backend_TestRegisterAdmin()
    {
        string uniqueId = Guid.NewGuid().ToString();
        `;
                properties.forEach(property => {
                    if(property.name.toLowerCase().includes('email'))
                    {
                        testContent += `
        string uniqueemail = $"abcd{uniqueId}@gmail.com";`;
                    } if(property.name.toLowerCase().includes('password'))
                    {
                        testContent += `
        string uniquepassword = $"abcdA{uniqueId}@123";`;
                    } if(property.name.toLowerCase().includes('username'))
                    {
                        testContent += `
        string uniqueusername = $"abcd_{uniqueId}";`;
                    } if(property.name.toLowerCase().includes('phone'))
                    {
                        testContent += `
        string uniquephone = $"abcd_{uniqueId}";`;
                    } if(property.name.toLowerCase().includes('address'))
                    {
                        testContent += `
        string uniqueaddress = $"abcd_{uniqueId}";`;
                    } if(property.name.toLowerCase().includes('city'))
                    {
                        testContent += `
        string uniquecity = $"abcd_{uniqueId}";`;
                    } if(property.name.toLowerCase().includes('state'))
                    {
                        testContent += `
        string uniquestate = $"abcd_{uniqueId}";`;
                    } if(property.name.toLowerCase().includes('role'))
                    {
                        testContent += `
        string uniquerole = "admin";`;
                    }                
                })
                testContent += `
        string requestBody = $"{{`;
                properties.forEach((property, index) => {
                    if(property.name.toLowerCase().includes('email'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniqueemail}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniqueemail}\\",`;
                    } if(property.name.toLowerCase().includes('password'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniquepassword}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniquepassword}\\",`;
                    } if(property.name.toLowerCase().includes('username'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniqueusername}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniqueusername}\\",`;
                    } if(property.name.toLowerCase().includes('phone'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniquephone}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniquephone}\\",`;
                    } if(property.name.toLowerCase().includes('address'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniqueaddress}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniqueaddress}\\",`;
                    } if(property.name.toLowerCase().includes('city'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniquecity}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniquecity}\\",`;
                    } if(property.name.toLowerCase().includes('state'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniquestate}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniquestate}\\",`;
                    } if(property.name.toLowerCase().includes('role'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{uniquerole}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniquerole}\\",`;
                    }     
                })
                testContent += `
        HttpResponseMessage response = await _httpClient.PostAsync("/api/auth/register", new StringContent(requestBody, Encoding.UTF8, "application/json"));
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        string responseBody = await response.Content.ReadAsStringAsync();    
    }
    `;
    testContent += `
    [Test, Order(2)]
    public async Task Backend_TestLoginAdmin()
    {
        string uniqueId = Guid.NewGuid().ToString();
        `;
        properties.forEach(property => {
            if(property.name.toLowerCase().includes('email'))
            {
                testContent += `
        string uniqueemail = $"abcd{uniqueId}@gmail.com";`;
            } if(property.name.toLowerCase().includes('password'))
            {
                testContent += `
        string uniquepassword = $"abcdA{uniqueId}@123";`;
            } if(property.name.toLowerCase().includes('username'))
            {
                testContent += `
        string uniqueusername = $"abcd_{uniqueId}";`;
            } if(property.name.toLowerCase().includes('phone'))
            {
                testContent += `
        string uniquephone = $"abcd_{uniqueId}";`;
            } if(property.name.toLowerCase().includes('address'))
            {
                testContent += `
        string uniqueaddress = $"abcd_{uniqueId}";`;
            } if(property.name.toLowerCase().includes('city'))
            {
                testContent += `
        string uniquecity = $"abcd_{uniqueId}";`;
            } if(property.name.toLowerCase().includes('state'))
            {
                testContent += `
        string uniquestate = $"abcd_{uniqueId}";`;
            } if(property.name.toLowerCase().includes('role'))
            {
                testContent += `
        string uniquerole = "admin";`;
            }                
        })
        testContent += `
        string requestBody = $"{{`;
        properties.forEach((property, index) => {
            if(property.name.toLowerCase().includes('email'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniqueemail}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniqueemail}\\",`;
            } if(property.name.toLowerCase().includes('password'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniquepassword}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniquepassword}\\",`;
            } if(property.name.toLowerCase().includes('username'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniqueusername}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniqueusername}\\",`;
            } if(property.name.toLowerCase().includes('phone'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniquephone}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniquephone}\\",`;
            } if(property.name.toLowerCase().includes('address'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniqueaddress}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniqueaddress}\\",`;
            } if(property.name.toLowerCase().includes('city'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniquecity}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniquecity}\\",`;
            } if(property.name.toLowerCase().includes('state'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniquestate}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniquestate}\\",`;
            } if(property.name.toLowerCase().includes('role'))
            {
                if(index == properties.length-1)
                    testContent += `\\"${property.name}\\" : \\"{uniquerole}\\" }}";`;
                else
                    testContent += `\\"${property.name}\\" : \\"{uniquerole}\\",`;
            }     
        })
        testContent += `
        HttpResponseMessage response = await _httpClient.PostAsync("/api/auth/register", new StringContent(requestBody, Encoding.UTF8, "application/json"));
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
`;
                
                testContent += `
        string requestBody1 = $"{{`;
        let c=0;
                properties.forEach((property, index) => {
                    
                    if(property.name.toLowerCase().includes('email'))
                    {
                        c++;
                        if(index == properties.length-1 || c==2)
                            testContent += `\\"${property.name}\\" : \\"{uniqueemail}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniqueemail}\\",`;
                    } if(property.name.toLowerCase().includes('password'))
                    {
                        c++;
                        if(index == properties.length-1 || c==2)
                            testContent += `\\"${property.name}\\" : \\"{uniquepassword}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniquepassword}\\",`;
                    } if(property.name.toLowerCase().includes('username'))
                    {
                        c++;
                        if(index == properties.length-1 || c==2)
                            testContent += `\\"${property.name}\\" : \\"{uniqueusername}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{uniqueusername}\\",`;
                    }
                })
                testContent += `
        HttpResponseMessage response1 = await _httpClient.PostAsync("/api/auth/login", new StringContent(requestBody1, Encoding.UTF8, "application/json"));
        Assert.AreEqual(HttpStatusCode.OK, response1.StatusCode);
        string responseBody = await response1.Content.ReadAsStringAsync();
    }
    `;
            }

            else{
                const propertyRegex = /public (\w+) (\w+) { get; set; }/g || /public (\w+) (\w+) {get;set;}/g || /public (\w+) (\w+) {get; set;}/g || /public (\w+) (\w+) { get;set;}/g || /public (\w+) (\w+) {get; set;}/g || /public (\w+) (\w+) { get; set;}/g || /public (\w+) (\w+) {get;set;}/g || /public (\w+) (\w+) { get; set; }/g || /public (\w+) (\w+) {get; set; }/g;
                
                let propertyMatches;
        const properties = [];
                while ((propertyMatches = propertyRegex.exec(fileContent)) !== null) {
                    const type = propertyMatches[1];
                    const name = propertyMatches[2];
                    properties.push({ type, name });
                    modelProps.push({name});
                }
                modelProps.forEach(property => {
                    console.log("propname"+property.name);
                })
                console.log(modelProps.length);
                testContent += `
    [Test, Order(1)]
    public async Task Backend_TestPost${className}()
    {
    //string responseBody = await loginResponse.Content.ReadAsStringAsync();

    //dynamic responseMap = JsonConvert.DeserializeObject(responseBody);

    //string token = responseMap.token;
    //Assert.IsNotNull(token);
        string uniqueId = Guid.NewGuid().ToString();
        `;
                properties.forEach(property => {
                    if(property.type.toLowerCase().includes('string'))
                    {
                        testContent += `
        string unique${property.name} = $"abcd{uniqueId}";`;
                    }
                    if(property.type.toLowerCase().includes('int'))
                    {
                        testContent += `
        int unique${property.name} = 123;`;
                    }
                    if(property.type.toLowerCase().includes('bool'))
                    {
                        testContent += `
        bool unique${property.name} = true;`;
                    }
                    if(property.type.toLowerCase().includes('datetime'))
                    {
                        testContent += `
        DateTime unique${property.name} = DateTime.Now;`;
                    }
                    if(property.type.toLowerCase().includes('double'))
                    {
                        testContent += `
        double unique${property.name} = 123.123;`;
                    }
                    if(property.type.toLowerCase().includes('decimal'))
                    {
                        testContent += `
        decimal unique${property.name} = 123.123;`;
                    }
                    if(property.type.toLowerCase().includes('float'))
                    {
                        testContent += `
        float unique${property.name} = 123.123;`;
                    }                                        
                })
                testContent += `
        string requestBody2 = $"{{`;
                properties.forEach((property, index) => {
                    if(property.type.toLowerCase().includes('string'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{unique${property.name}}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{unique${property.name}}\\",`;
                    }
                    if(property.type.toLowerCase().includes('int'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : {unique${property.name}} }}";`;
                        else
                            testContent += `\\"${property.name}\\" : {unique${property.name}},`;
                    }
                    if(property.type.toLowerCase().includes('bool'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : {unique${property.name}} }}";`;
                        else
                            testContent += `\\"${property.name}\\" : {unique${property.name}},`;
                    }
                    if(property.type.toLowerCase().includes('datetime'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : \\"{unique${property.name}}\\" }}";`;
                        else
                            testContent += `\\"${property.name}\\" : \\"{unique${property.name}}\\",`;
                    }
                    if(property.type.toLowerCase().includes('double'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : {unique${property.name}} }}";`;
                        else
                            testContent += `\\"${property.name}\\" : {unique${property.name}},`;
                    }
                    if(property.type.toLowerCase().includes('decimal'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : {unique${property.name}} }}";`;
                        else
                            testContent += `\\"${property.name}\\" : {unique${property.name}},`;
                    }
                    if(property.type.toLowerCase().includes('float'))
                    {
                        if(index == properties.length-1)
                            testContent += `\\"${property.name}\\" : {unique${property.name}} }}";`;
                        else
                            testContent += `\\"${property.name}\\" : {unique${property.name}},`;
                    }                                        
                })
                testContent += `
    //    _httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);
        HttpResponseMessage response3 = await _httpClient.PostAsync("/api/${className}", new StringContent(requestBody2, Encoding.UTF8, "application/json"));

        Assert.AreEqual(HttpStatusCode.OK, response3.StatusCode);
    }
    `;

    testContent += `
    [Test, Order(2)]
    public async Task Backend_TestGet${className}()
    {
    //string responseBody = await loginResponse.Content.ReadAsStringAsync();
    //dynamic responseMap = JsonConvert.DeserializeObject(responseBody);
    //string token = responseMap.token;
    //Assert.IsNotNull(token);
    //_httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + token);

        HttpResponseMessage response = await _httpClient.GetAsync("/api/${className}");

        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }`;

            }
        }
    });
    testContent += `
}
`;

    const testFileName = `UnitTest2.cs`;
    fs.writeFileSync(testFileName, testContent);
    return { testFileName, testContent };
}

module.exports = httpTest;