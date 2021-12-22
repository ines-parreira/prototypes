import React from 'react'
import {fireEvent, render} from '@testing-library/react'
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

jest.mock('react-use', () => {
    const module: Record<string, unknown> = jest.requireActual('react-use')

    return {...module, useAsync: () => ({loading: false})}
})

describe('<MissingBillingInformationRow />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const initialState = {
        currentUser: fromJS({
            roles: [{name: UserRole.Admin}],
        }) as Map<any, any>,
        currentAccount: fromJS({
            meta: {hasCreditCard: true},
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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a row when conditions are met', () => {
        const store = mockStore(initialState)
        const {container} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            'the user is not an admin',
            {
                ...initialState,
                currentUser: initialState.currentUser.setIn(
                    ['roles', 0, 'name'],
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
                billing: initialState.billing.set(
                    'paymentMethod',
                    PaymentMethodType.Shopify
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

    it('should open the modal when clicking on update button', () => {
        const store = mockStore(initialState)
        const {getByText} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        fireEvent.click(getByText('Update Now'))
        expect(getByText('Missing information - Billing address')).toBeTruthy()
    })

    it('should submit the billing information when submiting the modal form', () => {
        const store = mockStore(initialState)
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <MissingBillingInformationRow />
            </Provider>
        )

        fireEvent.click(getByText('Update Now'))
        fireEvent.change(getByPlaceholderText('New York'), {
            target: {value: 'Paris'},
        })
        fireEvent.click(getByText('Update Address'))
        expect(billingActions.updateContact).toHaveBeenCalledWith(
            (initialState.billing.get('contact') as Map<any, any>).setIn(
                ['shipping', 'address', 'city'],
                'Paris'
            )
        )
    })
})
