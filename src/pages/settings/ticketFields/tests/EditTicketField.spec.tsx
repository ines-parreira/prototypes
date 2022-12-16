import React from 'react'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {customField} from 'fixtures/customField'
import client from 'models/api/resources'
import {renderWithRouter} from 'utils/testing'

import EditTicketField from '../EditTicketField'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)

describe('<EditTicketField/>', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {container} = renderWithRouter(
            <Provider store={mockStore}>
                <EditTicketField />
            </Provider>,
            {
                path: '/custom-fields/:id',
                route: '/custom-fields/123',
            }
        )
        expect(container.firstChild).toBeNull()
    })

    it('should render if the account has the feature flag', async () => {
        mockedServer.onGet('/api/custom-fields/123').reply(200, customField)
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketFields]: true,
        }))

        const {container, findByText} = renderWithRouter(
            <Provider store={mockStore}>
                <EditTicketField />
            </Provider>,
            {
                path: '/custom-fields/:id',
                route: '/custom-fields/123',
            }
        )
        expect(container.firstChild).toMatchSnapshot()

        await findByText(customField.label)
        expect(container.firstChild).toMatchSnapshot()
    })
})
