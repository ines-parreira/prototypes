import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {products, currentProductsUsage} from 'fixtures/productPrices'
import {FeatureFlagKey} from 'config/featureFlags'
import UsageAndPlansView from '../UsageAndPlansView'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({invoices: [], products, currentProductsUsage}),
})

describe('UsageAndPlansView', () => {
    it('should render', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertBilling]: true,
        }))

        const {container} = render(
            <Provider store={store}>
                <UsageAndPlansView
                    contactBilling={jest.fn()}
                    periodEnd="2021-01-01"
                    currentUsage={currentProductsUsage}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
