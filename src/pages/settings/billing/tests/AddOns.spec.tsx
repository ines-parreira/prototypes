import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
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

    it('should render the add ons for pay-as-you-go subscribers as if they were non subscribers', () => {
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
                                [VOICE_PRODUCT_ID]: voicePrice0.price_id,
                                [SMS_PRODUCT_ID]: smsPrice0.price_id,
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
})
