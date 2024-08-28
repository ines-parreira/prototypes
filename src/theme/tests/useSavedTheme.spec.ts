import {renderHook} from '@testing-library/react-hooks'

import Provider from '../ThemeProvider'
import useSavedTheme from '../useSavedTheme'

jest.unmock('theme/useTheme.ts')

describe('useSavedTheme', () => {
    it('should throw an error when used outside of the provider', () => {
        const {result} = renderHook(() => useSavedTheme())

        expect(result.error).toEqual(
            new Error('`useTheme` may not be used outside of a ThemeProvider')
        )
    })

    it('should return the saved theme', () => {
        const {result} = renderHook(() => useSavedTheme(), {wrapper: Provider})

        expect(result.current).toBe('modern light')
    })
})
