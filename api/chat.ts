import axios from "axios";
import type { VercelRequest, VercelResponse } from '@vercel/node';

async (req: VercelRequest, res: VercelResponse) =>{
    //若没有配置环境变量，可用百炼API Key将下行替换为：apiKey='sk-xxx'。但不建议在生产环境中直接将API Key硬编码到代码中，以减少API Key泄露风险。
    const apiKey = process.env.BAILIAN_DASHSCOPE_API_KEY;
    const appId = process.env.BAILIAN_APPID;// 替换为实际的应用 ID
    const memoryId = 'YOUR_MEMORY_ID';// 替换为实际的memory_id

    if (!apiKey ||!appId) {
        return res.status(500).json({ message: 'Missing DASHSCOPE_API_KEY or APP_ID in environment variables' });
    }

    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

    const data = {
        input: {
            prompt: "2023年9月水果茶分类下,相对2023年8月环比使用量增长最快的乳基底",
            // memory_id: memoryId
        },
        parameters: {
          'incremental_output' : 'true' // 增量输出
        },
        debug: {}
    };

    try {
        console.log("Sending request to DashScope API...");

        const response = await axios.post<{ [key: string]: any }>(url, data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable' // 流式输出
            },
            responseType: 'stream' // 用于处理流式响应
        });

        if (response.status === 200) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            response.data.on('data', (chunk: Buffer) => {
                res.write(`data: ${chunk.toString()}\n\n`);
            });

            response.data.on('end', () => {
                res.end();
            });
            if (response.data.output && response.data.output.text) {
                console.log(`${response.data.output.text}`);
            }
        } else {
            console.log("Request failed:");
            if (response.data.request_id) {
                console.log(`request_id=${response.data.request_id}`);
            }
            console.log(`code=${response.status}`);
            if (response.data.message) {
                console.log(`message=${response.data.message}`);
            } else {
                console.log('message=Unknown error');
            }
            res.status(response.status).json(response.data);

        }
    } catch (error: any) {
        console.error(`Error calling DashScope: ${error.message}`);
        if (error.response) {
            console.error(`Response status: ${error.response.status}`);
            console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

