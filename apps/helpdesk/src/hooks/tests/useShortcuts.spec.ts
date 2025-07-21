import _noop from 'lodash/noop'

import { renderHook } from 'utils/testing/renderHook'

import useConditionalShortcuts from '../useConditionalShortcuts'
import useShortcuts from '../useShortcuts'

jest.mock('../useConditionalShortcuts', () => jest.fn())

describe('useShortcuts', () => {
    const component = 'MyComponent'
    const actions = {
        MY_SHORTCUT: { action: _noop },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        jest.restoreAllMocks()
    })

    it('should bind the given actions on mount', () => {
        renderHook(() => useShortcuts(component, actions))
        expect(useConditionalShortcuts).toHaveBeenCalledWith(
            true,
            component,
            actions,
        )
    })
})
