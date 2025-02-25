import { renderHook } from '@testing-library/react-hooks'

import { THEME_NAME } from '@gorgias/design-tokens'

import useLocalStorage from 'hooks/useLocalStorage'
import { assumeMock } from 'utils/testing'

import useActualTheme from '../useActualTheme'

jest.mock('hooks/useLocalStorage', () => jest.fn())
const useLocalStorageMock = assumeMock(useLocalStorage)

describe('useActualTheme', () => {
    it('should return the theme from localstorage', () => {
        const setTheme = jest.fn()
        useLocalStorageMock.mockReturnValue([
            THEME_NAME.Classic,
            setTheme,
            () => {},
        ])
        const { result } = renderHook(() => useActualTheme())

        expect(result.current).toEqual([
            THEME_NAME.Classic,
            expect.any(Function),
        ])
        expect(setTheme).not.toHaveBeenCalled()
    })

    it('should return and set the classic theme if localstorage returns an unknown value', () => {
        const setTheme = jest.fn()
        useLocalStorageMock.mockReturnValue(['modern', setTheme, () => {}])
        const { result } = renderHook(() => useActualTheme())

        expect(result.current).toEqual([
            THEME_NAME.Classic,
            expect.any(Function),
        ])
        expect(setTheme).toHaveBeenCalledWith(THEME_NAME.Classic)
    })
})
