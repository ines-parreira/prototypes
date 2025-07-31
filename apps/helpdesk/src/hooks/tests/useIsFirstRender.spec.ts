import { renderHook } from '@repo/testing'

import useIsFirstRender from '../useIsFirstRender'

describe('useIsFirstRender', () => {
    it('should return true on first render and false on all others', () => {
        const hook = renderHook(() => useIsFirstRender())

        expect(hook.result.current).toBe(true)
        hook.rerender()
        expect(hook.result.current).toBe(false)
        hook.rerender()
        expect(hook.result.current).toBe(false)
    })
})
