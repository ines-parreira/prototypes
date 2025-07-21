import { THEME_NAME, themeTokenMap } from '@gorgias/design-tokens'
import type { ThemeName } from '@gorgias/design-tokens'

import { renderHook } from 'utils/testing/renderHook'

import useThemeContext from '../useThemeContext'

describe('useThemeContext', () => {
    let matchMediaMock: jest.SpyInstance
    let localStorageMock: { [key: string]: string }

    beforeEach(() => {
        localStorageMock = {}

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(
                    (key: string) => localStorageMock[key] || null,
                ),
                setItem: jest.fn((key: string, value: string) => {
                    localStorageMock[key] = value
                }),
                removeItem: jest.fn((key: string) => {
                    delete localStorageMock[key]
                }),
                clear: jest.fn(() => {
                    localStorageMock = {}
                }),
            },
            writable: true,
        })

        matchMediaMock = jest.spyOn(window, 'matchMedia')
        matchMediaMock.mockReturnValue({ matches: false })
    })

    afterEach(() => {
        matchMediaMock.mockRestore()
        jest.clearAllMocks()
    })

    it.each([[THEME_NAME.Classic], [THEME_NAME.Dark], [THEME_NAME.Light]])(
        'should return the full context for the %s theme',
        (themeName: ThemeName) => {
            // Set up localStorage to return the desired theme
            localStorageMock.theme = JSON.stringify(themeName)

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
            // Set up localStorage to return 'system' theme
            localStorageMock.theme = JSON.stringify('system')
            // Set up matchMedia to return the preferred color scheme
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
