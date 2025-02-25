import { act, renderHook } from '@testing-library/react-hooks'

import useSessionStorage from '../useSessionStorage'

describe('useSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return the initial value and a function to set the value', () => {
        const { result } = renderHook(() =>
            useSessionStorage('testKey', 'initialValue'),
        )

        const [state, setState] = result.current

        expect(state).toBe('initialValue')
        expect(sessionStorage.getItem('testKey')).toBe('"initialValue"')
        expect(typeof setState).toBe('function')
    })

    it('should update the value in sessionStorage when setState is called', () => {
        const { result } = renderHook(() =>
            useSessionStorage('testKey', 'initialValue'),
        )

        act(() => {
            const [, setState] = result.current
            setState('newValue')
        })

        expect(sessionStorage.getItem('testKey')).toBe('"newValue"')
    })

    it('should parse the value correctly from sessionStorage', () => {
        sessionStorage.setItem('testKey', '{"name": "John"}')

        const { result } = renderHook(() => useSessionStorage('testKey', {}))

        expect(result.current[0]).toEqual({ name: 'John' })

        act(() => {
            const [, setState] = result.current
            setState({ name: 'Mary' })
        })

        expect(result.current[0]).toEqual({ name: 'Mary' })
        expect(sessionStorage.getItem('testKey')).toBe('{"name":"Mary"}')
    })

    it('should handle raw values correctly', () => {
        const { result } = renderHook(() =>
            useSessionStorage('testKey', 'initialValue', true),
        )

        act(() => {
            const [, setState] = result.current
            setState('newValue')
        })

        expect(sessionStorage.getItem('testKey')).toBe('newValue')
    })

    it('should handle JSON parsing errors and fallback to initial value', () => {
        jest.spyOn(JSON, 'parse').mockImplementation(() => {
            throw new Error('Mocked parsing error')
        })

        const { result } = renderHook(() =>
            useSessionStorage('testKey', 'initialValue'),
        )

        expect(result.current[0]).toBe('initialValue')
    })

    it('should handle sessionStorage errors when setting values', () => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Mocked storage error')
        })

        const { result } = renderHook(() =>
            useSessionStorage('testKey', 'initialValue'),
        )

        act(() => {
            const [, setState] = result.current
            setState('newValue')
        })

        expect(result.current[0]).toBe('newValue')
    })
})
