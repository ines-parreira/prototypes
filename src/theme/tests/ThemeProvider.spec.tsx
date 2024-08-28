import {render} from '@testing-library/react'
import React, {useContext} from 'react'

import ThemeProvider from '../ThemeProvider'
import ThemeContext from '../ThemeContext'

describe('ThemeProvider', () => {
    it('should provide the theme context and render its children', () => {
        let theme
        const TestComponent = () => {
            theme = useContext(ThemeContext)

            return <p>Test component</p>
        }

        const {getByText} = render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )

        expect(getByText('Test component')).toBeInTheDocument()
        expect(theme).toEqual({
            savedTheme: 'modern light',
            theme: 'modern light',
            setTheme: expect.any(Function),
            colorTokens: expect.any(Object),
        })
    })
})
