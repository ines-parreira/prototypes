import type { Components } from 'rest_api/help_center_api/client.generated'

import type { SourceItem } from '../../../components/PublicSourcesSection/types'
import type { KnowledgeSourceStatus } from '../knowledgeSourcesAnalysis'
import {
    analyzeKnowledgeSources,
    formatSyncingSourcesMessage,
} from '../knowledgeSourcesAnalysis'

describe('analyzeKnowledgeSources', () => {
    describe('with empty inputs', () => {
        it('should return empty analysis when no sources provided', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result).toEqual({
                availableSources: [],
                syncingSources: [],
                failedSources: [],
                hasAnySources: false,
                hasAvailableSources: false,
                hasSyncingSources: false,
            })
        })

        it('should return empty analysis when all arrays are empty', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: [],
                ingestedFiles: [],
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result).toEqual({
                availableSources: [],
                syncingSources: [],
                failedSources: [],
                hasAnySources: false,
                hasAvailableSources: false,
                hasSyncingSources: false,
            })
        })
    })

    describe('with help center', () => {
        it('should mark help center as available when connected', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: undefined,
                helpCenterId: 123,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toContainEqual({
                type: 'helpCenter',
                name: 'Help Center',
                state: 'available',
            })
            expect(result.hasAvailableSources).toBe(true)
            expect(result.hasAnySources).toBe(true)
        })

        it('should not include help center when not connected', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).not.toContainEqual(
                expect.objectContaining({ type: 'helpCenter' }),
            )
        })
    })

    describe('with guidance articles', () => {
        it('should mark guidance as available with singular article', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 1,
            })

            expect(result.availableSources).toContainEqual({
                type: 'guidance',
                name: 'Guidance (1 article)',
                state: 'available',
            })
            expect(result.hasAvailableSources).toBe(true)
        })

        it('should mark guidance as available with plural articles', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 5,
            })

            expect(result.availableSources).toContainEqual({
                type: 'guidance',
                name: 'Guidance (5 articles)',
                state: 'available',
            })
        })

        it('should not include guidance when count is 0', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).not.toContainEqual(
                expect.objectContaining({ type: 'guidance' }),
            )
        })
    })

    describe('with source items', () => {
        it('should categorize public URL source as available when done', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://example.com',
                    source: 'url',
                    status: 'done',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toContainEqual({
                type: 'publicUrl',
                name: 'https://example.com',
                state: 'available',
            })
            expect(result.hasAvailableSources).toBe(true)
        })

        it('should categorize domain source as available when done', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'example.com',
                    source: 'domain',
                    status: 'done',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toContainEqual({
                type: 'domain',
                name: 'example.com',
                state: 'available',
            })
        })

        it('should categorize source as syncing when loading', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://example.com',
                    source: 'url',
                    status: 'loading',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.syncingSources).toContainEqual({
                type: 'publicUrl',
                name: 'https://example.com',
                state: 'syncing',
            })
            expect(result.hasSyncingSources).toBe(true)
            expect(result.hasAnySources).toBe(true)
        })

        it('should categorize source as failed when error', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://example.com',
                    source: 'url',
                    status: 'error',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.failedSources).toContainEqual({
                type: 'publicUrl',
                name: 'https://example.com',
                state: 'failed',
            })
            expect(result.hasAnySources).toBe(true)
        })

        it('should categorize source as failed when idle', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://example.com',
                    source: 'url',
                    status: 'idle',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.failedSources).toContainEqual({
                type: 'publicUrl',
                name: 'https://example.com',
                state: 'failed',
            })
        })

        it('should handle multiple sources with different statuses', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://done.com',
                    source: 'url',
                    status: 'done',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
                {
                    id: 2,
                    url: 'https://loading.com',
                    source: 'url',
                    status: 'loading',
                    createdDatetime: '2024-11-02T00:00:00Z',
                },
                {
                    id: 3,
                    url: 'error.com',
                    source: 'domain',
                    status: 'error',
                    createdDatetime: '2024-11-03T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toHaveLength(1)
            expect(result.syncingSources).toHaveLength(1)
            expect(result.failedSources).toHaveLength(1)
            expect(result.hasAvailableSources).toBe(true)
            expect(result.hasSyncingSources).toBe(true)
        })
    })

    describe('with ingested files', () => {
        it('should categorize file as available when successful', () => {
            const ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] =
                [
                    {
                        id: 1,
                        help_center_id: 1,
                        filename: 'document.pdf',
                        status: 'SUCCESSFUL',
                        google_storage_url:
                            'https://storage.googleapis.com/document.pdf',
                        uploaded_datetime: '2024-11-01T00:00:00Z',
                        snippets_article_ids: [],
                    },
                ]

            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toContainEqual({
                type: 'file',
                name: 'document.pdf',
                state: 'available',
            })
            expect(result.hasAvailableSources).toBe(true)
        })

        it('should use file ID as fallback when filename is missing', () => {
            const ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] =
                [
                    {
                        id: 42,
                        help_center_id: 1,
                        filename: '',
                        status: 'SUCCESSFUL',
                        google_storage_url: 'https://storage.googleapis.com/',
                        uploaded_datetime: '2024-11-01T00:00:00Z',
                        snippets_article_ids: [],
                    },
                ]

            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toContainEqual({
                type: 'file',
                name: 'File #42',
                state: 'available',
            })
        })

        it('should categorize file as syncing when pending', () => {
            const ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] =
                [
                    {
                        id: 1,
                        help_center_id: 1,
                        filename: 'document.pdf',
                        status: 'PENDING',
                        google_storage_url:
                            'https://storage.googleapis.com/document.pdf',
                        uploaded_datetime: '2024-11-01T00:00:00Z',
                        snippets_article_ids: [],
                    },
                ]

            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.syncingSources).toContainEqual({
                type: 'file',
                name: 'document.pdf',
                state: 'syncing',
            })
            expect(result.hasSyncingSources).toBe(true)
        })

        it('should categorize file as failed when failed', () => {
            const ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] =
                [
                    {
                        id: 1,
                        help_center_id: 1,
                        filename: 'document.pdf',
                        status: 'FAILED',
                        google_storage_url:
                            'https://storage.googleapis.com/document.pdf',
                        uploaded_datetime: '2024-11-01T00:00:00Z',
                        snippets_article_ids: [],
                    },
                ]

            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.failedSources).toContainEqual({
                type: 'file',
                name: 'document.pdf',
                state: 'failed',
            })
        })

        it('should handle multiple files with different statuses', () => {
            const ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] =
                [
                    {
                        id: 1,
                        help_center_id: 1,
                        filename: 'success.pdf',
                        status: 'SUCCESSFUL',
                        google_storage_url:
                            'https://storage.googleapis.com/success.pdf',
                        uploaded_datetime: '2024-11-01T00:00:00Z',
                        snippets_article_ids: [],
                    },
                    {
                        id: 2,
                        help_center_id: 1,
                        filename: 'pending.pdf',
                        status: 'PENDING',
                        google_storage_url:
                            'https://storage.googleapis.com/pending.pdf',
                        uploaded_datetime: '2024-11-02T00:00:00Z',
                        snippets_article_ids: [],
                    },
                    {
                        id: 3,
                        help_center_id: 1,
                        filename: 'failed.pdf',
                        status: 'FAILED',
                        google_storage_url:
                            'https://storage.googleapis.com/failed.pdf',
                        uploaded_datetime: '2024-11-03T00:00:00Z',
                        snippets_article_ids: [],
                    },
                ]

            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toHaveLength(1)
            expect(result.syncingSources).toHaveLength(1)
            expect(result.failedSources).toHaveLength(1)
        })

        it('should handle null ingestedFiles', () => {
            const result = analyzeKnowledgeSources({
                sourceItems: undefined,
                ingestedFiles: null,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.availableSources).toHaveLength(0)
        })
    })

    describe('with combined sources', () => {
        it('should analyze all source types together', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://example.com',
                    source: 'url',
                    status: 'done',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
                {
                    id: 2,
                    url: 'https://loading.com',
                    source: 'url',
                    status: 'loading',
                    createdDatetime: '2024-11-02T00:00:00Z',
                },
            ]

            const ingestedFiles: Components.Schemas.RetrieveFileIngestionLogDto[] =
                [
                    {
                        id: 1,
                        help_center_id: 1,
                        filename: 'doc.pdf',
                        status: 'SUCCESSFUL',
                        google_storage_url:
                            'https://storage.googleapis.com/doc.pdf',
                        uploaded_datetime: '2024-11-01T00:00:00Z',
                        snippets_article_ids: [],
                    },
                    {
                        id: 2,
                        help_center_id: 1,
                        filename: 'pending.pdf',
                        status: 'PENDING',
                        google_storage_url:
                            'https://storage.googleapis.com/pending.pdf',
                        uploaded_datetime: '2024-11-02T00:00:00Z',
                        snippets_article_ids: [],
                    },
                ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles,
                helpCenterId: 123,
                guidanceUsedCount: 3,
            })

            expect(result.availableSources).toHaveLength(4)
            expect(result.syncingSources).toHaveLength(2)
            expect(result.hasAvailableSources).toBe(true)
            expect(result.hasSyncingSources).toBe(true)
            expect(result.hasAnySources).toBe(true)
        })

        it('should set hasAnySources true when only failed sources exist', () => {
            const sourceItems: SourceItem[] = [
                {
                    id: 1,
                    url: 'https://error.com',
                    source: 'url',
                    status: 'error',
                    createdDatetime: '2024-11-01T00:00:00Z',
                },
            ]

            const result = analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles: undefined,
                helpCenterId: null,
                guidanceUsedCount: 0,
            })

            expect(result.hasAnySources).toBe(true)
            expect(result.hasAvailableSources).toBe(false)
            expect(result.hasSyncingSources).toBe(false)
        })
    })
})

