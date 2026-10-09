import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to recursively read code files from a target directory
function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    // Skip node_modules, .git, build directories, etc.
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('.next')) {
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
    const { targetPath, mode } = await req.json();

    // Default to scanning the current workspace or provided path safely
    const resolvedPath = targetPath ? path.resolve(targetPath) : process.cwd();

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'Target directory path does not exist on local machine.' }, { status: 400 });
    }

    const files = walkDir(resolvedPath);
    let combinedCodeContext = "";

    // Read contents of up to 10 core files to fit within local model token limits
    files.slice(0, 10).forEach(file => {
      const relativeName = path.relative(resolvedPath, file);
      const content = fs.readFileSync(file, 'utf8');
      combinedCodeContext += `\n--- FILE: ${relativeName} ---\n${content}\n`;
    });

    const systemPrompt = `You are a senior software architect analyzing an entire local project codebase. Review the multi-file context below for architectural bugs, broken component imports, or type discrepancies.`;

    const prompt = `${systemPrompt}

Project Files Context:
${combinedCodeContext}`;

    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 500,
        }
      }),
    });

    const data = await ollamaRes.json();
    return NextResponse.json({ result: data.response, scannedFiles: files.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to scan local directory' }, { status: 500 });
  }
}