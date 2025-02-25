import React from 'react'

import { render } from '@testing-library/react'

import { THEME_NAME, themeTokenMap } from '@gorgias/design-tokens'

import ThemeProvider from '../ThemeProvider'
import type { SetTheme, Theme } from '../types'
import withTheme from '../withTheme'
import type { WithThemeProps } from '../withTheme'

describe('withTheme', () => {
    it('should pass setTheme and theme into the given component', () => {
        let givenSetTheme: SetTheme | null = null
        let givenTheme: Theme | null = null

        const TestComponent = withTheme(
            ({ setTheme, theme }: WithThemeProps) => {
                givenSetTheme = setTheme
                givenTheme = theme
                return null
            },
        )

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        expect(givenSetTheme).toEqual(expect.any(Function))
        expect(givenTheme).toEqual({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: themeTokenMap[THEME_NAME.Light],
        })
    })
})
