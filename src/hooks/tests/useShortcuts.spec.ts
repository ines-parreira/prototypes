import {renderHook} from '@testing-library/react-hooks'
import _noop from 'lodash/noop'

import shortcutManager from 'services/shortcutManager'

import useShortcuts from '../useShortcuts'

jest.mock('services/shortcutManager', () => ({
    bind: jest.fn(),
    unbind: jest.fn(),
}))

describe('useShortcuts', () => {
    const component = 'MyComponent'
    const actions = {
        MY_SHORTCUT: {action: _noop},
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.restoreAllMocks()
    })

    it('should bind the given actions on mount', () => {
        renderHook(() => useShortcuts(component, actions))
        expect(shortcutManager.bind).toHaveBeenCalledWith(component, actions)
    })

    it('should unbind the component on unmount', () => {
        const {unmount} = renderHook(() => useShortcuts(component, actions))
        unmount()
        expect(shortcutManager.unbind).toHaveBeenCalledWith(component)
    })
})
