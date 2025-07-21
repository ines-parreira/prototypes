import React, { useContext } from 'react'

import { render } from '@testing-library/react'

import { THEME_NAME } from '@gorgias/design-tokens'
import { ThemeContext as UIKitThemeContext } from '@gorgias/merchant-ui-kit'

import AppThemeContext from '../ThemeContext'
import ThemeProvider from '../ThemeProvider'

describe('ThemeProvider', () => {
    it('should provide the theme context and render its children', () => {
        let UIKitTheme
        let AppTheme
        const TestComponent = () => {
            UIKitTheme = useContext(UIKitThemeContext)
            AppTheme = useContext(AppThemeContext)
            return <p>Test component</p>
        }

        const { getByText } = render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        expect(getByText('Test component')).toBeInTheDocument()
        expect(UIKitTheme).toEqual({
            name: THEME_NAME.Light,
            tokens: expect.any(Object),
        })
        expect(AppTheme).toEqual({
            setTheme: expect.any(Function),
            theme: {
                name: THEME_NAME.Light,
                resolvedName: THEME_NAME.Light,
                tokens: expect.any(Object),
            },
        })
    })
})
