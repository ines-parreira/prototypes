import type React from 'react'

import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetIngestionLogs } from 'models/helpCenter/queries'
import { POLLING_INTERVAL } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'

import { useGetStoreDomainIngestionLog } from '../useGetStoreDomainIngestionLog'

jest.mock('models/helpCenter/queries', () => ({
    useGetIngestionLogs: jest.fn(),
}))
const mockUseGetIngestionLogs = assumeMock(useGetIngestionLogs)

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const queryClient = new QueryClient()

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetStoreDomainIngestionLog', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('returns undefined log when storeUrl is null', () => {
        mockUseGetIngestionLogs.mockReturnValue({
            data: [],
            error: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetIngestionLogs>)

        const { result } = renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: null,
                }),
            { wrapper },
        )

        expect(result.current.storeDomainIngestionLog).toBeUndefined()
        expect(result.current.isGetIngestionLogsLoading).toBe(false)
    })

    it('returns matching log when storeUrl exists', () => {
        const mockedLogs = [
            {
                source: 'domain',
                url: 'https://store.example.com',
                status: 'SUCCESSFUL',
            },
            {
                source: 'domain',
                url: 'https://faq.example.com',
                status: 'PENDING',
            },
        ]
        mockUseGetIngestionLogs.mockReturnValue({
            data: mockedLogs,
            error: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetIngestionLogs>)

        const { result } = renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: 'https://store.example.com',
                }),
            { wrapper },
        )

        expect(result.current.storeDomainIngestionLog).toEqual(mockedLogs[0])
        expect(result.current.isGetIngestionLogsLoading).toBe(false)
    })

    it('reports error if ingestion logs query fails', () => {
        const mockedError = new Error('Test error')
        mockUseGetIngestionLogs.mockReturnValue({
            error: mockedError,
        } as unknown as ReturnType<typeof useGetIngestionLogs>)

        renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: 'https://store.example.com',
                }),
            { wrapper },
        )

        expect(reportError).toHaveBeenCalledWith(mockedError, {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                context: 'Error during ingestion logs fetching',
            },
        })
    })

    it('sets refetchInterval only when shouldPoll is true and status is Pending', () => {
        let capturedQueryOptions: any

        const mockedLogs = [
            {
                source: 'domain',
                url: 'https://store.example.com',
                status: 'PENDING',
            },
        ]

        mockUseGetIngestionLogs.mockImplementation(
            (_variables, queryOptions) => {
                capturedQueryOptions = queryOptions

                return {
                    data: mockedLogs,
                    error: null,
                    isLoading: false,
                } as unknown as ReturnType<typeof useGetIngestionLogs>
            },
        )

        renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: 'https://store.example.com',
                    shouldPoll: true,
                }),
            { wrapper },
        )

        const interval = capturedQueryOptions?.refetchInterval(mockedLogs)
        expect(interval).toBe(POLLING_INTERVAL)
    })
    it('should not set refetchInterval when the matching storeUrl is not Pending', () => {
        let capturedQueryOptions: any

        const mockedLogs = [
            {
                source: 'domain',
                url: 'https://store.example.com',
                status: 'SUCCESSFUL',
            },
            {
                source: 'domain',
                url: 'https://other-store.example.com',
                status: 'PENDING',
            },
        ]

        mockUseGetIngestionLogs.mockImplementation(
            (_variables, queryOptions) => {
                capturedQueryOptions = queryOptions

                return {
                    data: mockedLogs,
                    error: null,
                    isLoading: false,
                } as unknown as ReturnType<typeof useGetIngestionLogs>
            },
        )

        renderHook(
            () =>
                useGetStoreDomainIngestionLog({
                    helpCenterId: 1,
                    storeUrl: 'https://store.example.com',
                    shouldPoll: true,
                }),
            { wrapper },
        )

        const interval = capturedQueryOptions?.refetchInterval(mockedLogs)
        expect(interval).toBe(false)
    })

    describe('cutoff date filtering', () => {
        it('returns undefined status for successful syncs before cutoff date (Jan 12, 2026)', () => {
            const mockedLogs = [
                {
                    source: 'domain',
                    url: 'https://store.example.com',
                    status: 'SUCCESSFUL',
                    latest_sync: '2026-01-11T23:59:59Z',
                },
            ]
            mockUseGetIngestionLogs.mockReturnValue({
                data: mockedLogs,
                error: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetIngestionLogs>)

            const { result } = renderHook(
                () =>
                    useGetStoreDomainIngestionLog({
                        helpCenterId: 1,
                        storeUrl: 'https://store.example.com',
                    }),
                { wrapper },
            )

            expect(result.current.status).toBeUndefined()
        })

        it('returns successful status for syncs on or after cutoff date (Jan 12, 2026)', () => {
            const mockedLogs = [
                {
                    source: 'domain',
                    url: 'https://store.example.com',
                    status: 'SUCCESSFUL',
                    latest_sync: '2026-01-12T00:00:00Z',
                },
            ]
            mockUseGetIngestionLogs.mockReturnValue({
                data: mockedLogs,
                error: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetIngestionLogs>)

            const { result } = renderHook(
                () =>
                    useGetStoreDomainIngestionLog({
                        helpCenterId: 1,
                        storeUrl: 'https://store.example.com',
                    }),
                { wrapper },
            )

            expect(result.current.status).toBe('SUCCESSFUL')
        })

        it('returns successful status for recent syncs after cutoff date', () => {
            const mockedLogs = [
                {
                    source: 'domain',
                    url: 'https://store.example.com',
                    status: 'SUCCESSFUL',
                    latest_sync: '2026-01-15T10:30:00Z',
                },
            ]
            mockUseGetIngestionLogs.mockReturnValue({
                data: mockedLogs,
                error: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetIngestionLogs>)

            const { result } = renderHook(
                () =>
                    useGetStoreDomainIngestionLog({
                        helpCenterId: 1,
                        storeUrl: 'https://store.example.com',
                    }),
                { wrapper },
            )

            expect(result.current.status).toBe('SUCCESSFUL')
        })

        it('does not filter failed status regardless of date', () => {
            const mockedLogs = [
                {
                    source: 'domain',
                    url: 'https://store.example.com',
                    status: 'FAILED',
                    latest_sync: '2026-01-01T00:00:00Z',
                },
            ]
            mockUseGetIngestionLogs.mockReturnValue({
                data: mockedLogs,
                error: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetIngestionLogs>)

            const { result } = renderHook(
                () =>
                    useGetStoreDomainIngestionLog({
                        helpCenterId: 1,
                        storeUrl: 'https://store.example.com',
                    }),
                { wrapper },
            )

            expect(result.current.status).toBe('FAILED')
        })

        it('does not filter pending status regardless of date', () => {
            const mockedLogs = [
                {
                    source: 'domain',
                    url: 'https://store.example.com',
                    status: 'PENDING',
                    latest_sync: '2026-01-01T00:00:00Z',
                },
            ]
            mockUseGetIngestionLogs.mockReturnValue({
                data: mockedLogs,
                error: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetIngestionLogs>)

            const { result } = renderHook(
                () =>
                    useGetStoreDomainIngestionLog({
                        helpCenterId: 1,
                        storeUrl: 'https://store.example.com',
                    }),
                { wrapper },
            )

            expect(result.current.status).toBe('PENDING')
        })

        it('returns successful status when latest_sync is missing', () => {
            const mockedLogs = [
                {
                    source: 'domain',
                    url: 'https://store.example.com',
                    status: 'SUCCESSFUL',
                    latest_sync: null,
                },
            ]
            mockUseGetIngestionLogs.mockReturnValue({
                data: mockedLogs,
                error: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetIngestionLogs>)

            const { result } = renderHook(
                () =>
                    useGetStoreDomainIngestionLog({
                        helpCenterId: 1,
                        storeUrl: 'https://store.example.com',
                    }),
                { wrapper },
            )

            expect(result.current.status).toBe('SUCCESSFUL')
        })
    })
})
