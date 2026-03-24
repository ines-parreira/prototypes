import React from 'react'

import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useSearchParam } from 'hooks/useSearchParam'
import { useGetArticleIngestionLogs } from 'models/helpCenter/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAiAgentNavigation } from '../useAiAgentNavigation'
import { usePublicResourcesPooling } from '../usePublicResourcesPooling'

const queryClient = mockQueryClient()

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('state/notifications/actions')

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

jest.mock('../useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleIngestionLogs: jest.fn(),
    helpCenterKeys: {
        articleIngestionLogs: jest.fn((helpCenterId: number, params?: any) =>
            ['articleIngestionLogs', helpCenterId, params].filter(Boolean),
        ),
    },
}))
const mockUseGetArticleIngestionLogs = assumeMock(useGetArticleIngestionLogs)

jest.mock('hooks/useSearchParam')
const mockUseSearchParam = assumeMock(useSearchParam)

describe('usePublicResourcesPooling', () => {
    const shopName = 'test-shop'
    const helpCenterId = 1
    beforeEach(() => {
        jest.resetAllMocks()
        window.location.pathname = `/app/automation/shopify/${shopName}/ai-agent/new`
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                test: `/app/automation/shopify/${shopName}/ai-agent/test`,
                configuration: () =>
                    `/app/automation/shopify/${shopName}/ai-agent?section=${shopName}`,
                onboardingWizard: `/app/automation/shopify/${shopName}/ai-agent/new`,
                urlArticles: (id: number) =>
                    `/app/automation/shopify/${shopName}/ai-agent/articles/${id}`,
            },
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
        mockUseGetArticleIngestionLogs.mockReturnValue({
            data: [
                { id: 1, status: 'PENDING' },
                { id: 2, status: 'SUCCESSFUL' },
            ],
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)
        mockUseSearchParam.mockReturnValue([null, jest.fn()])
    })

    const setupHook = (shopName: string, helpCenterId: number) => {
        return renderHook(
            () => usePublicResourcesPooling({ shopName, helpCenterId }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )
    }

    it('should report an error if article ingestion logs fetching fails', () => {
        const mockedError = new Error('Test error')
        mockUseGetArticleIngestionLogs.mockReturnValue({
            error: mockedError,
        } as unknown as ReturnType<typeof useGetArticleIngestionLogs>)

        setupHook(shopName, helpCenterId)

        expect(reportError).toHaveBeenCalledWith(mockedError, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: { context: 'Error during article ingestion logs pooling' },
        })
    })

    it('should call the notify action with syncing message when logs are pending', () => {
        setupHook(shopName, helpCenterId)

        expect(notify).toHaveBeenCalledWith({
            status: NotificationStatus.Loading,
            message:
                'Syncing in progress. You can finish onboarding while sources are syncing.',
            showDismissButton: true,
            dismissible: true,
        })
    })

    describe('Query cache management for finished logs', () => {
        let mockSetQueryData: jest.Mock
        let mockRemoveQueries: jest.Mock

        beforeEach(() => {
            mockSetQueryData = jest.fn()
            mockRemoveQueries = jest.fn()

            queryClient.setQueryData = mockSetQueryData
            queryClient.removeQueries = mockRemoveQueries

            mockUseSearchParam.mockReturnValue([null, jest.fn()])
        })

        it('should return early when no finished article ingestion logs exist', () => {
            mockUseGetArticleIngestionLogs.mockImplementation((params) => {
                if (params.ids) {
                    return {
                        data: [],
                        error: null,
                    } as unknown as ReturnType<
                        typeof useGetArticleIngestionLogs
                    >
                }

                return {
                    data: [
                        { id: 1, status: 'PENDING' },
                        { id: 2, status: 'PENDING' },
                    ],
                } as unknown as ReturnType<typeof useGetArticleIngestionLogs>
            })

            setupHook(shopName, helpCenterId)

            // Should not update query cache since all are still pending
            expect(mockSetQueryData).not.toHaveBeenCalled()
            expect(mockRemoveQueries).not.toHaveBeenCalled()
        })

        it('should return early if wizardQueryParam is set', async () => {
            mockSetQueryData = jest.fn()
            mockRemoveQueries = jest.fn()
            queryClient.setQueryData = mockSetQueryData
            queryClient.removeQueries = mockRemoveQueries

            mockUseSearchParam.mockReturnValue(['someValue', jest.fn()])

            mockUseGetArticleIngestionLogs.mockImplementation((params) => {
                if (params.ids) {
                    return {
                        data: [{ id: 1, status: 'SUCCESSFUL' }],
                        error: null,
                    } as unknown as ReturnType<
                        typeof useGetArticleIngestionLogs
                    >
                }
                return {
                    data: [{ id: 1, status: 'PENDING' }],
                } as unknown as ReturnType<typeof useGetArticleIngestionLogs>
            })

            await act(async () => {
                setupHook(shopName, helpCenterId)
            })

            expect(notify).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.Success,
                }),
            )
            expect(notify).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should return early if current path matches urlArticles', async () => {
            mockSetQueryData = jest.fn()
            mockRemoveQueries = jest.fn()
            queryClient.setQueryData = mockSetQueryData
            queryClient.removeQueries = mockRemoveQueries

            mockUseSearchParam.mockReturnValue([null, jest.fn()])
            window.location.pathname = `/app/automation/shopify/${shopName}/ai-agent/articles/1`

            mockUseGetArticleIngestionLogs.mockImplementation((params) => {
                if (params.ids) {
                    // Second call for processing logs - return finished logs to trigger useEffect
                    return {
                        data: [{ id: 1, status: 'SUCCESSFUL' }],
                        error: null,
                    } as unknown as ReturnType<
                        typeof useGetArticleIngestionLogs
                    >
                }
                return {
                    data: [{ id: 1, status: 'PENDING' }],
                } as unknown as ReturnType<typeof useGetArticleIngestionLogs>
            })

            await act(async () => {
                setupHook(shopName, helpCenterId)
            })

            expect(notify).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.Success,
                }),
            )
            expect(notify).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.Error,
                }),
            )
        })
    })
})
