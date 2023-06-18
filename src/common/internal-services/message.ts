import { Message, getLocalDB, Action } from "./db";

export interface ICreateMessageOption {
    history_id: string
    content: string
    role: 0 | 1 // 0: user, 1: bot
}

export interface IListMessageOption {
    history_id: string
}

export interface IMessageInternalService {
    create(opt: ICreateMessageOption): Promise<Message>
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
        if (opt.role == undefined) {
            throw new Error('role is required')
        }
        return this.db.transaction('rw', this.db.message, async () => {
            const now = new Date().valueOf().toString()
            const message: Message = {
                history_id: opt.history_id,
                content: opt.content,
                role: opt.role,
                createdAt: now,
                updatedAt: now,
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
}

export const messageInternalService = new MessageInternalService()
