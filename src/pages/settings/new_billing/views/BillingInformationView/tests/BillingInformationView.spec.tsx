import {render, screen, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    products,
} from 'fixtures/productPrices'
import * as billingActions from 'state/billing/actions'
import {RootState, StoreDispatch} from 'state/types'

import BillingInformationView from '../BillingInformationView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        invoices: [],
        products,
        contact: {
            email: 'hello@example.com',
            shipping: {
                address: {
                    line1: '123 Main St',
                    line2: 'Apt 1',
                    city: 'New York',
                    state: 'NY',
                    postal_code: '10001',
                    country: 'US',
                },
                phone: '1234567890',
                name: 'John Doe',
            },
        },
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                },
            },
        }),
    }),
})

// Mock action creators
jest.mock('state/billing/actions', () => {
    const actions: Record<string, unknown> = jest.requireActual(
        'state/billing/actions'
    )
    return {
        ...actions,
        fetchContact: () =>
            jest.fn().mockResolvedValue({type: 'FETCH_CONTACT_SUCCESS'}),
        updateContact: () =>
            jest.fn().mockResolvedValue({
                type: 'UPDATE_BILLING_CONTACT_SUCCESS',
            }),
    }
})

describe('BillingInformationView', () => {
    beforeEach(() => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <BillingInformationView />
                </BrowserRouter>
            </Provider>
        )
    })

    it('renders the component', () => {
        // Check if the component renders without errors
        expect(screen.getByText('Billing Information')).toBeInTheDocument()
    })

    it('fetchContact is not called because we already have data in store', () => {
        // Check if the fetchContact action is called
        const fetchContactMock = jest.spyOn(billingActions, 'fetchContact')

        expect(fetchContactMock).toHaveBeenCalledTimes(0)
    })

    it('updates billing contact on form submission', () => {
        const updateContactMock = jest.spyOn(billingActions, 'updateContact')

        // Fill in the form fields
        const emailInput = screen.getByPlaceholderText('your@email.com')
        fireEvent.change(emailInput, {target: {value: 'test@example.com'}})

        // Submit the form
        const submitButton = screen.getByText('Set Address')
        fireEvent.click(submitButton)

        // Check if the updateContact action is called
        expect(updateContactMock).toHaveBeenCalledTimes(1)
        expect(updateContactMock).toHaveBeenCalledWith(expect.any(Object))

        // Check if the success response is handled correctly
        expect(screen.queryByText('Loader')).not.toBeInTheDocument()
    })
})