describe('formatSyncingSourcesMessage', () => {
    it('should return null when no syncing sources', () => {
        const result = formatSyncingSourcesMessage([])

        expect(result).toBeNull()
    })

    it('should format single public URL source', () => {
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'publicUrl',
                name: 'https://example.com/page',
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result).toEqual({
            count: 1,
            sources: [{ label: 'URL', name: 'https://example.com/page' }],
        })
    })

    it('should format single domain source', () => {
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'domain',
                name: 'example.com',
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result).toEqual({
            count: 1,
            sources: [{ label: 'Domain', name: 'example.com' }],
        })
    })

    it('should format single file source', () => {
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'file',
                name: 'document.pdf',
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result).toEqual({
            count: 1,
            sources: [{ label: 'File', name: 'document.pdf' }],
        })
    })

    it('should return correct count for multiple sources', () => {
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'publicUrl',
                name: 'https://example1.com',
                state: 'syncing',
            },
            {
                type: 'domain',
                name: 'example2.com',
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result).toEqual({
            count: 2,
            sources: [
                { label: 'URL', name: 'https://example1.com' },
                { label: 'Domain', name: 'example2.com' },
            ],
        })
    })

    it('should truncate long URLs', () => {
        const longUrl =
            'https://example.com/very/long/path/that/exceeds/fifty/characters/in/length'
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'publicUrl',
                name: longUrl,
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result?.sources[0].name).toBe(
            'https://example.com/very/long/path/that/exceeds...',
        )
    })

    it('should handle mixed source types', () => {
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'publicUrl',
                name: 'https://example.com',
                state: 'syncing',
            },
            {
                type: 'domain',
                name: 'example.org',
                state: 'syncing',
            },
            {
                type: 'file',
                name: 'doc.pdf',
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result).toEqual({
            count: 3,
            sources: [
                { label: 'URL', name: 'https://example.com' },
                { label: 'Domain', name: 'example.org' },
                { label: 'File', name: 'doc.pdf' },
            ],
        })
    })

    it('should handle unknown source types by using name directly with empty label', () => {
        const syncingSources: KnowledgeSourceStatus[] = [
            {
                type: 'helpCenter' as any,
                name: 'Help Center',
                state: 'syncing',
            },
        ]

        const result = formatSyncingSourcesMessage(syncingSources)

        expect(result).toEqual({
            count: 1,
            sources: [{ label: '', name: 'Help Center' }],
        })
    })
})
