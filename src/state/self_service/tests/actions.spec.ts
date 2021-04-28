import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import {MockStore} from 'redux-mock-store'

import {AnyAction} from 'redux'

import {initialState} from '../reducers'
import * as actions from '../actions'
import * as constants from '../constants'
import {mockStore} from '../../../utils/testing'
import {SelfServiceConfiguration} from '../types'

window.location = {
    pathname: '/self-service',
} as Location

describe('self service configurations actions', () => {
    let store: MockStore,
        mockServer: MockAdapter,
        mockConfiguration: SelfServiceConfiguration

    beforeEach(() => {
        store = mockStore(({
            self_service_configurations: initialState,
        } as unknown) as MockStore)
        mockServer = new MockAdapter(axios)
        mockConfiguration = {
            id: 1,
            type: 'shopify',
            shop_name: 'myshop',
            created_datetime: new Date(2021, 1, 1).toISOString(),
            updated_datetime: new Date(2021, 1, 1).toISOString(),
            deactivated_datetime: null,
            report_issue_policy: {
                enabled: true,
            },
            track_order_policy: {
                enabled: true,
            },
            return_order_policy: {
                enabled: true,
            },
            cancel_order_policy: {
                enabled: true,
            },
        }
    })

    it('fetches self service configurations with success', () => {
        mockServer
            .onGet('/api/self_service_configurations/')
            .reply(200, {data: [{id: 1, store_name: 'mystore'}]})

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        store
            .dispatch(
                (actions.fetchSelfServiceConfigurations() as unknown) as AnyAction
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('tries to fetch self service configurations but fails', () => {
        mockServer.onGet('/api/self_service_configurations/').reply(500)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        store
            .dispatch(
                (actions.fetchSelfServiceConfigurations() as unknown) as AnyAction
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('updates a self service configuration with success', () => {
        mockServer
            .onPut('/api/self_service_configurations/1')
            .reply(200, mockConfiguration)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        store
            .dispatch(
                (actions.updateSelfServiceConfigurations(
                    mockConfiguration
                ) as unknown) as AnyAction
            )
            .then(() => {
                const dispatchedActions = store
                    .getActions()
                    .map((action: AnyAction) => action.type as string)

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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        store
            .dispatch(
                (actions.updateSelfServiceConfigurations(
                    mockConfiguration
                ) as unknown) as AnyAction
            )
            .then(() => {
                const dispatchedActions = store
                    .getActions()
                    .map((action: AnyAction) => action.type as string)

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
