/* eslint-disable camelcase */
import * as utils from './utils'
import * as lang from './components/lang/lang'
import { fetchSSE } from './utils'
import { urlJoin } from 'url-join-ts'
import { v4 as uuidv4 } from 'uuid'
import { getLangConfig, LangCode } from './components/lang/lang'
import { getUniversalFetch } from './universal-fetch'
import { Action } from './internal-services/db'
import { codeBlock, oneLine, oneLineTrim } from 'common-tags'

export type TranslateMode = 'translate' | 'polishing' | 'summarize' | 'analyze' | 'explain-code' | 'big-bang'
export type Provider = 'OpenAI' | 'ChatGPT' | 'Azure'
export type APIModel =
    | 'gpt-3.5-turbo'
    | 'gpt-3.5-turbo-0301'
    | 'gpt-4'
    | 'gpt-4-0314'
    | 'gpt-4-32k'
    | 'gpt-4-32k-0314'
    | string

interface BaseTranslateQuery {
    text: string
    selectedWord: string
    detectFrom: LangCode
    detectTo: LangCode
    mode?: Exclude<TranslateMode, 'big-bang'>
    action: Action
    onMessage: (message: { messageId?: string, content: string; role: string; isWordMode: boolean; isFullText?: boolean }) => void
    onError: (error: string) => void
    onFinish: (reason: string) => void
    onStatusCode?: (statusCode: number) => void
    signal: AbortSignal
}

type TranslateQueryBigBang = Omit<
    BaseTranslateQuery,
    'mode' | 'action' | 'selectedWord' | 'detectFrom' | 'detectTo'
> & {
    mode: 'big-bang'
    articlePrompt: string
}

export type TranslateQuery = BaseTranslateQuery | TranslateQueryBigBang

export interface TranslateResult {
    text?: string
    from?: string
    to?: string
    error?: string
}

export const isAWord = (langCode: string, text: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Segmenter } = Intl as any
    if (!Segmenter) {
        return false
    }
    const segmenter = new Segmenter(langCode, { granularity: 'word' })
    const iterator = segmenter.segment(text)[Symbol.iterator]()
    return iterator.next().value?.segment === text
}

export class QuoteProcessor {
    private quote: string
    public quoteStart: string
    public quoteEnd: string
    private prevQuoteStartBuffer: string
    private prevQuoteEndBuffer: string

    constructor() {
        this.quote = uuidv4().replace(/-/g, '').slice(0, 4)
        this.quoteStart = `<${this.quote}>`
        this.quoteEnd = `</${this.quote}>`
        this.prevQuoteStartBuffer = ''
        this.prevQuoteEndBuffer = ''
    }

    public processText(text: string): string {
        const deltas = text.split('')
        const targetPieces = deltas.map((delta) => this.processTextDelta(delta))
        return targetPieces.join('')
    }

