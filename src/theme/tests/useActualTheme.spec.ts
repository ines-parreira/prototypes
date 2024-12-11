import {THEME_NAME} from '@gorgias/design-tokens'
import {renderHook} from '@testing-library/react-hooks'

import {usePersistedState} from 'common/hooks'

import useActualTheme from '../useActualTheme'

jest.mock('common/hooks', () => ({usePersistedState: jest.fn()}))
const usePersistedStateMock = usePersistedState as jest.Mock

describe('useActualTheme', () => {
    it('should return the theme from localstorage', () => {
        const setTheme = jest.fn()
        usePersistedStateMock.mockReturnValue([THEME_NAME.Classic, setTheme])
        const {result} = renderHook(() => useActualTheme())

        expect(result.current).toEqual([
            THEME_NAME.Classic,
            expect.any(Function),
        ])
        expect(setTheme).not.toHaveBeenCalled()
    })

    it('should return and set the classic theme if localstorage returns an unknown value', () => {
        const setTheme = jest.fn()
        usePersistedStateMock.mockReturnValue(['modern', setTheme])
        const {result} = renderHook(() => useActualTheme())

        expect(result.current).toEqual([
            THEME_NAME.Classic,
            expect.any(Function),
        ])
        expect(setTheme).toHaveBeenCalledWith(THEME_NAME.Classic)
    })
})
