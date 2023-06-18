import { IVocabularyInternalService } from '../internal-services/vocabulary'

export const BackgroundEventNames = {
    fetch: 'fetch',
    vocabularyService: 'vocabularyService',
    actionService: 'actionService',
    historyService: 'historyService',
    messageService: 'messageService',
}

export type BackgroundVocabularyServiceMethodNames = keyof IVocabularyInternalService