    private processTextDelta(textDelta: string): string {
        if (textDelta === '') {
            return ''
        }
        if (textDelta.trim() === this.quoteEnd) {
            return ''
        }
        let result = textDelta
        // process quote start
        let quoteStartBuffer = this.prevQuoteStartBuffer
        // console.debug('\n\n')
        // console.debug('---- process quote start -----')
        // console.debug('textDelta', textDelta)
        // console.debug('this.quoteStartbuffer', this.quoteStartBuffer)
        // console.debug('start loop:')
        let startIdx = 0
        for (let i = 0; i < textDelta.length; i++) {
            const char = textDelta[i]
            // console.debug(`---- i: ${i} startIdx: ${startIdx} ----`)
            // console.debug('char', char)
            // console.debug('quoteStartBuffer', quoteStartBuffer)
            // console.debug('result', result)
            if (char === this.quoteStart[quoteStartBuffer.length]) {
                if (this.prevQuoteStartBuffer.length > 0) {
                    if (i === startIdx) {
                        quoteStartBuffer += char
                        result = textDelta.slice(i + 1)
                        startIdx += 1
                    } else {
                        result = this.prevQuoteStartBuffer + textDelta
                        quoteStartBuffer = ''
                        break
                    }
                } else {
                    quoteStartBuffer += char
                    result = textDelta.slice(i + 1)
                }
            } else {
                if (quoteStartBuffer.length === this.quoteStart.length) {
                    quoteStartBuffer = ''
                    break
                }
                if (quoteStartBuffer.length > 0) {
                    result = this.prevQuoteStartBuffer + textDelta
                    quoteStartBuffer = ''
                    break
                }
            }
        }
        // console.debug('end loop!')
        this.prevQuoteStartBuffer = quoteStartBuffer
        // console.debug('result', result)
        // console.debug('this.quoteStartBuffer', this.quoteStartBuffer)
        // console.debug('---- end of process quote start -----')
        textDelta = result
        // process quote end
        let quoteEndBuffer = this.prevQuoteEndBuffer
        // console.debug('\n\n')
        // console.debug('---- start process quote end -----')
        // console.debug('textDelta', textDelta)
        // console.debug('this.quoteEndBuffer', this.quoteEndBuffer)
        // console.debug('start loop:')
        let endIdx = 0
        for (let i = 0; i < textDelta.length; i++) {
            const char = textDelta[i]
            // console.debug(`---- i: ${i}, endIdx: ${endIdx} ----`)
            // console.debug('char', char)
            // console.debug('quoteEndBuffer', quoteEndBuffer)
            // console.debug('result', result)
            if (char === this.quoteEnd[quoteEndBuffer.length]) {
                if (this.prevQuoteEndBuffer.length > 0) {
                    if (i === endIdx) {
                        quoteEndBuffer += char
                        result = textDelta.slice(i + 1)
                        endIdx += 1
                    } else {
                        result = this.prevQuoteEndBuffer + textDelta
                        quoteEndBuffer = ''
                        break
                    }
                } else {
                    quoteEndBuffer += char
                    result = textDelta.slice(0, textDelta.length - quoteEndBuffer.length)
                }
            } else {
                if (quoteEndBuffer.length === this.quoteEnd.length) {
                    quoteEndBuffer = ''
                    break
                }
                if (quoteEndBuffer.length > 0) {
                    result = this.prevQuoteEndBuffer + textDelta
                    quoteEndBuffer = ''
                    break
                }
            }
        }
        // console.debug('end loop!')
        this.prevQuoteEndBuffer = quoteEndBuffer
        // console.debug('totally result', result)
        // console.debug('this.quoteEndBuffer', this.quoteEndBuffer)
        // console.debug('---- end of process quote end -----')
        return result
    }
}

