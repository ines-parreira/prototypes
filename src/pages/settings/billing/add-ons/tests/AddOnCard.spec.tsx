import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {smsProduct, voicePrice0} from 'fixtures/productPrices'
import {ProductType} from 'models/billing/types'
import {RootState, StoreDispatch} from 'state/types'

import AddOnCard from '../AddOnCard'

describe('<AddOnCard />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
        }),
        billing: fromJS(billingState),
    }
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    const minProps = {
        pricingDetailsLink: '',
        nonSubscriberDescription:
            'You are not a subscriber yet, what are you waiting for?',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore(defaultState)
    })

    it('should render the add-on card for non-subscriber', () => {
        const {container} = render(
            <Provider store={store}>
                <AddOnCard
                    {...minProps}
                    name={ProductType.Voice}
                    headerPriceAmount={10}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the add-on card for a subscriber', () => {
        const {container} = render(
            <Provider store={store}>
                <AddOnCard
                    {...minProps}
                    name={ProductType.SMS}
                    addOnPrice={smsProduct.prices[1]}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the add-on card for a trialing add-on price', () => {
        const {container} = render(
            <Provider store={store}>
                <AddOnCard
                    {...minProps}
                    name={ProductType.Voice}
                    headerPriceAmount={10}
                    addOnPrice={voicePrice0}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
