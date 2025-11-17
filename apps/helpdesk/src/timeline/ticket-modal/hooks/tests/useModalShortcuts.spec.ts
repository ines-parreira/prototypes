import { renderHook } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { act } from '@testing-library/react'

import { useModalShortcuts } from '../useModalShortcuts'
import type { useTicketModal } from '../useTicketModal'

jest.mock('@repo/utils', () => ({
    shortcutManager: {
        bind: jest.fn(),
        unbind: jest.fn(),
    },
}))

const mockShortcutManager = shortcutManager as jest.Mocked<
    typeof shortcutManager
>

describe('useModalShortcuts', () => {
    const mockOnNext = jest.fn()
    const mockOnPrevious = jest.fn()
    const mockOnClose = jest.fn()
    const mockOnOpen = jest.fn()

    const baseProps = {
        ticketId: null,
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
        onClose: mockOnClose,
        onOpen: mockOnOpen,
    } as ReturnType<typeof useTicketModal>

    it('should do nothing when ticketId is null', () => {
        renderHook(() => useModalShortcuts(baseProps))

        expect(mockShortcutManager.unbind).not.toHaveBeenCalled()
        expect(mockShortcutManager.bind).not.toHaveBeenCalled()
    })

    it('should bind TimelineModal with actions when ticketId has a value', () => {
        const props = { ...baseProps, ticketId: 123 }

        renderHook(() => useModalShortcuts(props))

        expect(mockShortcutManager.unbind).toHaveBeenCalledWith(
            'TicketDetailContainer',
        )
        expect(mockShortcutManager.bind).toHaveBeenCalledWith('TimelineModal', {
            GO_NEXT: { action: mockOnNext },
            GO_PREVIOUS: { action: mockOnPrevious },
        })
    })

    it('should re-bind shortcuts when dependencies change', () => {
        const { rerender } = renderHook((props) => useModalShortcuts(props), {
            initialProps: baseProps,
        })

        jest.clearAllMocks()

        const updatedProps = { ...baseProps, ticketId: 456 }

        act(() => {
            rerender(updatedProps)
        })

        expect(mockShortcutManager.unbind).toHaveBeenCalledWith(
            'TicketDetailContainer',
        )
        expect(mockShortcutManager.bind).toHaveBeenCalledWith('TimelineModal', {
            GO_NEXT: { action: mockOnNext },
            GO_PREVIOUS: { action: mockOnPrevious },
        })
    })

    it('should cleanup shortcuts on unmount when ticketId is present', () => {
        const props = { ...baseProps, ticketId: 123 }

        const { unmount } = renderHook(() => useModalShortcuts(props))

        jest.clearAllMocks()

        act(() => {
            unmount()
        })

        expect(mockShortcutManager.unbind).toHaveBeenCalledWith('TimelineModal')
        expect(mockShortcutManager.bind).toHaveBeenCalledWith(
            'TicketDetailContainer',
        )
    })
})
