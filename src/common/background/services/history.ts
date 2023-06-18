import { IHistoryInternalService, ICreateHistoryOption } from '../../internal-services/history'
import { Action, History } from "../../internal-services/db";
import { callMethod } from './base'

class BackgroundHistoryService implements IHistoryInternalService {
    create(opt: ICreateHistoryOption): Promise<History> {
        return callMethod('historyService', 'create', [opt])
    }
    get(id: number): Promise<History | undefined> {
        return callMethod('historyService', 'get', [id])
    }
    delete(id: number): Promise<void> {
        return callMethod('historyService', 'delete', [id])
    }
    list(): Promise<History[]> {
        return callMethod('historyService', 'list', [])
    }
}

export const backgroundHistoryService = new BackgroundHistoryService()
