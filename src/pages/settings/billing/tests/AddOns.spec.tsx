import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {account} from 'fixtures/account'
import {
    smsPrice0,
    SMS_PRODUCT_ID,
    voicePrice0,
    VOICE_PRODUCT_ID,
} from 'fixtures/productPrices'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'

import AddOns from '../AddOns'

describe('<AddOns />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
    }
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    beforeEach(() => {
        store = mockStore(defaultState)
    })

    afterEach(() => {
        jest.clearAllMocks()
        ;(global.Date.now as unknown as jest.SpyInstance).mockRestore()
    })

    it('should render the add ons for pay-as-you-go subscribers as if they were non subscribers', () => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1672617660000)

        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            ...account.current_subscription,
                            products: {
                                ...account.current_subscription.products,
                                [VOICE_PRODUCT_ID]: voicePrice0,
                                [SMS_PRODUCT_ID]: smsPrice0,
                            },
                        },
                    }),
                })}
            >
                <AddOns />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the add ons before January 2nd', () => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1672235092000)

        const {container} = render(
            <Provider store={store}>
                <AddOns />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the add ons after January 2nd', () => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1672617660000)

        const {container} = render(
            <Provider store={store}>
                <AddOns />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
