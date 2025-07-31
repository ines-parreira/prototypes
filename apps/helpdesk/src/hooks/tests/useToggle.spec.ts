import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useToggle } from 'hooks/useToggle'

describe('useToggle', () => {
    it('should initialize with default value of false', () => {
        const { result } = renderHook(() => useToggle())

        expect(result.current.isOpen).toBe(false)
    })

    it('should initialize with custom initial value', () => {
        const { result: resultTrue } = renderHook(() => useToggle(true))
        const { result: resultFalse } = renderHook(() => useToggle(false))

        expect(resultTrue.current.isOpen).toBe(true)
        expect(resultFalse.current.isOpen).toBe(false)
    })

    it('should toggle state when calling toggle without parameters', () => {
        const { result } = renderHook(() => useToggle(false))

        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.toggle()
        })

        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.toggle()
        })

        expect(result.current.isOpen).toBe(false)
    })

    it('should set specific value when calling toggle with boolean parameter', () => {
        const { result } = renderHook(() => useToggle(false))

        act(() => {
            result.current.toggle(true)
        })

        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.toggle(true)
        })

        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.toggle(false)
        })

        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.toggle(false)
        })

        expect(result.current.isOpen).toBe(false)
    })

    it('should set state to true when calling open', () => {
        const { result } = renderHook(() => useToggle(false))

        act(() => {
            result.current.open()
        })

        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.open()
        })

        expect(result.current.isOpen).toBe(true)
    })

    it('should set state to false when calling close', () => {
        const { result } = renderHook(() => useToggle(true))

        act(() => {
            result.current.close()
        })

        expect(result.current.isOpen).toBe(false)

        act(() => {
            result.current.close()
        })

        expect(result.current.isOpen).toBe(false)
    })

    it('should return stable function references across renders', () => {
        const { result, rerender } = renderHook(() => useToggle())

        const firstRender = {
            toggle: result.current.toggle,
            open: result.current.open,
            close: result.current.close,
        }

        rerender()

        const secondRender = {
            toggle: result.current.toggle,
            open: result.current.open,
            close: result.current.close,
        }

        expect(firstRender.toggle).toBe(secondRender.toggle)
        expect(firstRender.open).toBe(secondRender.open)
        expect(firstRender.close).toBe(secondRender.close)
    })

    it('should return object with correct structure', () => {
        const { result } = renderHook(() => useToggle())

        expect(result.current).toEqual({
            isOpen: expect.any(Boolean),
            toggle: expect.any(Function),
            open: expect.any(Function),
            close: expect.any(Function),
        })
    })
})
