import {THEME_NAME, themeTokenMap} from '@gorgias/design-tokens'
import {renderHook} from '@testing-library/react-hooks'

import Provider from '../ThemeProvider'
import useTheme from '../useTheme'

jest.unmock('theme/useTheme.ts')

describe('useTheme', () => {
    it('should throw an error when used outside of the provider', () => {
        const {result} = renderHook(() => useTheme())

        expect(result.error).toEqual(
            new Error('`useTheme` may not be used outside of a ThemeProvider')
        )
    })

    it('should return the active theme', () => {
        const {result} = renderHook(() => useTheme(), {wrapper: Provider})

        expect(result.current).toEqual({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
    })
})
