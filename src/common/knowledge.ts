import * as utils from './utils'
import { getUniversalFetch } from './universal-fetch';

export async function request(url: string, options: RequestInit): Promise<any> {
    const settings = await utils.getSettings()
    const domain = settings.apiURL === "https://api.openai.com" ? 'http://localhost:5000' : settings.apiURL;
    const fetcher = getUniversalFetch();
    // 合并请求头
    options.headers = {
        ...options.headers,
        'User-Token': settings.userToken ?? '',
        'ApiKey': settings.apiKeys ?? '',
    }
    const response = await fetcher(`${domain}${url}`, options);
    if (!response.ok) {
        throw new Error('Request failed');
    }
    // 服务端返回的数据请求头为json时，需要解析为json，返回头为stream时，直接返回
    if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json();
    }else {
        return response.arrayBuffer();
    }
}

export async function queryKnowledgeList(params: any) {
    return request(`/v1/knowledge/list`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function queryKnowledgeChat(params: any) {
    return request(`/v1/knowledge/question`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        },
        signal: params?.signal
    });
}

export async function queryKnowledgeChatStream(params: any) {
    return request(`/v1/knowledge/stream_question`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        },
        signal: params?.signal
    });
}

export async function queryKnowledgeRemove(params: any) {
    return request(`/v1/knowledge/remove`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function queryKnowledgeCreate(params: any) {
    return request(`/v1/knowledge/create`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function queryKnowledgeShare(params: any) {
    return request(`/v1/knowledge/share`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function queryKnowledgeFileDownload(params: any) {
    return request(`/v1/knowledge/download`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json"
        }
    });
}
