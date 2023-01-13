import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {ClickTrackingSettingsView} from '../ClickTrackingSettingsView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore({})

const ReduxProvider = ({children}: {children?: React.ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

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

        const {queryByTestId} = render(<ClickTrackingSettingsView />, {
            wrapper: ReduxProvider,
        })

        expect(queryByTestId('click-tracking-settings')).toBe(null)
    })

    it('should render if the account has the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.RevenueClickTracking]: true,
        }))

        const {queryByTestId} = render(<ClickTrackingSettingsView />, {
            wrapper: ReduxProvider,
        })

        expect(queryByTestId('click-tracking-settings')).not.toBe(null)
    })
})
