import React from 'react'

import { renderHook } from 'utils/testing/renderHook'

import { useTextOverflow } from '../useTextOverflow'

describe('useTextOverflow', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return ref and initial overflow state as false', () => {
        const { result } = renderHook(() => useTextOverflow<HTMLDivElement>())

        expect(result.current.ref.current).toBeNull()
        expect(result.current.isOverflowing).toBe(false)
    })

    it('should detect overflow when scrollWidth > offsetWidth', () => {
        jest.spyOn(React, 'useRef').mockReturnValue({
            get current() {
                return { offsetWidth: 100, scrollWidth: 200 }
            },
        })

        const { result } = renderHook(() => useTextOverflow<HTMLDivElement>())

        expect(result.current.isOverflowing).toBe(true)
    })

    it('should not detect overflow when scrollWidth <= offsetWidth', () => {
        jest.spyOn(React, 'useRef').mockReturnValue({
            get current() {
                return { offsetWidth: 200, scrollWidth: 100 }
            },
        })

        const { result } = renderHook(() => useTextOverflow<HTMLDivElement>())

        expect(result.current.isOverflowing).toBe(false)
    })
})
