import { backgroundMessageService } from '../background/services/message'
import { IMessageInternalService, messageInternalService } from '../internal-services/message'
import { isDesktopApp } from '../utils'

export const historyService: IMessageInternalService = isDesktopApp() ? messageInternalService : backgroundMessageService
