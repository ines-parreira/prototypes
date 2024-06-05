import {Components} from 'rest_api/help_center_api/client.generated'
import {SourceItem} from './types'

type ArticleIngestionLog = Components.Schemas.ArticleIngestionLogDto

const convertArticleIngestionStatus = (
    status: ArticleIngestionLog['status']
): SourceItem['status'] => {
    switch (status) {
        case 'DISABLED':
        case 'FAILED':
            return 'error'
        case 'PENDING':
            return 'loading'
        case 'SUCCESSFUL':
            return 'done'
    }
}

export const mapArticleIngestionLogsToSourceItem = (
    articleIngestionLog: ArticleIngestionLog
): SourceItem => ({
    id: articleIngestionLog.id,
    status: convertArticleIngestionStatus(articleIngestionLog.status),
    url: articleIngestionLog.url,
})
