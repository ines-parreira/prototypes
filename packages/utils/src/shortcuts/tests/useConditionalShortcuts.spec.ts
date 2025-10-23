import { renderHook } from '@testing-library/react'
import _noop from 'lodash/noop'

import { shortcutManager } from '../shortcutManager'
import { useConditionalShortcuts } from '../useConditionalShortcuts'

vi.mock('../shortcutManager', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    shortcutManager: {
        bind: vi.fn(),
        unbind: vi.fn(),
    },
}))

describe('useConditionalShortcuts', () => {
    const component = 'MyComponent'
    const actions = {
        MY_SHORTCUT: { action: _noop },
    }

    beforeEach(() => {
        vi.resetAllMocks()
        vi.restoreAllMocks()
    })

    it('should bind the given actions on mount', () => {
        renderHook(() => useConditionalShortcuts(true, component, actions))
        expect(shortcutManager.bind).toHaveBeenCalledWith(component, actions)
    })

    it('should not bind the given actions on mount', () => {
        renderHook(() => useConditionalShortcuts(false, component, actions))
        expect(shortcutManager.bind).not.toHaveBeenCalled()
    })

    it('should unbind the component on unmount', () => {
        const { unmount } = renderHook(() =>
            useConditionalShortcuts(true, component, actions),
        )
        unmount()
        expect(shortcutManager.unbind).toHaveBeenCalledWith(component)
    })
})
