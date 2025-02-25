import { renderHook } from '@testing-library/react-hooks'
import _noop from 'lodash/noop'

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
