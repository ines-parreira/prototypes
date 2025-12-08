import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'

import {
    dispatchDocumentEvent,
    useListenToDocumentEvent,
} from '../EmptyState/utils'
import { useFileIngestionStatus } from './useFileIngestionStatus'

jest.mock('models/helpCenter/queries', () => ({
    useGetFileIngestion: jest.fn(),
}))

jest.mock('../EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

const mockUseGetFileIngestion = jest.requireMock(
    'models/helpCenter/queries',
).useGetFileIngestion

const mockUseListenToDocumentEvent =
    useListenToDocumentEvent as jest.MockedFunction<
        typeof useListenToDocumentEvent
    >

const mockDispatchDocumentEvent = dispatchDocumentEvent as jest.MockedFunction<
    typeof dispatchDocumentEvent
>

describe('useFileIngestionStatus', () => {
    let queryClient: QueryClient
    let fileUploadEventCallback: (event?: Event) => void

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
        mockUseListenToDocumentEvent.mockImplementation(
            (eventName, callback) => {
                if (eventName === 'file-upload-started') {
                    fileUploadEventCallback = callback
                }
            },
        )
    })

    afterEach(() => {
        queryClient.clear()
    })

    describe('initial state', () => {
        it('returns undefined status when no files exist', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: { data: [] },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            expect(result.current.fileIngestionStatus).toBeUndefined()
            expect(result.current.fileIngestionLogs).toEqual([])
            expect(result.current.totalCount).toBe(0)
            expect(result.current.completedCount).toBe(0)
            expect(result.current.successCount).toBe(0)
        })

        it('does not poll when shouldPoll is false', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: { data: [] },
                isLoading: false,
            })

            renderHook(() => useFileIngestionStatus({ helpCenterId: 1 }), {
                wrapper: createWrapper(),
            })

            expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
                { help_center_id: 1 },
                expect.objectContaining({
                    enabled: false,
                    refetchOnWindowFocus: false,
                    refetchInterval: false,
                }),
            )
        })
    })

    describe('FILE_UPLOAD_STARTED event', () => {
        it('starts polling when FILE_UPLOAD_STARTED event is dispatched', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: { data: [] },
                isLoading: false,
            })

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                {
                    wrapper: createWrapper(),
                },
            )

            fileUploadEventCallback?.()
            rerender()

            expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
                { help_center_id: 1 },
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })
    })

    describe('file ingestion status calculation', () => {
        it('returns PENDING when any file is pending', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-02',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.fileIngestionStatus).toBe(
                IngestionLogStatus.Pending,
            )
        })

        it('returns status of latest file when no files are pending', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-02',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.fileIngestionStatus).toBe(
                IngestionLogStatus.Failed,
            )
        })

        it('returns latest file by uploaded_datetime', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-03',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 3,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-02',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.fileIngestionStatus).toBe(
                IngestionLogStatus.Successful,
            )
        })
    })

    describe('progress metrics', () => {
        it('calculates total count correctly', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-02',
                        },
                        {
                            id: 3,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-03',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.totalCount).toBe(3)
        })

        it('calculates completed count correctly', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-02',
                        },
                        {
                            id: 3,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-03',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.completedCount).toBe(2)
        })

        it('calculates success count correctly', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-02',
                        },
                        {
                            id: 3,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-03',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.successCount).toBe(2)
        })

        it('handles empty file list', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: { data: [] },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            expect(result.current.totalCount).toBe(0)
            expect(result.current.completedCount).toBe(0)
            expect(result.current.successCount).toBe(0)
        })
    })

    describe('polling behavior', () => {
        it('stops polling when no files are pending', () => {
            const mockReturnValue = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            }

            mockUseGetFileIngestion.mockReturnValue(mockReturnValue)

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()
            rerender()

            expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
                { help_center_id: 1 },
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('stops polling when file list is empty', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: { data: [] },
                isLoading: false,
            })

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()
            rerender()

            expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
                { help_center_id: 1 },
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('continues polling while files are pending', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            })

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()
            rerender()

            expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
                { help_center_id: 1 },
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })
    })

    describe('refetch event dispatching', () => {
        it('dispatches REFETCH_KNOWLEDGE_HUB_TABLE when file completes', async () => {
            const initialData = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            }

            const updatedData = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            }

            mockUseGetFileIngestion.mockReturnValue(initialData)

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            mockUseGetFileIngestion.mockReturnValue(updatedData)
            rerender()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    'refetch-knowledge-hub-table',
                )
            })
        })

        it('dispatches event when file fails', async () => {
            const initialData = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            }

            const updatedData = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            }

            mockUseGetFileIngestion.mockReturnValue(initialData)

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            mockUseGetFileIngestion.mockReturnValue(updatedData)
            rerender()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    'refetch-knowledge-hub-table',
                )
            })
        })

        it('does not dispatch event when status remains pending', async () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            })

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()
            rerender()

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('dispatches event for each file that completes', async () => {
            const initialData = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Pending,
                            uploaded_datetime: '2024-01-02',
                        },
                    ],
                },
                isLoading: false,
            }

            const updatedData = {
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-02',
                        },
                    ],
                },
                isLoading: false,
            }

            mockUseGetFileIngestion.mockReturnValue(initialData)

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            mockUseGetFileIngestion.mockReturnValue(updatedData)
            rerender()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledTimes(2)
            })
        })

        it('does not dispatch event for already completed files', async () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            })

            const { rerender } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()
            rerender()

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })
    })

    describe('edge cases', () => {
        it('handles undefined data from query', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            expect(result.current.fileIngestionLogs).toEqual([])
            expect(result.current.fileIngestionStatus).toBeUndefined()
        })

        it('handles null data from query', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: null,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            expect(result.current.fileIngestionLogs).toEqual([])
            expect(result.current.fileIngestionStatus).toBeUndefined()
        })

        it('handles files with same uploaded_datetime', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 1,
                            status: IngestionLogStatus.Successful,
                            uploaded_datetime: '2024-01-01',
                        },
                        {
                            id: 2,
                            status: IngestionLogStatus.Failed,
                            uploaded_datetime: '2024-01-01',
                        },
                    ],
                },
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            fileUploadEventCallback?.()

            expect(result.current.fileIngestionStatus).toBeDefined()
        })

        it('returns empty array when data.data is undefined', () => {
            mockUseGetFileIngestion.mockReturnValue({
                data: {} as any,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useFileIngestionStatus({ helpCenterId: 1 }),
                { wrapper: createWrapper() },
            )

            expect(result.current.fileIngestionLogs).toEqual([])
        })
    })
})
