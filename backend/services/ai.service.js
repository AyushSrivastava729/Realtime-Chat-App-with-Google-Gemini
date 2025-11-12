/*import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

export async function generateResult(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",

      },
      systemInstruction: `
      You are a highly experienced MERN stack developer (10+ years).
Your responses must:
- Contain only clean, runnable code with **minimal inline comments**.
- Avoid explanations, docstrings, or long documentation.
- Keep comments short (max 1 line) and only where absolutely necessary.
- Focus on logic, modularity, and correctness.
- Maintain the functionality of existing code.


      Examples:

       <example>

      user:Create an express application
      response:{
      
      "text":"this is your fileTree structure of the expess server".
      "fileTree":{
      "app.js":{
      file:{
       contents:" 
       const express=require('express');

const app=express();

app.get('/',(req,res)=>{
       res.send('Hello World');
});

app.listen(3000,()=>{
    console.log('server is running on port 3000')
})  
      "
},
      },

      "package.json":{
file:{
      contents:"
      {
  "name": "temp-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "express": "^5.1.0"
  }
}


      "
},
   
},

      },
       "buildCommand": {
      mainItem: "npm",
      commands: [ "install" ]
    },

    "startCommand": {
    mainItem: "node",
    commands: [ "app.js" ]
}
      }
       </example>

        <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
       </example>

        
      `
      // You are an expert MERN stack developer.
      // Always respond ONLY with clean, runnable JavaScript (or JSX/React) code.
      // Include short inline comments for clarity when necessary.
      // Do NOT include any explanations, greetings, or file path descriptions.
      // Do NOT describe best practices or reasoning — just output the final code.
      // The response should be suitable for direct insertion into a project.

    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
} */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

export async function generateResult(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `
      You are a highly experienced MERN stack developer (10+ years).
Your responses must:
- Contain only clean, runnable code with **minimal inline comments**.
- Avoid explanations, docstrings, or long documentation.
- Keep comments short (max 1 line) and only where absolutely necessary.
- Focus on logic, modularity, and correctness.
- Maintain the functionality of existing code.

      Examples:

       <example>

      user:Create an express application
      response:{
      
      "text":"this is your fileTree structure of the expess server".
      "fileTree":{
      "app.js":{
      file:{
       contents:" 
       const express=require('express');

const app=express();

app.get('/',(req,res)=>{
       res.send('Hello World');
});

app.listen(3000,()=>{
    console.log('server is running on port 3000')
})  
      "
},
      },

      "package.json":{
file:{
      contents:"
      {
  "name": "temp-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "express": "^5.1.0"
  }
}


      "
},
   
},

      },
       "buildCommand": {
      mainItem: "npm",
      commands: [ "install" ]
    },

    "startCommand": {
    mainItem: "node",
    commands: [ "app.js" ]
}
      }
       </example>

        <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
       </example>
      `
    });

    // ✅ added retry logic to prevent Gemini crash after 2–3 prompts
    const result = await (async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await new Promise(res => setTimeout(res, 1000)); // small delay
          return await model.generateContent(prompt);
        } catch (err) {
          if (i === 2) throw err;
          console.warn("Retrying Gemini request...", err.message);
          await new Promise(res => setTimeout(res, 2000 * (i + 1))); // backoff
        }
      }
    })();
    // ✅ end fix

    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}


