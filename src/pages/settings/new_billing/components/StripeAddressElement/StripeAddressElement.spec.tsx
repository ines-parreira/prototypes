import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {render, screen} from '@testing-library/react'
import {AddressElement} from '@stripe/react-stripe-js'
import createMockStore from 'redux-mock-store'
import {InitialRootState} from 'types'
import {StripeAddressElement} from './StripeAddressElement'

jest.mock('@stripe/react-stripe-js', () => ({
    AddressElement: jest
        .fn()
        .mockImplementation(() => <div>Address Element</div>),
}))

describe('StripeAddressElement', () => {
    it('should render the Stripe address element with billing information', () => {
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

        const initialStoreState: Partial<InitialRootState> = {
            billing: fromJS({
                contact: {
                    email: '',
                    shipping: fromJS(billingContactShipping),
                },
            }),
        }

        const store = createMockStore()(initialStoreState)

        render(
            <Provider store={store}>
                <StripeAddressElement />
            </Provider>
        )

        expect(screen.getByText('Address Element')).toBeInTheDocument()

        expect(AddressElement).toHaveBeenCalledWith(
            {
                options: {
                    mode: 'billing',
                    fields: {phone: 'always'},
                    display: {name: 'organization'},
                    validation: {phone: {required: 'always'}},
                    defaultValues: billingContactShipping,
                },
            },
            {}
        )
    })
})
