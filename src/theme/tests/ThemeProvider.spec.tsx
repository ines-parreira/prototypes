import {ThemeContext as UIKitThemeContext} from '@gorgias/merchant-ui-kit'
import {render} from '@testing-library/react'
import React, {useContext} from 'react'

import {THEME_TYPES} from '../constants'
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

        const {getByText} = render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )

        expect(getByText('Test component')).toBeInTheDocument()
        expect(UIKitTheme).toEqual({
            theme: THEME_TYPES.Modern,
            colorTokens: expect.any(Object),
        })
        expect(AppTheme).toEqual({
            savedTheme: THEME_TYPES.Modern,
            theme: THEME_TYPES.Modern,
            setTheme: expect.any(Function),
            colorTokens: expect.any(Object),
        })
    })
})
