import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import * as resources from 'models/helpCenter/resources'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { Components } from 'rest_api/help_center_api/client.generated'
import { buildSDKMocks } from 'rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import * as errors from 'utils/errors'
import { renderHook } from 'utils/testing/renderHook'

// Mock dependencies
const getArticleIngestionLogsSpy = jest.spyOn(
    resources,
    'getArticleIngestionLogs',
)
const reportErrorSpy = jest.spyOn(errors, 'reportError')

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
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
    })

    it('should handle loading state correctly', async () => {
        const { result } = renderHook(
            () =>
                useMultiplePublicResources({
                    helpCenterIds: [HELP_CENTER_ID_1, HELP_CENTER_ID_2],
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

        // Verify sorting and mapping
        const items = result.current.sourceItems
        expect(items.some((item) => item.id === HELP_CENTER_ID_1_LOG_1)).toBe(
            true,
        )
        expect(items.some((item) => item.id === HELP_CENTER_ID_1_LOG_2)).toBe(
            true,
        )
        expect(items.some((item) => item.id === HELP_CENTER_ID_2_LOG_1)).toBe(
            true,
        )
        expect(items.some((item) => item.id === HELP_CENTER_ID_2_LOG_2)).toBe(
            true,
        )

        // Check that helpCenterId is added to each item
        expect(
            items.filter((item) => item.helpCenterId === HELP_CENTER_ID_1),
        ).toHaveLength(2)
        expect(
            items.filter((item) => item.helpCenterId === HELP_CENTER_ID_2),
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
        expect(reportErrorSpy).toHaveBeenCalledWith(error, {
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
