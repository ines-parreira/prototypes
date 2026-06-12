import { renderHook } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { noop } from '@gorgias/toolkit'
import { useKeyboardNavigation } from '../useKeyboardNavigation'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        bind: jest.fn(),
        unbind: jest.fn(),
    },
}))

describe('useKeyboardNavigation', () => {
    const next = noop
    const previous = noop

    it('should bind to the shortcut manager on mount', () => {
        renderHook(() => useKeyboardNavigation({ next, previous }))
        expect(shortcutManager.bind).toHaveBeenCalledWith(
            'TicketDetailContainer',
            {
                GO_NEXT_MESSAGE: { action: next },
                GO_PREV_MESSAGE: { action: previous },
            },
        )
    })

    it('should unbind from the shortcut manager when unmounted', () => {
        const { unmount } = renderHook(() =>
            useKeyboardNavigation({ next, previous }),
        )
        unmount()
        expect(shortcutManager.unbind).toHaveBeenCalledWith(
            'TicketDetailContainer',
        )
    })
})
