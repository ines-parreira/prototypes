import { renderHook, waitFor } from '@testing-library/react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { NotificationStatus } from 'state/notifications/types'

import { useDomainSyncStatus } from './useDomainSyncStatus'

const mockDispatch = jest.fn()

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockDispatch,
}))
jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog')
jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/utils')
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn((payload) => ({ type: 'NOTIFY', payload })),
}))

const mockUseGetStoreDomainIngestionLog = jest.requireMock(
    'pages/aiAgent/hooks/useGetStoreDomainIngestionLog',
).useGetStoreDomainIngestionLog as jest.Mock

const mockDispatchDocumentEvent = jest.requireMock(
    'pages/aiAgent/KnowledgeHub/EmptyState/utils',
).dispatchDocumentEvent as jest.Mock

const mockNotify = jest.requireMock('state/notifications/actions')
    .notify as jest.Mock

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

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

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

    it('dispatches success notification when sync completes successfully', async () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Successful,
        })
        rerender()

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                message: 'Your store website has been synced successfully.',
                status: NotificationStatus.Success,
            })
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('dispatches error notification when sync fails', async () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Failed,
        })
        rerender()

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith({
                message:
                    "We couldn't sync your store website. Please try again or contact support.",
                status: NotificationStatus.Error,
            })
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('does not dispatch event when status changes from null to pending', () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: null,
            storeDomainIngestionLog: undefined,
        })
        rerender()

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        expect(mockNotify).not.toHaveBeenCalled()
    })

    it('does not dispatch event when status remains pending', () => {
        const { rerender } = renderHook(() => useDomainSyncStatus(mockParams))

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            status: IngestionLogStatus.Pending,
        })
        rerender()

        rerender()

        expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        expect(mockNotify).not.toHaveBeenCalled()
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
