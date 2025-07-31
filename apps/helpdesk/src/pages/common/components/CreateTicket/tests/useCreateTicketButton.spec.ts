import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { useHistory } from 'react-router-dom'

import { useCreateTicketButton } from '../useCreateTicketButton'
import useHandleTicketDraft from '../useHandleTicketDraft'

// Mock dependencies
jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}))
jest.mock('../useHandleTicketDraft')

const mockUseHistory = useHistory as jest.Mock
const mockUseHandleTicketDraft = useHandleTicketDraft as jest.Mock

describe('useCreateTicketButton', () => {
    const mockPush = jest.fn()
    const mockOnResumeDraft = jest.fn()
    const mockOnDiscardDraft = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHistory.mockReturnValue({ push: mockPush })
        mockUseHandleTicketDraft.mockReturnValue({
            hasDraft: false,
            onResumeDraft: mockOnResumeDraft,
            onDiscardDraft: mockOnDiscardDraft,
        })
    })

    it('should return initial values correctly', () => {
        const { result } = renderHook(() => useCreateTicketButton())

        expect(result.current.createTicketPath).toBe('/app/ticket/new')
        expect(result.current.hasDraft).toBe(false)
        expect(
            typeof result.current.createTicketActions.CREATE_TICKET.action,
        ).toBe('function')
        expect(result.current.onResumeDraft).toBe(mockOnResumeDraft)
        expect(result.current.onDiscardDraft).toBe(mockOnDiscardDraft)
    })

    it('should navigate to create ticket path when CREATE_TICKET action is called', () => {
        const { result } = renderHook(() => useCreateTicketButton())
        const mockEvent = { preventDefault: jest.fn() } as unknown as Event

        act(() => {
            result.current.createTicketActions.CREATE_TICKET.action(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith('/app/ticket/new')
    })

    it('should return draft status and actions from useHandleTicketDraft', () => {
        mockUseHandleTicketDraft.mockReturnValue({
            hasDraft: true,
            onResumeDraft: mockOnResumeDraft,
            onDiscardDraft: mockOnDiscardDraft,
        })

        const { result } = renderHook(() => useCreateTicketButton())

        expect(result.current.hasDraft).toBe(true)
        expect(result.current.onResumeDraft).toBe(mockOnResumeDraft)
        expect(result.current.onDiscardDraft).toBe(mockOnDiscardDraft)
    })
})
