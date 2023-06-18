import Dexie, { Table } from 'dexie'
import { TranslateMode } from '../translate'

export interface VocabularyItem {
    word: string
    reviewCount: number
    description: string
    updatedAt: string
    createdAt: string
    [prop: string]: string | number
}

export type ActionOutputRenderingFormat = 'text' | 'markdown' | 'latex'

export interface Action {
    id?: number
    idx: number
    mode?: TranslateMode
    name: string
    icon?: string
    rolePrompt?: string
    commandPrompt?: string
    outputRenderingFormat?: ActionOutputRenderingFormat
    updatedAt: string
    createdAt: string
}

export interface History {
    id?: number
    idx: number
    name: string
    description?: string
    status: 0 | 1 | 2 // 0: pending, 1: success, 2: failed
    updatedAt: string
    createdAt: string
}

export interface Message {
    id?: number
    history_id: string
    content: string
    role: 0 | 1 // 0: user, 1: bot
    updatedAt: string
    createdAt: string
}

export class LocalDB extends Dexie {
    vocabulary!: Table<VocabularyItem>
    action!: Table<Action>
    history!: Table<History>
    message!: Table<Message>

    constructor() {
        super('openai-translator')
        this.version(5).stores({
            vocabulary: 'word, reviewCount, description, updatedAt, createdAt',
            action: '++id, idx, mode, name, icon, rolePrompt, commandPrompt, outputRenderingFormat, updatedAt, createdAt',
            history: '++id, name, description, status, updatedAt, createdAt',
            message: '++id, history_id, content, role, updatedAt, createdAt',
        })
    }
}

let localDB: LocalDB

export const getLocalDB = () => {
    if (!localDB) {
        localDB = new LocalDB()
    }
    return localDB
}
