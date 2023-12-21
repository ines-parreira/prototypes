import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import LD from 'launchdarkly-react-client-sdk'
import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {products, currentProductsUsage} from 'fixtures/productPrices'
import {FeatureFlagKey} from 'config/featureFlags'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import UsageAndPlansView from '../UsageAndPlansView'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const queryClient = mockQueryClient()

const store = mockedStore({
    billing: fromJS({invoices: [], products, currentProductsUsage}),
})

describe('UsageAndPlansView', () => {
    it('should render', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertBilling]: true,
        }))

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <UsageAndPlansView
                        contactBilling={jest.fn()}
                        periodEnd="2021-01-01"
                        currentUsage={currentProductsUsage}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(container).toMatchSnapshot()
    })
})
