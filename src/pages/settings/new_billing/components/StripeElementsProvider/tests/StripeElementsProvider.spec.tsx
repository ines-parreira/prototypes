import {render, screen} from '@testing-library/react'
import React from 'react'

import {THEME_NAME, themeTokenMap, useTheme} from 'theme'
import {assumeMock} from 'utils/testing'

import {StripeElementsProvider} from '../StripeElementsProvider'

jest.mock('@stripe/react-stripe-js', () => ({
    Elements: jest.fn().mockImplementation(({children}) => (
        <div>
            Elements Provider<div>{children}</div>
        </div>
    )),
}))

jest.mock('theme/useTheme.ts', () => jest.fn())
const useThemeMock = assumeMock(useTheme)

describe('StripeElementsProvider', () => {
    beforeEach(() => {
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
    })

    it('should render the Stripe elements provider with children', () => {
        render(
            <StripeElementsProvider>
                <div>Stripe Elements</div>
            </StripeElementsProvider>
        )

        expect(screen.getByText('Elements Provider')).toBeInTheDocument()
        expect(screen.getByText('Stripe Elements')).toBeInTheDocument()
    })
})
