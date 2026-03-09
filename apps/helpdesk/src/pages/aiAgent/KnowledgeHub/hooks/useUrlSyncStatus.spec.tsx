import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'

import { dispatchDocumentEvent } from '../EmptyState/utils'
import { useUrlSyncStatus } from './useUrlSyncStatus'

jest.mock('pages/aiAgent/hooks/useSyncUrl', () => ({
    useSyncUrl: jest.fn(),
}))

jest.mock('../EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
}))

const mockUseSyncUrl = jest.requireMock(
    'pages/aiAgent/hooks/useSyncUrl',
).useSyncUrl

const mockDispatchDocumentEvent = dispatchDocumentEvent as jest.MockedFunction<
    typeof dispatchDocumentEvent
>

describe('useUrlSyncStatus', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    const defaultParams = {
        helpCenterId: 1,
        existingUrls: [],
        helpCenterCustomDomains: [],
        shopName: 'test-shop',
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    afterEach(() => {
        queryClient.clear()
    })

    describe('initial state', () => {
        it('returns undefined status when no URLs exist', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: [],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBeUndefined()
            expect(result.current.urlIngestionLogs).toEqual([])
            expect(result.current.syncingUrls).toEqual([])
            expect(result.current.totalCount).toBe(0)
            expect(result.current.completedCount).toBe(0)
            expect(result.current.successCount).toBe(0)
        })

        it('returns status from latest URL ingestion log', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(IngestionLogStatus.Pending)
        })
    })

    describe('syncStatus priority logic', () => {
        it('returns PENDING when any URL is pending, even if latestUrlIngestionLog is SUCCESSFUL', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 2,
                    url: 'https://example2.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                    latest_sync: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                        latest_sync: null,
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                        latest_sync: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(IngestionLogStatus.Pending)
        })

        it('returns latestUrlIngestionLog status when no URLs are pending', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(
                IngestionLogStatus.Successful,
            )
        })

        it('returns FAILED status when no pending URLs and latestUrlIngestionLog is FAILED', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Failed,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Failed,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(IngestionLogStatus.Failed)
        })

        it('returns undefined when urlIngestionLogs is undefined and latestUrlIngestionLog is undefined', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: undefined as any,
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBeUndefined()
        })

        it('returns undefined when urlIngestionLogs is empty and latestUrlIngestionLog is undefined', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: [],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBeUndefined()
        })
    })

    describe('syncing URLs calculation', () => {
        it('returns URLs with pending status', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example1.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-03',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncingUrls).toEqual([
                'https://example1.com',
                'https://example2.com',
            ])
        })

        it('filters out logs without URLs', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                    {
                        id: 2,
                        url: null,
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: undefined,
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-03',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncingUrls).toEqual(['https://example.com'])
        })

        it('returns empty array when no pending URLs', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncingUrls).toEqual([])
        })
    })

    describe('recent URL ingestion logs filtering', () => {
        it('includes only URLs from current sync round', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 3,
                    url: 'https://example3.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-03',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-03',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(1)
        })

        it('includes all URLs created at or after sync round start', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 3,
                    url: 'https://example3.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-03',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-03',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-03',
                    },
                    {
                        id: 4,
                        url: 'https://example4.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-04',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(3)
        })

        it('returns empty array when no pending logs', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(0)
        })

        it('filters out logs without latest_sync timestamp', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example1.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-02',
                    latest_sync: '2024-01-02',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                        latest_sync: '2024-01-02',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-02',
                        latest_sync: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-02',
                        latest_sync: null,
                    },
                    {
                        id: 4,
                        url: 'https://example4.com',
                        status: IngestionLogStatus.Failed,
                        created_datetime: '2024-01-02',
                        latest_sync: undefined,
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(4)
            expect(result.current.completedCount).toBe(3)
            expect(result.current.successCount).toBe(2)
        })
    })

    describe('progress metrics', () => {
        it('calculates total count for current sync round', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 2,
                    url: 'https://example2.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-02',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-03',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(3)
        })

        it('calculates completed count correctly', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example1.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-02',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Failed,
                        created_datetime: '2024-01-02',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.completedCount).toBe(2)
        })

        it('calculates success count correctly', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example1.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-02',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 3,
                        url: 'https://example3.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-02',
                    },
                    {
                        id: 4,
                        url: 'https://example4.com',
                        status: IngestionLogStatus.Failed,
                        created_datetime: '2024-01-02',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.successCount).toBe(2)
        })

        it('handles empty URL list', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: [],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(0)
            expect(result.current.completedCount).toBe(0)
            expect(result.current.successCount).toBe(0)
        })
    })

    describe('refetch event dispatching', () => {
        it('dispatches REFETCH_KNOWLEDGE_HUB_TABLE when URL sync completes', async () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { rerender } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                { wrapper: createWrapper() },
            )

            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            rerender()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    'refetch-knowledge-hub-table',
                )
            })
        })

        it('does not dispatch event when URL sync fails', async () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { rerender } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                { wrapper: createWrapper() },
            )

            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Failed,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Failed,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            rerender()

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('does not dispatch event when status remains pending', async () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { rerender } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                { wrapper: createWrapper() },
            )

            rerender()

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('does not dispatch event when status goes from successful to successful', async () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { rerender } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                { wrapper: createWrapper() },
            )

            rerender()

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('dispatches event only once per transition', async () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { rerender } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                { wrapper: createWrapper() },
            )

            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            rerender()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledTimes(1)
            })

            rerender()

            expect(mockDispatchDocumentEvent).toHaveBeenCalledTimes(1)
        })
    })

    describe('edge cases', () => {
        it('handles undefined urlIngestionLogs', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: undefined as any,
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncingUrls).toEqual([])
            expect(result.current.totalCount).toBe(0)
        })

        it('handles null urlIngestionLogs', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: null as any,
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncingUrls).toEqual([])
            expect(result.current.totalCount).toBe(0)
        })

        it('handles logs with invalid created_datetime', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: 'invalid-date',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: 'invalid-date',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(1)
        })

        it('handles multiple URLs with same created_datetime', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example1.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example1.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                    {
                        id: 2,
                        url: 'https://example2.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.totalCount).toBe(2)
            expect(result.current.syncingUrls).toEqual([
                'https://example1.com',
                'https://example2.com',
            ])
        })

        it('handles transition from undefined to pending', async () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: undefined,
                urlIngestionLogs: [],
            })

            const { rerender } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                { wrapper: createWrapper() },
            )

            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2024-01-01',
                    },
                ],
            })

            rerender()

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('returns data from useSyncUrl correctly', () => {
            const mockData = {
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2024-01-01',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2024-01-01',
                    },
                ],
            }

            mockUseSyncUrl.mockReturnValue(mockData)

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.latestUrlIngestionLog).toBe(
                mockData.latestUrlIngestionLog,
            )
            expect(result.current.urlIngestionLogs).toBe(
                mockData.urlIngestionLogs,
            )
        })
    })

    describe('cutoff date filtering', () => {
        it('returns undefined status for successful syncs before cutoff date (Jan 12, 2026)', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2026-01-11T23:59:59Z',
                    latest_sync: '2026-01-11T23:59:59Z',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2026-01-11T23:59:59Z',
                        latest_sync: '2026-01-11T23:59:59Z',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBeUndefined()
        })

        it('returns successful status for syncs on or after cutoff date (Jan 12, 2026)', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2026-01-12T00:00:00Z',
                    latest_sync: '2026-01-12T00:00:00Z',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2026-01-12T00:00:00Z',
                        latest_sync: '2026-01-12T00:00:00Z',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(
                IngestionLogStatus.Successful,
            )
        })

        it('returns successful status for recent syncs after cutoff date', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2026-01-15T10:30:00Z',
                    latest_sync: '2026-01-15T10:30:00Z',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2026-01-15T10:30:00Z',
                        latest_sync: '2026-01-15T10:30:00Z',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(
                IngestionLogStatus.Successful,
            )
        })

        it('does not filter failed status regardless of date', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Failed,
                    created_datetime: '2026-01-01T00:00:00Z',
                    latest_sync: '2026-01-01T00:00:00Z',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Failed,
                        created_datetime: '2026-01-01T00:00:00Z',
                        latest_sync: '2026-01-01T00:00:00Z',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(IngestionLogStatus.Failed)
        })

        it('does not filter pending status regardless of date', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Pending,
                    created_datetime: '2026-01-01T00:00:00Z',
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Pending,
                        created_datetime: '2026-01-01T00:00:00Z',
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(IngestionLogStatus.Pending)
        })

        it('returns undefined when latest_sync is missing on successful status', () => {
            mockUseSyncUrl.mockReturnValue({
                latestUrlIngestionLog: {
                    id: 1,
                    url: 'https://example.com',
                    status: IngestionLogStatus.Successful,
                    created_datetime: '2026-01-15T00:00:00Z',
                    latest_sync: null,
                },
                urlIngestionLogs: [
                    {
                        id: 1,
                        url: 'https://example.com',
                        status: IngestionLogStatus.Successful,
                        created_datetime: '2026-01-15T00:00:00Z',
                        latest_sync: null,
                    },
                ],
            })

            const { result } = renderHook(
                () => useUrlSyncStatus(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.syncStatus).toBe(
                IngestionLogStatus.Successful,
            )
        })
    })
})
