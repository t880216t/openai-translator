import { ICreateMessageOption, IListMessageOption, IMessageInternalService } from '../../internal-services/message'
import { Message } from "../../internal-services/db";
import { callMethod } from './base'

class BackgroundMessageService implements IMessageInternalService {
    create(opt: ICreateMessageOption): Promise<Message> {
        return callMethod('messageService', 'create', [opt])
    }
    list(opt: IListMessageOption): Promise<Message> {
        return callMethod('messageService', 'list', [opt])
    }
    get(id: number): Promise<Message | undefined> {
        return callMethod('messageService', 'get', [id])
    }
    delete(id: number): Promise<void> {
        return callMethod('messageService', 'delete', [id])
    }
}

export const backgroundMessageService = new BackgroundMessageService()
