import React from 'react'

import { render, screen } from '@testing-library/react'

import { StripePaymentElement } from '../StripePaymentElement'

jest.mock('@stripe/react-stripe-js', () => ({
    PaymentElement: jest.fn(() => <div>Mocked PaymentElement</div>),
}))

describe('StripePaymentElement Component', () => {
    it('should render the PaymentElement', () => {
        render(<StripePaymentElement />)
        expect(screen.getByText('Mocked PaymentElement')).toBeInTheDocument()
    })
})
