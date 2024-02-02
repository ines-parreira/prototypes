import {render} from '@testing-library/react'
import React, {useContext} from 'react'

import Provider from '../Provider'
import ThemeContext from '../ThemeContext'

describe('Provider', () => {
    it('should provide the theme context and render its children', () => {
        let theme
        const TestComponent = () => {
            theme = useContext(ThemeContext)

            return <p>Test component</p>
        }

        const {getByText} = render(
            <Provider>
                <TestComponent />
            </Provider>
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
