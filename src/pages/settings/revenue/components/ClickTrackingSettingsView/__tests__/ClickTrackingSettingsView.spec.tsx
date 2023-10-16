import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'
import {MemoryRouter, Route} from 'react-router-dom'
import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import ClickTrackingPaywallView from 'pages/settings/revenue/components/ClickTrackingPaywallView'
import {getStateWithPrice} from 'utils/paywallTesting'
import ClickTrackingSettingsView from '../ClickTrackingSettingsView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore(getStateWithPrice())

const ReduxProvider = ({children}: {children?: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

jest.mock('pages/settings/revenue/hooks/useRevenueAddonApi', () => {
    return {
        useRevenueAddonApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                get_custom_domain: () =>
                    Promise.resolve({
                        data: {},
                        status: 404,
                    }),
            },
        }),
    }
})

describe('<ClickTrackingSettingsView />', () => {
    beforeEach(() => {
        store.clearActions()
    })

    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {getByText, queryByTestId} = render(
            <MemoryRouter>
                <ReduxProvider>
                    <Route path="/app/settings/revenue/click-tracking">
                        <ClickTrackingPaywallView />
                    </Route>
                    <ClickTrackingSettingsView />
                </ReduxProvider>
            </MemoryRouter>
        )

        expect(queryByTestId('click-tracking-settings')).toBe(null)
        expect(getByText('Get Convert')).toBeInTheDocument()
    })

    it('should render if the account has the feature flag', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.RevenueClickTracking]: true,
        }))

        const {queryByTestId} = render(<ClickTrackingSettingsView />, {
            wrapper: ReduxProvider,
        })

        expect(queryByTestId('click-tracking-settings')).not.toBe(null)
    })
})
