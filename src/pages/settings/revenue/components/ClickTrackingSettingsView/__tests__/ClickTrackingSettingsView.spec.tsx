import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {renderWithRouter} from 'utils/testing'
import {ClickTrackingSettingsView} from '../ClickTrackingSettingsView'
import {CLICK_TRACKING_BASE_PATH} from '../../../constants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({})

jest.mock('pages/settings/revenue/hooks/useClickTrackingApi', () => {
    return {
        useClickTrackingApi: jest.fn().mockReturnValue({
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {queryByTestId} = renderWithRouter(
            <Provider store={store}>
                <ClickTrackingSettingsView />
            </Provider>,
            {
                route: `${CLICK_TRACKING_BASE_PATH + '/manage'}`,
            }
        )

        expect(queryByTestId('click-tracking-settings')).toBe(null)
    })

    it('should render if the account has the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.RevenueClickTracking]: true,
        }))

        const {queryByTestId} = renderWithRouter(
            <Provider store={store}>
                <ClickTrackingSettingsView />
            </Provider>,
            {
                route: `${CLICK_TRACKING_BASE_PATH + '/manage'}`,
            }
        )

        expect(queryByTestId('click-tracking-settings')).not.toBe(null)
    })

    it('should render about page if the account has the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.RevenueClickTracking]: true,
        }))

        const {queryByText} = renderWithRouter(
            <Provider store={store}>
                <ClickTrackingSettingsView />
            </Provider>,
            {
                route: `${CLICK_TRACKING_BASE_PATH}`,
            }
        )

        expect(queryByText('Track clicks back to your store.')).not.toBe(null)
    })
})
