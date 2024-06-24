import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'

import {CART_ABANDONMENT} from 'pages/convert/campaigns/templates/onboarding/cartAbandonment'

import ConvertSimplifiedEditorModal from '../ConvertSimplifiedEditorModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{language: 'en-US', primary: true}],
        shop_type: 'shopify',
    },
})

describe('<ConvertSimplifiedEditorModal />', () => {
    it('renders', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ConvertSimplifiedEditorModal
                    isOpen={true}
                    integration={integration}
                    template={CART_ABANDONMENT}
                    estimatedRevenue={'estimated revenue'}
                    onClose={jest.fn()}
                />
            </Provider>
        )

        expect(getByText('Prevent Cart Abandonment')).toBeTruthy()
    })
})
