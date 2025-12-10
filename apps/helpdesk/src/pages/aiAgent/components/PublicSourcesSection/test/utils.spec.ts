import type { Components } from 'rest_api/help_center_api/client.generated'

import {
    mapArticleIngestionLogsToSourceItem,
    updateArticleIngestionLogs,
} from '../utils'

describe('PublicSourcesSection utils', () => {
    describe('mapArticleIngestionLogsToSourceItem', () => {
        it('should map ArticleIngestionLog to SourceItem', () => {
            const articleIngestionLog = {
                id: 1,
                status: 'SUCCESSFUL',
                url: 'https://example.com',
                source: 'url',
            } as Components.Schemas.ArticleIngestionLogDto
            const result =
                mapArticleIngestionLogsToSourceItem(articleIngestionLog)

            expect(result).toEqual({
                id: 1,
                status: 'done',
                url: 'https://example.com',
                source: 'url',
            })
        })
    })

    describe('updateArticleIngestionLogs', () => {
        it('should merge logs and update existing', () => {
            const prevLogs = [
                {
                    id: 1,
                    status: 'SUCCESSFUL',
                    url: 'https://example.com',
                    created_datetime: '2021-01-01T00:00:00.000Z',
                },
                {
                    id: 2,
                    status: 'PENDING',
                    url: 'https://example2.com',
                    created_datetime: '2021-01-01T00:00:00.000Z',
                },
            ] as Components.Schemas.ArticleIngestionLogDto[]
            const newLogs = [
                {
                    id: 1,
                    status: 'SUCCESSFUL',
                    url: 'https://example.com',
                    created_datetime: '2021-01-01T00:00:00.000Z',
                },
                {
                    id: 2,
                    status: 'SUCCESSFUL',
                    url: 'https://example2.com',
                    created_datetime: '2021-01-01T00:00:00.000Z',
                },
            ] as Components.Schemas.ArticleIngestionLogDto[]

            const result = updateArticleIngestionLogs(prevLogs, newLogs)
            expect(result).toEqual([
                {
                    id: 1,
                    status: 'SUCCESSFUL',
                    url: 'https://example.com',
                    created_datetime: '2021-01-01T00:00:00.000Z',
                },
                {
                    id: 2,
                    status: 'SUCCESSFUL',
                    url: 'https://example2.com',
                    created_datetime: '2021-01-01T00:00:00.000Z',
                },
            ])
        })
    })
})
