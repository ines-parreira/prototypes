import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import useActualTheme from '../useActualTheme'

jest.unmock('core/theme/useActualTheme.ts')

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

describe('useActualTheme', () => {
    let localStorageMock: { [key: string]: string }

    beforeEach(() => {
        localStorageMock = {}
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)

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
        localStorageMock.theme = JSON.stringify(THEME_NAME.Light)

        const { result } = renderHook(() => useActualTheme())

        expect(result.current).toEqual([THEME_NAME.Light, expect.any(Function)])
    })

    it('should return and set the light theme if localstorage returns an unknown value', async () => {
        localStorageMock.theme = JSON.stringify('modern')

        const { result } = renderHook(() => useActualTheme())

        expect(result.current).toEqual([THEME_NAME.Light, expect.any(Function)])

        await waitFor(() => {
            expect(JSON.parse(localStorageMock.theme)).toBe(THEME_NAME.Light)
        })
    })

    describe('when the wayfinding MS1 flag is enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should return the light theme when the stored theme is classic', () => {
            localStorageMock.theme = JSON.stringify(THEME_NAME.Classic)

            const { result } = renderHook(() => useActualTheme())

            expect(result.current).toEqual([
                THEME_NAME.Light,
                expect.any(Function),
            ])
        })

        it('should not overwrite classic in localstorage so the preference is preserved', () => {
            localStorageMock.theme = JSON.stringify(THEME_NAME.Classic)

            renderHook(() => useActualTheme())

            expect(JSON.parse(localStorageMock.theme)).toBe(THEME_NAME.Classic)
        })

        it('should keep non-classic themes unchanged', () => {
            localStorageMock.theme = JSON.stringify(THEME_NAME.Dark)

            const { result } = renderHook(() => useActualTheme())

            expect(result.current).toEqual([
                THEME_NAME.Dark,
                expect.any(Function),
            ])
        })
    })

    describe('when the wayfinding MS1 flag is disabled', () => {
        it('should return the classic theme as-is when stored', () => {
            localStorageMock.theme = JSON.stringify(THEME_NAME.Classic)

            const { result } = renderHook(() => useActualTheme())

            expect(result.current).toEqual([
                THEME_NAME.Classic,
                expect.any(Function),
            ])
        })
    })
})
