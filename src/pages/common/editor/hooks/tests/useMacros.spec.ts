import { act, renderHook } from '@testing-library/react-hooks'

import useMacros from '../useMacros'

describe('useMacros', () => {
    it('should return the default state', () => {
        const { result } = renderHook(() => useMacros({ initialFilters: {} }))

        expect(result.current).toEqual({
            filters: {},
            hasShown: false,
            isActive: false,
            query: '',
            onChangeActive: expect.any(Function),
            onChangeFilters: expect.any(Function),
            onChangeQuery: expect.any(Function),
        })
    })

    it('should set active and shown to true on toggle', () => {
        const { result } = renderHook(() => useMacros({ initialFilters: {} }))

        act(() => {
            result.current.onChangeActive()
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                isActive: true,
                hasShown: true,
            }),
        )
    })

    it('should not change the state if the same value is passed to the toggle function', () => {
        const { result } = renderHook(() => useMacros({ initialFilters: {} }))

        act(() => {
            result.current.onChangeActive(false)
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                isActive: false,
                hasShown: false,
            }),
        )
    })

    it('should not set shown to false if active is changed back to false', () => {
        const { result } = renderHook(() => useMacros({ initialFilters: {} }))

        act(() => {
            result.current.onChangeActive()
        })
        act(() => {
            result.current.onChangeActive()
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                isActive: false,
                hasShown: true,
            }),
        )
    })

    it('should set a new search query when onChangeQuery is called', () => {
        const { result } = renderHook(() => useMacros({ initialFilters: {} }))

        act(() => {
            result.current.onChangeQuery('boop')
        })

        expect(result.current.query).toBe('boop')
    })

    it('should set initial filters when given', () => {
        const { result } = renderHook(() =>
            useMacros({ initialFilters: { languages: ['en'] } }),
        )
        expect(result.current.filters).toEqual({
            languages: ['en'],
        })
    })

    it('should set the correct filters when they are updated', () => {
        const { result } = renderHook(() => useMacros({ initialFilters: {} }))

        act(() => {
            result.current.onChangeFilters({ languages: ['en'] })
        })
        expect(result.current.filters).toEqual({ languages: ['en'] })

        act(() => {
            result.current.onChangeFilters({ tags: ['beep', 'boop'] })
        })
        expect(result.current.filters).toEqual({
            languages: ['en'],
            tags: ['beep', 'boop'],
        })
    })
})
