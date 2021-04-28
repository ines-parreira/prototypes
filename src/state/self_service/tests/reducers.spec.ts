import {CombinedState} from 'redux'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import {
    selfServiceState,
    updatedSelfServiceConfiguration1,
    selfServiceConfiguration2,
} from '../../../fixtures/self_service_configurations'
import {getSelfServiceState} from '../selectors'
import {StoreState} from '../../types'
import {SelfServiceState} from '../types'

const state = {
    selfService: initialState,
} as CombinedState<StoreState>

describe('self service configurations reducers', () => {
    it('should handle FETCH_SELF_SERVICE_CONFIGURATION_START', () => {
        const action = {type: types.FETCH_SELF_SERVICE_CONFIGURATION_START}
        const newState = reducer(state.selfService, action)
        const expectedState = {
            ...getSelfServiceState(state),
            loading: true,
        }
        expect(newState).toEqual(expectedState)
    })

    it('should handle FETCH_SELF_SERVICE_CONFIGURATION_ERROR', () => {
        const loadingState = {
            selfService: {
                ...initialState,
                loading: true,
            },
        }
        const action = {type: types.FETCH_SELF_SERVICE_CONFIGURATION_ERROR}
        const newState = reducer(loadingState.selfService, action)
        const expectedState = {
            ...getSelfServiceState(state),
            loading: false,
        }
        expect(newState).toEqual(expectedState)
    })

    it('should handle FETCH_SELF_SERVICE_CONFIGURATION_SUCCESS', () => {
        const currentConfigurations =
            selfServiceState.self_service_configurations
        const loadingState = {
            selfService: {
                ...initialState,
                self_service_configurations: currentConfigurations,
                loading: true,
            },
        }

        const newConfiguration = {
            ...selfServiceState.self_service_configurations[1],
            deactivated_datetime: null,
        }

        const action = {
            type: types.FETCH_SELF_SERVICE_CONFIGURATION_SUCCESS,
            resp: newConfiguration,
        }

        const newState = reducer(loadingState.selfService, action)
        const expectedState = {
            self_service_configurations: [
                currentConfigurations[0],
                newConfiguration,
            ],
            loading: false,
        }
        expect(newState).toEqual(expectedState)
    })

    it('should handle FETCH_SELF_SERVICE_CONFIGURATIONS_START', () => {
        const action = {type: types.FETCH_SELF_SERVICE_CONFIGURATIONS_START}
        const newState = reducer(state.selfService, action)
        const expectedState = {
            ...getSelfServiceState(state),
            loading: true,
        }
        expect(newState).toEqual(expectedState)
    })

    it('should handle FETCH_SELF_SERVICE_CONFIGURATIONS_ERROR', () => {
        const loadingState = {
            selfService: {
                ...initialState,
                loading: true,
            },
        }
        const action = {type: types.FETCH_SELF_SERVICE_CONFIGURATIONS_ERROR}
        const newState = reducer(loadingState.selfService, action)
        const expectedState = {
            ...getSelfServiceState(state),
            loading: false,
        }
        expect(newState).toEqual(expectedState)
    })

    it('should handle FETCH_SELF_SERVICE_CONFIGURATIONS_SUCCESS', () => {
        const loadingState = {
            selfService: {
                ...initialState,
                loading: true,
            },
        }
        const newConfigurations = selfServiceState.self_service_configurations
        const action = {
            type: types.FETCH_SELF_SERVICE_CONFIGURATIONS_SUCCESS,
            resp: {data: newConfigurations},
        }
        const newState = reducer(loadingState.selfService, action)
        const expectedState = {
            self_service_configurations: newConfigurations,
            loading: false,
        }
        expect(newState).toEqual(expectedState)
    })

    it('should handle UPDATE_SELF_SERVICE_CONFIGURATION_SUCCESS', () => {
        const action = {
            type: types.UPDATE_SELF_SERVICE_CONFIGURATION_SUCCESS,
            resp: updatedSelfServiceConfiguration1,
        }
        const newState = reducer(selfServiceState as SelfServiceState, action)
        const expectedUpdatedConfigurations = [
            updatedSelfServiceConfiguration1,
            selfServiceConfiguration2,
        ]
        const expectedState = {
            ...selfServiceState,
            self_service_configurations: expectedUpdatedConfigurations,
        }
        expect(newState).toEqual(expectedState)
    })
})
