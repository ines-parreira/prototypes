import { renderHook, waitFor } from '@testing-library/react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'

import { useDomainSyncStatus } from './useDomainSyncStatus'

jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog')
jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/utils')

const mockUseGetStoreDomainIngestionLog = jest.requireMock(
    'pages/aiAgent/hooks/useGetStoreDomainIngestionLog',
).useGetStoreDomainIngestionLog as jest.Mock

const mockDispatchDocumentEvent = jest.requireMock(
    'pages/aiAgent/KnowledgeHub/EmptyState/utils',
).dispatchDocumentEvent as jest.Mock

describe('useDomainSyncStatus', () => {
    const mockParams = {
        helpCenterId: 123,
        storeUrl: 'https://test-store.myshopify.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: null,
            storeDomainIngestionLog: undefined,
        })
    })

    it('returns sync status from useGetStoreDomainIngestionLog', () => {
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })

        const { result } = renderHook(() => useDomainSyncStatus(mockParams))

        expect(result.current.syncStatus).toBe(IngestionLogStatus.Pending)
    })

    it('calls useGetStoreDomainIngestionLog with correct parameters', () => {
        renderHook(() => useDomainSyncStatus(mockParams))

        expect(mockUseGetStoreDomainIngestionLog).toHaveBeenCalledWith({
            helpCenterId: 123,
            storeUrl: 'https://test-store.myshopify.com',
            shouldPoll: true,
        })
    })

    it('dispatches refetch event when sync completes successfully', async () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        // Initial render with pending status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        // Update to successful status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Successful,
        })
        rerender()

        await waitFor(() => {
            expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                'refetch-knowledge-hub-table',
            )
        })
    })

    it('does not dispatch event when status changes from null to pending', () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        // Initial render with null status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: null,
            storeDomainIngestionLog: undefined,
        })
        rerender()

        // Update to pending status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
    })

    it('does not dispatch event when status changes from pending to failed', () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        // Initial render with pending status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        // Update to failed status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Failed,
        })
        rerender()

        expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
    })

    it('does not dispatch event when status remains pending', () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        // Initial render with pending status
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        // Rerender with same pending status
        rerender()

        expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
    })

    it('handles null storeUrl parameter', () => {
        const paramsWithNullUrl = {
            helpCenterId: 123,
            storeUrl: null,
        }

        renderHook(() => useDomainSyncStatus(paramsWithNullUrl))

        expect(mockUseGetStoreDomainIngestionLog).toHaveBeenCalledWith({
            helpCenterId: 123,
            storeUrl: null,
            shouldPoll: true,
        })
    })
})
