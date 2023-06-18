import { Message, getLocalDB, Action } from "./db";

export interface ICreateMessageOption {
    history_id: string
    content: string
    message_id: string
    createdAt: string
    role: string
}

export interface IListMessageOption {
    history_id: string
}

export interface IMessageInternalService {
    create(opt: ICreateMessageOption): Promise<Message>
    list(opt: IListMessageOption): Promise<Message[]>
    get(id: number): Promise<Message | undefined>
    delete(id: number): Promise<void>
    deleteByHistoryId(id: number): Promise<void>
    listByHistoryId(id: number): Promise<void>
    bulkPut(messages: Message[]): Promise<void>
}

class MessageInternalService implements IMessageInternalService {
    private get db() {
        return getLocalDB()
    }

    async create(opt: ICreateMessageOption): Promise<Message> {
        if (!opt.history_id) {
            throw new Error('history_id is required')
        }
        if (!opt.content) {
            throw new Error('content is required')
        }
        if (!opt.message_id) {
            throw new Error('message_id is required')
        }
        if (opt.role == undefined) {
            throw new Error('role is required')
        }
        return this.db.transaction('rw', this.db.message, async () => {
            const now = new Date().valueOf().toString()
            const message: Message = {
                history_id: opt.history_id,
                message_id: opt.message_id,
                content: opt.content,
                role: opt.role,
                createdAt: opt.createdAt,
                add_time: now,
            }
            const id = await this.db.message.add(message)
            message.id = id as number
            return message
        })
    }

    async list(opt: IListMessageOption): Promise<Message[]> {
        return this.db.transaction('rw', this.db.message, async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messages = await (this.db.message.where('history_id').equals(opt.history_id) as any).desc().toArray()

            return messages
        })
    }

    async bulkPut(messages: Message[]): Promise<void> {
        await this.db.message.bulkPut(messages)
    }

    async get(id: number): Promise<Message | undefined> {
        const message = await this.db.message.get(id)
        return message
    }

    async delete(id: number): Promise<void> {
        return this.db.transaction('rw', this.db.message, async () => {
            const message = await this.db.message.get(id)
            if (!message) {
                return
            }
            return await this.db.message.delete(id)
        })
    }

    async deleteByHistoryId(id: number): Promise<void> {
        const messages = await this.db.message.where('history_id').equals(id).toArray()
        if (messages.length == 0) {
            return
        }
        const ids = messages.map((message) => message.id)
        return this.db.transaction('rw', this.db.message, async () => {
            return await this.db.message.bulkDelete(ids)
        })
    }

    async listByHistoryId(id: number): Promise<void> {
        return this.db.transaction('rw', this.db.message, async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messages = await (this.db.message.where('history_id').equals(id) as any).toArray()

            return messages
        })
    }
}

export const messageInternalService = new MessageInternalService()
