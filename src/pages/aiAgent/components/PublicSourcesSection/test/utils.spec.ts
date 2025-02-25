import { Components } from 'rest_api/help_center_api/client.generated'

import { SourceItem } from '../types'
import {
    mapArticleIngestionLogsToSourceItem,
    mergeSources,
    updateArticleIngestionLogs,
} from '../utils'

describe('PublicSourcesSection utils', () => {
    describe('mapArticleIngestionLogsToSourceItem', () => {
        it('should map ArticleIngestionLog to SourceItem', () => {
            const articleIngestionLog = {
                id: 1,
                status: 'SUCCESSFUL',
                url: 'https://example.com',
            } as Components.Schemas.ArticleIngestionLogDto
            const result =
                mapArticleIngestionLogsToSourceItem(articleIngestionLog)

            expect(result).toEqual({
                id: 1,
                status: 'done',
                url: 'https://example.com',
            })
        })
    })

    describe('mergeSources', () => {
        it('should merge sources and update existing', () => {
            const prevSources: SourceItem[] = [
                { id: 1, status: 'done', url: 'https://example.com' },
                { id: 2, status: 'done', url: 'https://example2.com' },
            ]
            const newSources: SourceItem[] = [
                { id: 2, status: 'loading', url: 'https://example2.com' },
                { id: 3, status: 'loading', url: 'https://example3.com' },
            ]
            const result = mergeSources(prevSources, newSources)
            expect(result).toEqual([
                { id: 3, status: 'loading', url: 'https://example3.com' },
                { id: 1, status: 'done', url: 'https://example.com' },
                { id: 2, status: 'loading', url: 'https://example2.com' },
            ])
        })

        it('should merge with the same url but different ids', () => {
            const prevSources: SourceItem[] = [
                { id: 1, status: 'done', url: 'https://example.com' },
                { id: 2, status: 'done', url: 'https://example2.com' },
            ]
            const newSources: SourceItem[] = [
                { id: 3, status: 'loading', url: 'https://example.com' },
                { id: 4, status: 'loading', url: 'https://example3.com' },
            ]
            const result = mergeSources(prevSources, newSources)
            expect(result).toEqual([
                { id: 4, status: 'loading', url: 'https://example3.com' },
                { id: 3, status: 'loading', url: 'https://example.com' },
                { id: 2, status: 'done', url: 'https://example2.com' },
            ])
        })
    })

    describe('updateArticleIngestionLogs', () => {
        it('should merge logs and update existing', () => {
            const prevLogs = [
                { id: 1, status: 'SUCCESSFUL', url: 'https://example.com' },
                { id: 2, status: 'PENDING', url: 'https://example2.com' },
            ] as Components.Schemas.ArticleIngestionLogDto[]
            const newLogs = [
                { id: 1, status: 'SUCCESSFUL', url: 'https://example.com' },
                { id: 2, status: 'SUCCESSFUL', url: 'https://example2.com' },
            ] as Components.Schemas.ArticleIngestionLogDto[]

            const result = updateArticleIngestionLogs(prevLogs, newLogs)
            expect(result).toEqual([
                { id: 1, status: 'SUCCESSFUL', url: 'https://example.com' },
                { id: 2, status: 'SUCCESSFUL', url: 'https://example2.com' },
            ])
        })
    })
})
