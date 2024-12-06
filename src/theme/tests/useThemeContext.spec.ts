import {renderHook} from '@testing-library/react-hooks'

import {THEME_NAME, themeTokenMap} from '../constants'
import useThemeContext from '../useThemeContext'

describe('useThemeContext', () => {
    it('should return an object with the saved theme, the resulting theme and a setter', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current).toEqual(
            expect.objectContaining({
                theme: {
                    name: THEME_NAME.Classic,
                    resolvedName: THEME_NAME.Classic,
                    tokens: themeTokenMap[THEME_NAME.Classic],
                },
                setTheme: expect.any(Function),
            })
        )
    })

    it('should return the modern theme by default', () => {
        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme).toEqual({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
    })

    it('should return the dark theme if using preferred theme media query', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue(
            `"${THEME_NAME.System}"`
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

        expect(result.current.theme).toEqual({
            name: THEME_NAME.System,
            resolvedName: THEME_NAME.Dark,
            tokens: themeTokenMap[THEME_NAME.Dark],
        })
    })

    it('should return the light theme if using preferred theme media query', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue(
            `"${THEME_NAME.System}"`
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

        expect(result.current.theme.name).toEqual(THEME_NAME.System)
        expect(result.current.theme.resolvedName).toEqual(THEME_NAME.Light)
    })

    it('should return the saved theme', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue(
            `"${THEME_NAME.Light}"`
        )

        const {result} = renderHook(() => useThemeContext())

        expect(result.current.theme.name).toEqual(THEME_NAME.Light)
    })

    it('should update state in local storage if the saved theme is not valid', () => {
        jest.spyOn(localStorage, 'getItem').mockReturnValue('"notvalid"')
        jest.spyOn(localStorage, 'setItem')
        const {result} = renderHook(() => useThemeContext())

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'theme',
            JSON.stringify(THEME_NAME.Classic)
        )
        expect(result.current.theme.name).toEqual(THEME_NAME.Classic)
    })
})
