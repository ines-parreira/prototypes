import _noop from 'lodash/noop'

import shortcutManager from 'services/shortcutManager'
import { renderHook } from 'utils/testing/renderHook'

import useConditionalShortcuts from '../useConditionalShortcuts'

jest.mock('services/shortcutManager', () => ({
    bind: jest.fn(),
    unbind: jest.fn(),
}))

describe('useConditionalShortcuts', () => {
    const component = 'MyComponent'
    const actions = {
        MY_SHORTCUT: { action: _noop },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.restoreAllMocks()
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
