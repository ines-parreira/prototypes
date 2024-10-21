import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {AddressElement} from '@stripe/react-stripe-js'
import MockAdapter from 'axios-mock-adapter'
import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'
import client from 'models/api/resources'
import {StripeAddressElement} from '../StripeAddressElement'

jest.mock('@stripe/react-stripe-js', () => ({
    AddressElement: jest
        .fn()
        .mockImplementation(() => <div>Address Element</div>),
}))

const mockedServer = new MockAdapter(client)

describe('StripeAddressElement', () => {
    it('should render the Stripe address element with billing information', async () => {
        const billingContactShipping = {
            address: {
                city: 'San Francisco',
                country: 'US',
                line1: '123 Main St',
                line2: 'Apt 1',
                postal_code: '94111',
                state: 'CA',
            },
            name: 'My Company',
            phone: '1234567890',
        }

        mockedServer.onGet('/api/billing/contact/').reply(200, {
            email: 'an.email@goprgias.com',
            shipping: billingContactShipping,
        })

        render(<StripeAddressElement />, {wrapper: mockQueryClientProvider()})

        expect(screen.getByText('Address Element')).toBeInTheDocument()

        await waitFor(() => {
            expect(AddressElement).toHaveBeenCalledWith(
                {
                    options: {
                        mode: 'billing',
                        fields: {phone: 'always'},
                        display: {name: 'organization'},
                        validation: {phone: {required: 'never'}},
                        defaultValues: billingContactShipping,
                    },
                },
                {}
            )
        })
    })
})