export async function chat(query: any) {
    const fetcher = getUniversalFetch()
    let rolePrompt = ''
    let commandPrompt = ''
    let contentPrompt = query.text
    let assistantPrompts: string[] = query?.assistantPrompts
    let lastPrompt: string = query?.lastPrompt
    let quoteProcessor: QuoteProcessor | undefined
    const settings = await utils.getSettings()
    let isWordMode = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: Record<string, any> = {
        model: settings.apiModel,
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        stream: true,
    }

    let apiKey = ''
    if (settings.provider !== 'ChatGPT') {
        apiKey = await utils.getApiKey()
    }
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    let isChatAPI = true
    if (settings.provider === 'Azure' && settings.apiURLPath && settings.apiURLPath.indexOf('/chat/completions') < 0) {
        // Azure OpenAI Service supports multiple API.
        // We should check if the settings.apiURLPath is match `/deployments/{deployment-id}/chat/completions`.
        // If not, we should use the legacy parameters.
        isChatAPI = false
        body[
            'prompt'
        ] = `<|im_start|>system\n${rolePrompt}\n<|im_end|>\n<|im_start|>user\n${commandPrompt}\n${contentPrompt}\n<|im_end|>\n<|im_start|>assistant\n`
        body['stop'] = ['<|im_end|>']
    } else if (settings.provider === 'ChatGPT') {
        let resp: Response | null = null
        resp = await fetcher(utils.defaultChatGPTAPIAuthSession, { signal: query.signal })
        if (resp.status !== 200) {
            query.onError?.('Failed to fetch ChatGPT Web accessToken.')
            query.onStatusCode?.(resp.status)
            return
        }
        const respJson = await resp?.json()
        apiKey = respJson.accessToken
        body = {
            action: 'next',
            messages: [
                {
                    id: utils.generateUUID(),
                    role: 'user',
                    content: {
                        content_type: 'text',
                        parts: [
                            codeBlock`
                        ${rolePrompt}
                        
                        ${commandPrompt}:
                        ${contentPrompt}
                        `,
                        ],
                    },
                },
            ],
            model: settings.apiModel, // 'text-davinci-002-render-sha'
            parent_message_id: utils.generateUUID(),
        }
    } else {
        const messages = [
            {
                role: 'system',
                content: rolePrompt,
            },
            ...assistantPrompts.map((prompt) => {
                return {
                    role: 'user',
                    content: prompt,
                }
            }),
            {
                role: 'user',
                content: commandPrompt,
            },
        ]
        if (lastPrompt){
            messages.push({
                role: 'assistant',
                content: lastPrompt,
            })
        }
        if (contentPrompt) {
            messages.push({
                role: 'user',
                content: contentPrompt,
            })
        }
        body['messages'] = messages
    }

    switch (settings.provider) {
        case 'OpenAI':
        case 'ChatGPT':
            headers['Authorization'] = `Bearer ${apiKey}`
            break

        case 'Azure':
            headers['api-key'] = `${apiKey}`
            break
    }

    if (settings.provider === 'ChatGPT') {
        let conversationId = ''
        let length = 0
        await fetchSSE(`${utils.defaultChatGPTWebAPI}/conversation`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: query.signal,
            onStatusCode: (status) => {
                query.onStatusCode?.(status)
            },
            onMessage: (msg) => {
                let resp
                try {
                    resp = JSON.parse(msg)
                    // eslint-disable-next-line no-empty
                } catch {
                    query.onFinish('stop')
                    return
                }
                if (!conversationId) {
                    conversationId = resp.conversation_id
                }
                const { finish_details: finishDetails } = resp.message
                if (finishDetails) {
                    query.onFinish(finishDetails.type)
                    return
                }

                const { content, author } = resp.message
                if (author.role === 'assistant') {
                    const targetTxt = content.parts.join('')
                    let textDelta = targetTxt.slice(length)
                    if (quoteProcessor) {
                        textDelta = quoteProcessor.processText(textDelta)
                    }
                    query.onMessage({ content: textDelta, role: '', isWordMode })
                    length = targetTxt.length
                }
            },
            onError: (err) => {
                if (err instanceof Error) {
                    query.onError(err.message)
                    return
                }
                if (typeof err === 'string') {
                    query.onError(err)
                    return
                }
                if (typeof err === 'object') {
                    const { detail } = err
                    if (detail) {
                        const { message } = detail
                        if (message) {
                            query.onError(`ChatGPT Web: ${message}`)
                            return
                        }
                    }
                    query.onError(`ChatGPT Web: ${JSON.stringify(err)}`)
                    return
                }
                const { error } = err
                if (error instanceof Error) {
                    query.onError(error.message)
                    return
                }
                if (typeof error === 'object') {
                    const { message } = error
                    if (message) {
                        query.onError(message)
                        return
                    }
                }
                query.onError('Unknown error')
            },
        })
        if (conversationId) {
            await fetcher(`${utils.defaultChatGPTWebAPI}/conversation/${conversationId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ is_visible: false }),
            })
        }
    } else {
        const url = urlJoin(settings.apiURL, settings.apiURLPath)
        await fetchSSE(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: query.signal,
            onMessage: (msg) => {
                let resp
                try {
                    resp = JSON.parse(msg)
                    // eslint-disable-next-line no-empty
                } catch {
                    query.onFinish('stop')
                    return
                }

                const { choices, id, created } = resp
                if (!choices || choices.length === 0) {
                    return { error: 'No result' }
                }
                const { finish_reason: finishReason } = choices[0]
                if (finishReason) {
                    query.onFinish(finishReason)
                    return
                }

                let targetTxt = ''
                if (!isChatAPI) {
                    // It's used for Azure OpenAI Service's legacy parameters.
                    targetTxt = choices[0].text

                    if (quoteProcessor) {
                        targetTxt = quoteProcessor.processText(targetTxt)
                    }

                    query.onMessage({ messageId: id, content: targetTxt, role: '', isWordMode, createAt: created  })
                } else {
                    const { content = '', role } = choices[0].delta

                    targetTxt = content

                    if (quoteProcessor) {
                        targetTxt = quoteProcessor.processText(targetTxt)
                    }

                    query.onMessage({ messageId: id, content: targetTxt, role, isWordMode, createAt: created })
                }
            },
            onError: (err) => {
                if (err instanceof Error) {
                    query.onError(err.message)
                    return
                }
                if (typeof err === 'string') {
                    query.onError(err)
                    return
                }
                if (typeof err === 'object') {
                    const { detail } = err
                    if (detail) {
                        query.onError(detail)
                        return
                    }
                }
                const { error } = err
                if (error instanceof Error) {
                    query.onError(error.message)
                    return
                }
                if (typeof error === 'object') {
                    const { message } = error
                    if (message) {
                        query.onError(message)
                        return
                    }
                }
                query.onError('Unknown error')
            },
        })
    }
}
