import {GorgiasAction} from '../types'

import * as constants from './constants'
import {SelfServiceConfiguration, SelfServiceState} from './types'

export const initialState: SelfServiceState = {
    self_service_configurations: [],
    loading: false,
}

export default function reducer(
    state: SelfServiceState = initialState,
    action: GorgiasAction
): SelfServiceState {
    switch (action.type) {
        case constants.FETCH_SELF_SERVICE_CONFIGURATIONS_START:
            return {...state, loading: true}
        case constants.FETCH_SELF_SERVICE_CONFIGURATIONS_ERROR:
            return {...state, loading: false}
        case constants.FETCH_SELF_SERVICE_CONFIGURATIONS_SUCCESS: {
            const configurations = (action.resp as {data: unknown[]})
                .data as SelfServiceConfiguration[]

            return {
                ...state,
                self_service_configurations: configurations,
                loading: false,
            }
        }
        case constants.UPDATE_SELF_SERVICE_CONFIGURATION_SUCCESS: {
            const respConfiguration = action.resp as SelfServiceConfiguration

            const oldConfigurationIndex = state.self_service_configurations.findIndex(
                (configuration) => configuration.id === respConfiguration.id
            )

            let newConfigurations: SelfServiceConfiguration[] = []
            if (oldConfigurationIndex === -1) {
                newConfigurations = [
                    ...state.self_service_configurations,
                    respConfiguration,
                ]
            } else {
                newConfigurations = [...state.self_service_configurations]
                newConfigurations[oldConfigurationIndex] = respConfiguration
            }

            return {
                ...state,
                self_service_configurations: newConfigurations,
            }
        }
        default:
            return state
    }
}
