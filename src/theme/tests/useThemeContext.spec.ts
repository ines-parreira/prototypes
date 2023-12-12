import {renderHook} from '@testing-library/react-hooks'

import useThemeContext from '../useThemeContext'

describe('useThemeContext', () => {
    it('should return an object with the saved theme, the resulting theme and a setter', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current).toEqual(
            expect.objectContaining({
                savedTheme: 'modern',
                theme: 'modern',
                setTheme: expect.any(Function),
            })
        )
    })

    it('should return the modern theme by default', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme).toEqual('modern')
    })

    it('should return the dark theme if using preferred theme media query', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue('"system"')
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => {
                return {
                    matches: true,
                }
            }),
            writable: true,
        })

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme).toEqual('dark')
    })

    it('should return the light theme if using preferred theme media query', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue('"system"')
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => {
                return {
                    matches: false,
                }
            }),
            writable: true,
        })

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme).toEqual('light')
    })

    it('should return the saved theme', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue('"light"')

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.savedTheme).toEqual('light')
    })
})
