import {renderHook} from '@testing-library/react-hooks'

import {THEME_TYPES} from 'theme'

import useThemeContext from '../useThemeContext'

describe('useThemeContext', () => {
    it('should return an object with the saved theme, the resulting theme and a setter', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current).toEqual(
            expect.objectContaining({
                savedTheme: THEME_TYPES.Modern,
                theme: THEME_TYPES.Modern,
                setTheme: expect.any(Function),
            })
        )
    })

    it('should return the modern theme by default', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme).toEqual(THEME_TYPES.Modern)
    })

    it('should return the dark theme if using preferred theme media query', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue(
            `"${THEME_TYPES.System}"`
        )
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => {
                return {
                    matches: true,
                }
            }),
            writable: true,
        })

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme).toEqual(THEME_TYPES.Dark)
    })

    it('should return the light theme if using preferred theme media query', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue(
            `"${THEME_TYPES.System}"`
        )
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => {
                return {
                    matches: false,
                }
            }),
            writable: true,
        })

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.savedTheme).toEqual(THEME_TYPES.System)
        expect(result.current.theme).toEqual(THEME_TYPES.Light)
    })

    it('should return the saved theme', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue(
            `"${THEME_TYPES.Light}"`
        )

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.savedTheme).toEqual(THEME_TYPES.Light)
    })

    it('should update state in local storage if current theme is the outdated modern value', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue('"modern"')
        jest.spyOn(localStorage, 'setItem')
        const {result} = renderHook(() => useThemeContext())

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'theme',
            JSON.stringify(THEME_TYPES.Modern)
        )
        expect(result.current.savedTheme).toEqual(THEME_TYPES.Modern)
    })
})
