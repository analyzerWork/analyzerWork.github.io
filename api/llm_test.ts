import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: 'sk-TnKMfivw7r6mc5y3QO9MwKmmEBBocNDIyXX3oNbh3H5ixPJe',
  baseURL: "https://api.moonshot.cn/v1",
});

export async function GET (req: VercelRequest, res: VercelResponse) {
  const response = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: [
      {
        role: "system",
        content:
          "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
      },
      {
        role: "user",
        content: "你好，我叫李雷，1+1等于多少？",
      }
    ],
    temperature: 0.3,
    stream: true,
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
};
