import { renderHook } from '@testing-library/react-hooks'

import { THEME_NAME, themeTokenMap } from '@gorgias/design-tokens'
import type { ThemeName } from '@gorgias/design-tokens'

import useActualTheme from '../useActualTheme'
import useThemeContext from '../useThemeContext'

jest.mock('../useActualTheme', () => jest.fn())
const useActualThemeMock = useActualTheme as jest.Mock

describe('useThemeContext', () => {
    let matchMediaMock: jest.SpyInstance

    beforeEach(() => {
        matchMediaMock = jest.spyOn(window, 'matchMedia')
        matchMediaMock.mockReturnValue({ matches: false })
    })

    it.each([[THEME_NAME.Classic], [THEME_NAME.Dark], [THEME_NAME.Light]])(
        'should return the full context for the %s theme',
        (themeName: ThemeName) => {
            useActualThemeMock.mockReturnValue([themeName, jest.fn()])

            const { result } = renderHook(() => useThemeContext())

            expect(result.current).toEqual({
                setTheme: expect.any(Function),
                theme: {
                    name: themeName,
                    resolvedName: themeName,
                    tokens: themeTokenMap[themeName],
                },
            })
        },
    )

    it.each([
        ['light', false, THEME_NAME.Light],
        ['dark', true, THEME_NAME.Dark],
    ])(
        'should return the full context for the system theme if the user prefers a %s colorscheme',
        (_, prefersDarkTheme, themeName) => {
            useActualThemeMock.mockReturnValue(['system', jest.fn()])
            matchMediaMock.mockReturnValue({ matches: prefersDarkTheme })

            const { result } = renderHook(() => useThemeContext())

            expect(result.current).toEqual({
                setTheme: expect.any(Function),
                theme: {
                    name: 'system',
                    resolvedName: themeName,
                    tokens: themeTokenMap[themeName],
                },
            })
        },
    )
})
