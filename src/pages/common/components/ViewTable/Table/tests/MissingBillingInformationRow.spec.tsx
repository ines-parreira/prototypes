import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'

import * as billingActions from '../../../../../../state/billing/actions'
import {UserRole} from '../../../../../../config/types/user'
import {PaymentMethodType} from '../../../../../../state/billing/types'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import MissingBillingInformationRow from '../MissingBillingInformationRow'

jest.spyOn(billingActions, 'updateContact')

describe('<MissingBillingInformationRow />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const initialState = {
        currentUser: fromJS({
            role: {name: UserRole.Admin},
        }) as Map<any, any>,
        currentAccount: fromJS({
            meta: {hasCreditCard: true, should_pay_with_shopify: false},
        }) as Map<any, any>,
        billing: fromJS({
            paymentMethod: PaymentMethodType.Stripe,
            contact: {
                email: 'foo@bar.baz',
                shipping: {
                    address: {
                        country: 'US',
                        postal_code: 12345,
                        state: '',
                    },
                },
            },
        }) as Map<any, any>,
    }

    it('should render a row when conditions are met', async () => {
        const store = mockStore(initialState)
        const {container, getByText} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        await waitFor(() => getByText('Update Now'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            'the user is not an admin',
            {
                ...initialState,
                currentUser: initialState.currentUser.setIn(
                    ['role', 'name'],
                    UserRole.Agent
                ),
            },
        ],
        [
            'the account has no credit card',
            {
                ...initialState,
                currentAccount: initialState.currentAccount.setIn(
                    ['meta', 'hasCreditCard'],
                    false
                ),
            },
        ],
        [
            'the payment method is shopify',
            {
                ...initialState,
                currentAccount: initialState.currentAccount.setIn(
                    ['meta', 'should_pay_with_shopify'],
                    true
                ),
            },
        ],
        [
            'the billing information is valid',
            {
                ...initialState,
                billing: initialState.billing.setIn(
                    ['contact', 'shipping', 'address', 'state'],
                    'NY'
                ),
            },
        ],
    ])('should not render a row when %s', (testName, state) => {
        const store = mockStore(state)
        const {container} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        expect(container.firstChild).toBe(null)
    })

    it('should open the modal when clicking on update button', async () => {
        const store = mockStore(initialState)
        const {getByText} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        fireEvent.click(await waitFor(() => getByText('Update Now')))
        expect(getByText('Missing information - Billing address')).toBeTruthy()
    })

    it('should submit the billing information when submiting the modal form', async () => {
        const store = mockStore(initialState)
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        fireEvent.click(await waitFor(() => getByText('Update Now')))
        fireEvent.change(getByPlaceholderText('New York'), {
            target: {value: 'Paris'},
        })
        fireEvent.submit(getByText('Update Address'))
        expect(billingActions.updateContact).toHaveBeenCalledWith(
            (initialState.billing.get('contact') as Map<any, any>).setIn(
                ['shipping', 'address', 'city'],
                'Paris'
            )
        )
    })
})
