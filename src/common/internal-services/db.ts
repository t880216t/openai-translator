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
    status: number
    updatedAt: string
    createdAt: string
}

export interface Message {
    id?: number
    history_id: number
    message_id: string
    content: string
    role: string
    createdAt?: number
    add_time?: string
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
            message: '++id, history_id, message_id, content, role, createdAt, add_time',
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
