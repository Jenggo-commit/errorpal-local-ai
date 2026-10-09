import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (
      filePath.includes('node_modules') || 
      filePath.includes('.git') || 
      filePath.includes('.next') || 
      filePath.includes('tsconfig.json') || 
      filePath.includes('package.json')
    ) {
      return;
    }
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else if (/\.(js|ts|jsx|tsx|py|cpp|json)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

export async function POST(req: Request) {
  try {
    const { targetPath, inputData, mode, language = 'JavaScript', isSocratic, isRoast } = await req.json();

    let codeContext = inputData || "";
    if (targetPath) {
      const resolvedPath = path.resolve(targetPath);
      if (fs.existsSync(resolvedPath)) {
        const files = walkDir(resolvedPath);
        files.slice(0, 3).forEach(file => {
          const relativeName = path.relative(resolvedPath, file);
          const content = fs.readFileSync(file, 'utf8');
          codeContext += `\n--- FILE: ${relativeName} ---\n${content}\n`;
        });
      }
    }

    let modeInstruction = "Analyze and debug the provided code snippet or error log.";
    if (mode === 'refactor') {
      modeInstruction = "Clean up, optimize, and refactor the provided code for better performance and readability.";
    } else if (mode === 'explain') {
      modeInstruction = "Provide a clear, detailed line-by-line explanation of what this code does.";
    } else if (mode === 'test') {
      modeInstruction = "Generate comprehensive unit test cases for this code using standard testing practices.";
    } else if (mode === 'quiz') {
      modeInstruction = `Generate a brand new, engaging daily coding challenge or interview puzzle for ${language}. Include a problem description, an example test case, and hints without spoiling the final answer.`;
      if (!codeContext.trim()) {
        codeContext = `Generate a fresh daily coding challenge for ${language}.`;
      }
    }

    if (isSocratic) modeInstruction += " Act as a Socratic tutor: do NOT give the direct solution. Ask guiding questions.";
    if (isRoast) modeInstruction += " Roast the code with sarcastic senior developer critique while still providing the actual fix.";

    const promptText = `You are ErrorPal Pro, an elite AI coding mentor. 
Language: ${language}
Directive: ${modeInstruction}

Target Code / Prompt:
${codeContext}`;

    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:0.5b',
        prompt: promptText,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 350,
        }
      }),
    });

    const data = await ollamaRes.json();
    const outputText = data.response || data.message?.content || "Model returned an empty response.";

    return NextResponse.json({ result: outputText });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process local inference' }, { status: 500 });
  }
}