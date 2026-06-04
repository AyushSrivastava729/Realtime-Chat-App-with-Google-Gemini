import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

export async function generateResult(prompt) {
  try {
    // Changed model to gemini-2.5-flash-lite for higher daily limits (1,500 requests/day)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite", 
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

    // Wrapped generation logic cleanly to capture API-specific errors without crashing your server
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (apiError) {
      console.error("Gemini API Engine Error:", apiError);
      
      // Fallback valid JSON object matching your expected app response schema
      if (apiError.status === 429) {
        return JSON.stringify({
          text: "API Rate limit reached. Please check back later or try again shortly."
        });
      }
      return JSON.stringify({
        text: "An error occurred while generating content with the AI model."
      });
    }

  } catch (error) {
    console.error("Error configuration or initialization failed:", error);
    throw error;
  }
}
