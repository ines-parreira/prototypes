import React from 'react'

import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import * as resources from 'models/helpCenter/resources'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { buildSDKMocks } from 'rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

// Mock dependencies
jest.mock('@repo/logging')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')

const getArticleIngestionLogsSpy = jest.spyOn(
    resources,
    'getArticleIngestionLogs',
)
const getArticleIngestionArticleTitlesAndStatusSpy = jest.spyOn(
    resources,
    'getArticleIngestionArticleTitlesAndStatus',
)
const mockReportError = jest.mocked(reportError)

const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

// Test fixtures
const articleIngestionLogDtoFixture = (
    overrides?: Partial<Components.Schemas.ArticleIngestionLogDto>,
): Components.Schemas.ArticleIngestionLogDto => {
    return {
        id: 1,
        status: 'SUCCESSFUL',
        url: 'https://example.com',
        created_datetime: '2021-01-01T00:00:00.000Z',
        ...overrides,
    } as Components.Schemas.ArticleIngestionLogDto
}

const baseArticleFixture = (overrides?: any) => ({
    id: 1,
    title: 'Test Article',
    ...overrides,
})

const queryClient = mockQueryClient()
const HELP_CENTER_ID_1 = 101
const HELP_CENTER_ID_2 = 102
const HELP_CENTER_ID_1_LOG_1 = 201
const HELP_CENTER_ID_1_LOG_2 = 202
const HELP_CENTER_ID_2_LOG_1 = 203
const HELP_CENTER_ID_2_LOG_2 = 204

describe('useMultiplePublicResources', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })

        // Reset mocks
        jest.clearAllMocks()

        // Setup mock implementation for getArticleIngestionLogs
        getArticleIngestionLogsSpy.mockImplementation((_, args) => {
            if (args.help_center_id === HELP_CENTER_ID_1) {
                return Promise.resolve([
                    articleIngestionLogDtoFixture({
                        id: HELP_CENTER_ID_1_LOG_1,
                        created_datetime: '2022-01-01T00:00:00.000Z',
                    }),
                    articleIngestionLogDtoFixture({
                        id: HELP_CENTER_ID_1_LOG_2,
                        created_datetime: '2021-01-01T00:00:00.000Z',
                    }),
                ])
            }

            if (args.help_center_id === HELP_CENTER_ID_2) {
                return Promise.resolve([
                    articleIngestionLogDtoFixture({
                        id: HELP_CENTER_ID_2_LOG_1,
                        created_datetime: '2021-02-01T00:00:00.000Z',
                    }),
                    articleIngestionLogDtoFixture({
                        id: HELP_CENTER_ID_2_LOG_2,
                        created_datetime: '2022-02-01T00:00:00.000Z',
                    }),
                ])
            }

            return Promise.reject(new Error('Invalid help center ID'))
        })

        // Setup mock implementation for getArticleIngestionArticleTitlesAndStatus
        getArticleIngestionArticleTitlesAndStatusSpy.mockImplementation(
            (_, args) => {
                const ingestionId = args.article_ingestion_id
                return Promise.resolve([
                    baseArticleFixture({
                        id: ingestionId,
                        title: `Article for ingestion ${ingestionId}`,
                    }),
                ] as any)
            },
        )
    })

    it('should handle loading state correctly', async () => {
        const { result } = renderHook(
            () =>
                useMultiplePublicResources({
                    helpCenterIds: [HELP_CENTER_ID_1, HELP_CENTER_ID_2],
                    queryOptionsOverrides: { enabled: true },
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        // Initially loading
        expect(result.current.isSourceItemsListLoading).toBe(true)
        expect(result.current.sourceItems).toEqual([])

        // Wait for loading to complete
        await waitFor(() =>
            expect(result.current.isSourceItemsListLoading).toBe(false),
        )
    })

    it('should fetch and transform data from multiple help centers', async () => {
        const { result } = renderHook(
            () =>
                useMultiplePublicResources({
                    helpCenterIds: [HELP_CENTER_ID_1, HELP_CENTER_ID_2],
                    queryOptionsOverrides: { enabled: true },
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        // Wait for loading to complete
        await waitFor(() =>
            expect(result.current.isSourceItemsListLoading).toBe(false),
        )

        // Check that data is transformed correctly
        expect(result.current.sourceItems).toHaveLength(4)

        // Verify the data structure matches what the function returns
        const items = result.current.sourceItems
        expect(
            items.some((item) => item?.ingestionId === HELP_CENTER_ID_1_LOG_1),
        ).toBe(true)
        expect(
            items.some((item) => item?.ingestionId === HELP_CENTER_ID_1_LOG_2),
        ).toBe(true)
        expect(
            items.some((item) => item?.ingestionId === HELP_CENTER_ID_2_LOG_1),
        ).toBe(true)
        expect(
            items.some((item) => item?.ingestionId === HELP_CENTER_ID_2_LOG_2),
        ).toBe(true)

        // Check that helpCenterId is added to each item
        expect(
            items.filter((item) => item?.helpCenterId === HELP_CENTER_ID_1),
        ).toHaveLength(2)
        expect(
            items.filter((item) => item?.helpCenterId === HELP_CENTER_ID_2),
        ).toHaveLength(2)
    })

    it('should handle API errors correctly', async () => {
        const invalidHelpCenterId = 999
        const error = new Error('Invalid help center ID')

        getArticleIngestionLogsSpy.mockImplementation((_, args) => {
            if (args.help_center_id === invalidHelpCenterId) {
                return Promise.reject(error)
            }
            return Promise.resolve([])
        })

        const { result } = renderHook(
            () =>
                useMultiplePublicResources({
                    helpCenterIds: [invalidHelpCenterId],
                    queryOptionsOverrides: { enabled: true },
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() =>
            expect(result.current.isSourceItemsListLoading).toBe(false),
        )

        // Verify error reporting
        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                context:
                    'Error during article ingestion logs fetching (multiple)',
            },
        })
    })

    it('should respect queryOptionsOverrides parameter', async () => {
        const { result } = renderHook(
            () =>
                useMultiplePublicResources({
                    helpCenterIds: [HELP_CENTER_ID_1],
                    queryOptionsOverrides: { enabled: false },
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        // Wait for any potential loading to finish
        await waitFor(() => {
            // With disabled queries, we just verify that the API wasn't called
            expect(getArticleIngestionLogsSpy).not.toHaveBeenCalled()
            // And that the sourceItems are empty
            expect(result.current.sourceItems).toEqual([])
        })
    })

    it('should handle overrides parameter correctly', async () => {
        const overrides = { limit: 10 } as any

        const { result } = renderHook(
            () =>
                useMultiplePublicResources({
                    helpCenterIds: [HELP_CENTER_ID_1],
                    overrides,
                    queryOptionsOverrides: { enabled: true },
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() =>
            expect(result.current.isSourceItemsListLoading).toBe(false),
        )

        // Verify overrides were passed to the API call
        expect(getArticleIngestionLogsSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                help_center_id: HELP_CENTER_ID_1,
                ...overrides,
            }),
        )
    })
})
