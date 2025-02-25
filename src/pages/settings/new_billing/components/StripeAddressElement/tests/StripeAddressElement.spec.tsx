import React from 'react'

import { AddressElement } from '@stripe/react-stripe-js'
import { render, screen, waitFor } from '@testing-library/react'

import { StripeAddressElement } from '../StripeAddressElement'

jest.mock('@stripe/react-stripe-js', () => ({
    AddressElement: jest
        .fn()
        .mockImplementation(() => <div>Address Element</div>),
}))

describe('StripeAddressElement', () => {
    it('should render the Stripe address element with expected props', async () => {
        render(<StripeAddressElement />)

        expect(screen.getByText('Address Element')).toBeInTheDocument()

        await waitFor(() => {
            expect(AddressElement).toHaveBeenCalledWith(
                {
                    options: {
                        mode: 'billing',
                        fields: { phone: 'always' },
                        display: { name: 'organization' },
                        validation: { phone: { required: 'never' } },
                    },
                },
                {},
            )
        })
    })
})
