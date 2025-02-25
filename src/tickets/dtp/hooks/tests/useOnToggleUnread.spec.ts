import { act, renderHook } from '@testing-library/react-hooks'

import { useOnToggleUnread } from '../useOnToggleUnread'

describe('useOnToggleUnread', () => {
    it('should return a function to register a function as well as the registered function', () => {
        const { result } = renderHook(() => useOnToggleUnread())
        expect(result.current).toEqual({
            registerOnToggleUnread: expect.any(Function),
        })

        const fn = jest.fn()
        act(() => {
            result.current.registerOnToggleUnread(fn)
        })
        expect(result.current).toEqual({
            onToggleUnread: fn,
            registerOnToggleUnread: expect.any(Function),
        })
    })
})
