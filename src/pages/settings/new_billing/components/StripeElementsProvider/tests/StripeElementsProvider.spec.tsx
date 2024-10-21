import {render, screen} from '@testing-library/react'
import React from 'react'
import {ThemeContext} from 'theme'
import {StripeElementsProvider} from '../StripeElementsProvider'

jest.mock('@stripe/react-stripe-js', () => ({
    Elements: jest.fn().mockImplementation(({children}) => (
        <div>
            Elements Provider<div>{children}</div>
        </div>
    )),
}))

describe('StripeElementsProvider', () => {
    it('should render the Stripe elements provider with children', () => {
        render(
            <ThemeContext.Provider value={{} as any}>
                <StripeElementsProvider>
                    <div>Stripe Elements</div>
                </StripeElementsProvider>
            </ThemeContext.Provider>
        )

        expect(screen.getByText('Elements Provider')).toBeInTheDocument()
        expect(screen.getByText('Stripe Elements')).toBeInTheDocument()
    })
})
