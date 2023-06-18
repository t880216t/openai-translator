import { History, getLocalDB, Action } from "./db";
import { builtinActionModes } from "../constants";

export interface ICreateHistoryOption {
    name: string
    description?: string
}

export interface IHistoryInternalService {
    create(opt: ICreateHistoryOption): Promise<History>
    list(): Promise<History[]>
    get(id: number): Promise<History | undefined>
    delete(id: number): Promise<void>
}

class HistoryInternalService implements IHistoryInternalService {
    private get db() {
        return getLocalDB()
    }

    async create(opt: ICreateHistoryOption): Promise<History> {
        if (!opt.name) {
            throw new Error('name is required')
        }
        return this.db.transaction('rw', this.db.history, async () => {
            const now = new Date().valueOf().toString()
            const history: History = {
                idx: await this.db.history.count(),
                name: opt.name,
                description: opt?.description,
                status: 1,
                createdAt: now,
                updatedAt: now,
            }
            const id = await this.db.history.add(history)
            history.id = id as number
            return history
        })
    }

    async list(): Promise<History[]> {
        return this.db.transaction('rw', this.db.history, async () => {
            let count = await this.db.history.count()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const historys = await (this.db.history.where('status').equals(1) as any).desc().toArray()

            return historys
        })
    }

    async get(id: number): Promise<History | undefined> {
        const history = await this.db.history.get(id)
        return history
    }

    async delete(id: number): Promise<void> {
        return this.db.transaction('rw', this.db.history, async () => {
            const history = await this.db.history.get(id)
            if (!history) {
                return
            }
            return await this.db.history.delete(id)
        })
    }
}

export const historyInternalService = new HistoryInternalService()
