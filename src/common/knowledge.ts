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
    return response.json();
}

export async function queryKnowledgeList(params: any) {
    return request(`/api/knowledge/list`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function queryKnowledgeChat(params: any) {
    return request(`/api/knowledge/question`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function queryKnowledgeRemove(params: any) {
    return request(`/api/knowledge/remove`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function queryKnowledgeCreate(params: any) {
    const formData = new FormData();
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            formData.append(key, params[key]);
        }
    }
    return request(`/api/knowledge/create`, {
        method: 'POST',
        body: formData,
    });
}
