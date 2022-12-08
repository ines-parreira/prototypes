import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

import AddTicketField from '../AddTicketField'

const mockStore = configureMockStore([thunk])()

describe('<AddTicketField/>', () => {
    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {container} = render(
            <Provider store={mockStore}>
                <AddTicketField />
            </Provider>
        )
        expect(container.firstChild).toBeNull()
    })

    it('should render if the account has the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketFields]: true,
        }))

        const {container} = render(
            <Provider store={mockStore}>
                <AddTicketField />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
