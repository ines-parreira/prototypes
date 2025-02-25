import { renderHook } from '@testing-library/react-hooks'

import Provider from '../ThemeProvider'
import useSetTheme from '../useSetTheme'

jest.unmock('core/theme/useTheme.ts')

describe('useTheme', () => {
    it('should throw an error when used outside of the provider', () => {
        const { result } = renderHook(() => useSetTheme())

        expect(result.error).toEqual(
            new Error(
                '`useSetTheme` may not be used outside of a ThemeProvider',
            ),
        )
    })

    it('should return a function to set the theme', () => {
        const { result } = renderHook(() => useSetTheme(), {
            wrapper: Provider,
        })

        expect(result.current).toEqual(expect.any(Function))
    })
})
