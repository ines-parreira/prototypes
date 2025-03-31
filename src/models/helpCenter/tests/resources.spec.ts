import { HELP_CENTER_ROOT_CATEGORY_ID } from 'pages/settings/helpCenter/constants'
import { HelpCenterClient } from 'rest_api/help_center_api/client'

import {
    createFileIngestion,
    deleteFileIngestion,
    getArticleIngestionLogs,
    getCategoryTree,
    getFileIngestion,
    getHelpCenterArticles,
    getHelpCenterList,
    getIngestionLogs,
    startArticleIngestion,
    startIngestion,
} from '../resources'

const help_center_id = 1

describe('resources', () => {
    describe('getHelpCenterArticles', () => {
        it('should return null when client is not set', async () => {
            const result = await getHelpCenterArticles(
                undefined,
                { help_center_id },
                {},
            )

            expect(result).toBeNull()
        })

        it('should return correct params from API', async () => {
            const listArticles = jest
                .fn()
                .mockReturnValue(Promise.resolve({ data: [] }))
            const result = await getHelpCenterArticles(
                { listArticles } as unknown as HelpCenterClient,
                { help_center_id },
                {},
            )

            expect(result).toEqual([])
        })
    })
    describe('getCategoryTree', () => {
        it('should return null when client is not set', async () => {
            const result = await getCategoryTree(
                undefined,
                {
                    help_center_id,
                    parent_category_id: HELP_CENTER_ROOT_CATEGORY_ID,
                },
                { locale: 'en-US' },
            )

            expect(result).toBeNull()
        })

        it('should return correct params from API', async () => {
            const response = {
                created_datetime: '2023-11-21T11:08:23.932Z',
                updated_datetime: '2023-11-21T11:08:23.932Z',
                id: 0,
                help_center_id,
                available_locales: [],
                unlisted_id: 'id',
                children: [],
                articles: [],
            }
            const client = {
                getCategoryTree: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: response })),
            }
            const result = await getCategoryTree(
                client as unknown as HelpCenterClient,
                {
                    help_center_id,
                    parent_category_id: HELP_CENTER_ROOT_CATEGORY_ID,
                },
                { locale: 'en-US' },
            )

            expect(result).toEqual(response)
        })
    })

    describe('getHelpCenterList', () => {
        it('should return null when client is not set', async () => {
            const result = await getHelpCenterList(undefined, {})

            expect(result).toBeNull()
        })

        it('should return correct result from API', async () => {
            const client = {
                listHelpCenters: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: [] })),
            }

            const result = await getHelpCenterList(
                client as unknown as HelpCenterClient,
                {},
            )

            expect(result).toEqual({ data: [] })
        })
    })

    describe('getArticleIngestionLogs', () => {
        it('should return correct result from API', async () => {
            const client = {
                getArticleIngestionLogs: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: [] })),
            }
            const result = await getArticleIngestionLogs(
                client as unknown as HelpCenterClient,
                { help_center_id },
            )

            expect(result).toEqual([])
        })

        it('should return null when client is not set', async () => {
            const result = await getArticleIngestionLogs(undefined, {
                help_center_id,
            })
            expect(result).toBeNull()
        })
    })

    describe('startArticleIngestion', () => {
        it('should return null when client is not set', async () => {
            const result = await startArticleIngestion(
                undefined,
                {
                    help_center_id,
                },
                { links: [] },
            )
            expect(result).toBeNull()
        })

        it('should return correct result from API', async () => {
            const client = {
                startArticleIngestion: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: null })),
            }
            const result = await startArticleIngestion(
                client as unknown as HelpCenterClient,
                { help_center_id },
                { links: [] },
            )
            expect(result).toEqual({ data: null })
        })
    })

    describe('getIngestionLogs', () => {
        it('should return correct result from API', async () => {
            const client = {
                getIngestionLogs: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: [] })),
            }
            const result = await getIngestionLogs(
                client as unknown as HelpCenterClient,
                { help_center_id },
            )

            expect(result).toEqual([])
        })

        it('should return null when client is not set', async () => {
            const result = await getIngestionLogs(undefined, {
                help_center_id,
            })
            expect(result).toBeNull()
        })
    })

    describe('startIngestion', () => {
        it('should return null when client is not set', async () => {
            const result = await startIngestion(
                undefined,
                {
                    help_center_id,
                },
                {
                    url: 'https://test.com',
                    type: 'domain',
                },
            )
            expect(result).toBeNull()
        })

        it('should return correct result from API', async () => {
            const client = {
                startIngestion: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: null })),
            }
            const result = await startIngestion(
                client as unknown as HelpCenterClient,
                { help_center_id },
                {
                    url: 'https://test.com',
                    type: 'domain',
                },
            )
            expect(result).toEqual({ data: null })
        })
    })

    describe('createFileIngestion', () => {
        it('should return null when client is not set', async () => {
            const result = await createFileIngestion(
                undefined,
                {
                    help_center_id,
                },
                {
                    filename: 'my-file.pdf',
                    type: 'pdf',
                    size_bytes: 999999,
                    google_storage_url: 'https://cdn.google.com',
                },
            )
            expect(result).toBeNull()
        })

        it('should return correct result from API', async () => {
            const client = {
                createFileIngestion: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: null })),
            }
            const result = await createFileIngestion(
                client as unknown as HelpCenterClient,
                { help_center_id },
                {
                    filename: 'my-file.pdf',
                    type: 'pdf',
                    size_bytes: 999999,
                    google_storage_url: 'https://cdn.google.com',
                },
            )
            expect(result).toEqual({ data: null })
        })
    })

    describe('getFileIngestion', () => {
        it('should return correct result from API', async () => {
            const client = {
                getFileIngestion: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: [] })),
            }
            const result = await getFileIngestion(
                client as unknown as HelpCenterClient,
                { help_center_id },
            )

            expect(result).toEqual({ data: [] })
        })

        it('should return null when client is not set', async () => {
            const result = await getFileIngestion(undefined, {
                help_center_id,
            })
            expect(result).toBeNull()
        })
    })

    describe('deleteFileIngestion', () => {
        it('should return null when client is not set', async () => {
            const result = await deleteFileIngestion(undefined, {
                help_center_id,
                file_ingestion_id: 44,
            })
            expect(result).toBeNull()
        })

        it('should return correct result from API', async () => {
            const client = {
                deleteFileIngestion: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ data: null })),
            }
            const result = await deleteFileIngestion(
                client as unknown as HelpCenterClient,
                { help_center_id, file_ingestion_id: 44 },
            )
            expect(result).toEqual({ data: null })
        })
    })
})
