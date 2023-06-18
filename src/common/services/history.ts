import { backgroundHistoryService } from '../background/services/history'
import { IHistoryInternalService, historyInternalService } from '../internal-services/history'
import { isDesktopApp } from '../utils'

export const historyService: IHistoryInternalService = isDesktopApp() ? historyInternalService : backgroundHistoryService
