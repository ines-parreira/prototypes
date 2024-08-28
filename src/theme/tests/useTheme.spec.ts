import {renderHook} from '@testing-library/react-hooks'

import Provider from '../ThemeProvider'
import useTheme from '../useTheme'

jest.unmock('theme/useTheme.ts')

describe('useSetTheme', () => {
    it('should throw an error when used outside of the provider', () => {
        const {result} = renderHook(() => useTheme())

        expect(result.error).toEqual(
            new Error('`useTheme` may not be used outside of a ThemeProvider')
        )
    })

    it('should return the active theme', () => {
        const {result} = renderHook(() => useTheme(), {wrapper: Provider})

        expect(result.current).toBe('modern light')
    })
})
