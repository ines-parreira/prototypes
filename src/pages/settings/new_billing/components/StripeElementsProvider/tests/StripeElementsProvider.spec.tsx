import React from 'react'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { fireEvent, render, screen } from '@testing-library/react'

import { THEME_NAME, themeTokenMap, useTheme } from 'core/theme'
import { assumeMock } from 'utils/testing'

import { StripeElementsProvider } from '../StripeElementsProvider'

jest.mock('@stripe/stripe-js')
jest.mock('@stripe/react-stripe-js')

assumeMock(Elements).mockImplementation(({ children }) => (
    <div>
        Elements Provider<div>{children}</div>
    </div>
))

jest.mock('core/theme/useTheme.ts', () => jest.fn())
const useThemeMock = assumeMock(useTheme)

describe('StripeElementsProvider', () => {
    beforeEach(() => {
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
    })

    it('should render the Stripe elements provider with children', async () => {
        assumeMock(loadStripe).mockResolvedValue({} as Stripe)
        window.STRIPE_PUBLIC_KEY = 'pk_test_123'

        render(
            <StripeElementsProvider>
                <div>Stripe Elements</div>
            </StripeElementsProvider>,
        )

        expect(screen.getByText('Elements Provider')).toBeVisible()
        expect(screen.getByRole('status')).toBeVisible()
        expect(await screen.findByText('Stripe Elements')).toBeVisible()
    })

    it('should render an error message when Stripe fails to load, and allow for a user initiated retry', async () => {
        assumeMock(loadStripe).mockRejectedValue(new Error('Failed to load'))
        window.STRIPE_PUBLIC_KEY = 'pk_test_123'

        render(
            <StripeElementsProvider>
                <div>Stripe Elements</div>
            </StripeElementsProvider>,
        )

        expect(screen.getByText('Elements Provider')).toBeVisible()
        expect(screen.getByRole('status')).toBeVisible()
        expect(await screen.findByText('Failed to load form')).toBeVisible()

        assumeMock(loadStripe).mockResolvedValue({} as Stripe)

        fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
        expect(await screen.findByText('Stripe Elements')).toBeVisible()
    })
})
