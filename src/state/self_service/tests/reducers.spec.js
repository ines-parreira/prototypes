import reducer, {initialState} from '../reducers.ts'
import * as types from '../constants.ts'
import {
    selfServiceState,
    updatedSelfServiceConfiguration1,
    selfServiceConfiguration2,
} from '../../../fixtures/self_service_configurations.ts'
import {getSelfServiceState} from '../selectors.ts'

const state = {
    selfService: initialState,
}

describe('self service configurations reducers', () => {
    it('should handle FETCH_SELF_SERVICE_CONFIGURATIONS_START', () => {
        const action = {type: types.FETCH_SELF_SERVICE_CONFIGURATIONS_START}
        const newState = reducer(state.selfServiceConfiguration, action)
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
        const newState = reducer(selfServiceState, action)
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
