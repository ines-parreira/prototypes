import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import useActualTheme from '../useActualTheme'

describe('useActualTheme', () => {
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
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return the theme from localstorage', () => {
        // Set up localStorage to return a valid theme
        localStorageMock.theme = JSON.stringify(THEME_NAME.Light)

        const { result } = renderHook(() => useActualTheme())

        expect(result.current).toEqual([THEME_NAME.Light, expect.any(Function)])
    })

    it('should return and set the light theme if localstorage returns an unknown value', async () => {
        // Set up localStorage to return an unknown theme
        localStorageMock.theme = JSON.stringify('modern')

        const { result } = renderHook(() => useActualTheme())

        expect(result.current).toEqual([THEME_NAME.Light, expect.any(Function)])

        // Wait for the useEffect to run and update localStorage
        await waitFor(() => {
            expect(JSON.parse(localStorageMock.theme)).toBe(THEME_NAME.Light)
        })
    })
})
