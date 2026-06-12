import { renderHook } from '@testing-library/react'
import { noop } from '@gorgias/toolkit'
import { useConditionalShortcuts } from '../useConditionalShortcuts'
import { useShortcuts } from '../useShortcuts'

vi.mock('../useConditionalShortcuts', () => ({
    useConditionalShortcuts: vi.fn(),
}))

describe('useShortcuts', () => {
    const component = 'MyComponent'
    const actions = {
        MY_SHORTCUT: { action: noop },
    }

    beforeEach(() => {
        vi.resetAllMocks()
        vi.restoreAllMocks()
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
