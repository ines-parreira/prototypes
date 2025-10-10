import { renderHook } from '@repo/testing/vitest'
import noop from 'lodash/noop'

import { useDebouncedEffect } from '../useDebouncedEffect'

vi.useFakeTimers()

// Note: more detailed tests we have in useDebouncedCallback which is being used under the hood
describe('useDebouncedEffect', () => {
    it('should render', () => {
        expect(() =>
            renderHook(() => {
                useDebouncedEffect(noop, [], 200)
            }),
        ).not.toThrow()
    })

    it('should call effect only after delay', () => {
        const spy = vi.fn()

        renderHook(() => {
            useDebouncedEffect(spy, [], 200)
        })
        expect(spy).not.toHaveBeenCalled()

        vi.advanceTimersByTime(199)
        expect(spy).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1)
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
