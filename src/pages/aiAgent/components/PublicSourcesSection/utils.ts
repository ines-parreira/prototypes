import { Components } from 'rest_api/help_center_api/client.generated'

import { SourceItem } from './types'

type ArticleIngestionLog = Components.Schemas.ArticleIngestionLogDto

const convertArticleIngestionStatus = (
    status: ArticleIngestionLog['status'],
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
    articleIngestionLog: ArticleIngestionLog,
): SourceItem => ({
    id: articleIngestionLog.id,
    status: convertArticleIngestionStatus(articleIngestionLog.status),
    url: articleIngestionLog.url,
    createdDatetime: articleIngestionLog.created_datetime,
})

export const updateArticleIngestionLogs = (
    prevLogs: ArticleIngestionLog[],
    newLogs: ArticleIngestionLog[],
): ArticleIngestionLog[] => {
    return prevLogs.map((log) => {
        const updatedLog = newLogs.find((l) => l.id === log.id)

        return updatedLog ?? log
    })
}

export const DOCUMENT_EXTENSIONS = new Set([
    'pdf',
    'doc',
    'docx',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
    'rtf',
    'txt',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'tiff',
    'svg',
    'webp',
    'mp3',
    'wav',
    'ogg',
    'flac',
    'aac',
    'wma',
    'm4a',
    'mp4',
    'avi',
    'mkv',
    'mov',
    'wmv',
    'flv',
    'webm',
    'mpeg',
    'mpg',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'bz2',
    'xz',
    'css',
    'js',
    'xml',
    'csv',
    'yml',
    'yaml',
])
