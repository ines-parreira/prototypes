import {renderHook} from '@testing-library/react-hooks'

import Provider from '../Provider'
import useTheme from '../useTheme'

describe('useSavedTheme', () => {
    it('should throw an error when used outside of the provider', () => {
        const {result} = renderHook(() => useTheme())

        expect(result.error).toEqual(
            new Error('`useTheme` may not be used outside of a ThemeProvider')
        )
    })

    it('should return the saved theme', () => {
        const {result} = renderHook(() => useTheme(), {wrapper: Provider})

        expect(result.current).toBe('modern')
    })
})
