import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import useExpandedMessages from '../useExpandedMessages'

describe('useExpandedMessages', () => {
    it('should return an empty array of messages initially', () => {
        const { result } = renderHook(() => useExpandedMessages())
        expect(result.current).toEqual([[], expect.any(Function)])
    })

    it('should toggle messages on', () => {
        const { result } = renderHook(() => useExpandedMessages())
        act(() => {
            result.current[1](1)
        })
        expect(result.current).toEqual([[1], expect.any(Function)])
    })

    it('should toggle messages off', () => {
        const { result } = renderHook(() => useExpandedMessages())
        act(() => {
            result.current[1](1)
        })
        act(() => {
            result.current[1](2)
        })
        expect(result.current).toEqual([[1, 2], expect.any(Function)])

        act(() => {
            result.current[1](1)
        })
        expect(result.current).toEqual([[2], expect.any(Function)])
    })
})
