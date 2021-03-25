import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import {initialState} from '../reducers.ts'
import * as actions from '../actions.ts'
import * as constants from '../constants.ts'
import {mockStore} from '../../../utils/testing.ts'

window.location = {
    pathname: '/self-service',
}

describe('self service configurations actions', () => {
    let store, mockServer, mockConfiguration

    beforeEach(() => {
        store = mockStore({self_service_configurations: initialState})
        mockServer = new MockAdapter(axios)
        mockConfiguration = {
            id: 1,
            type: 'shopify',
            shop_name: 'myshop',
            created_datetime: new Date(2021, 1, 1).toISOString(),
            updated_datetime: new Date(2021, 1, 1).toISOString(),
            deactivated_datetime: null,
        }
    })

    it('fetches self service configurations with success', () => {
        mockServer
            .onGet('/api/self_service_configurations/')
            .reply(200, {data: [{id: 1, store_name: 'mystore'}]})

        return store
            .dispatch(actions.fetchSelfServiceConfigurations())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('tries to fetch self service configurations but fails', () => {
        mockServer.onGet('/api/self_service_configurations/').reply(500)

        return store
            .dispatch(actions.fetchSelfServiceConfigurations())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('updates a self service configuration with success', () => {
        mockServer
            .onPut('/api/self_service_configurations/1')
            .reply(200, mockConfiguration)

        return store
            .dispatch(
                actions.updateSelfServiceConfigurations(mockConfiguration)
            )
            .then(() => {
                const dispatchedActions = store
                    .getActions()
                    .map((action) => action.type)

                expect(
                    dispatchedActions.includes(
                        constants.UPDATE_SELF_SERVICE_CONFIGURATION_START
                    )
                ).toBeTruthy()
                expect(
                    dispatchedActions.includes('ADD_NOTIFICATION')
                ).toBeTruthy()
                expect(
                    dispatchedActions.includes(
                        constants.UPDATE_SELF_SERVICE_CONFIGURATION_SUCCESS
                    )
                ).toBeTruthy()
            })
    })

    it('tries to update a self service configuration but fails', () => {
        mockServer.onGet('/api/self_service_configurations/1').reply(500)

        return store
            .dispatch(
                actions.updateSelfServiceConfigurations(mockConfiguration)
            )
            .then(() => {
                const dispatchedActions = store
                    .getActions()
                    .map((action) => action.type)

                expect(
                    dispatchedActions.includes(
                        constants.UPDATE_SELF_SERVICE_CONFIGURATION_START
                    )
                ).toBeTruthy()
                expect(
                    dispatchedActions.includes(
                        constants.UPDATE_SELF_SERVICE_CONFIGURATION_ERROR
                    )
                ).toBeTruthy()
            })
    })
})
