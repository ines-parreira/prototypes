import {PlaygroundExecutions} from '../types'
import {apiClient} from './configuration'

/**
 * Endpoints "/accounts/<gorgiasDomain>/stores/<storeName>/playground/executions-count"
 */
export const getPlaygroundExecutions = async (
    accountDomain: string,
    storeName: string
) => {
    return await apiClient.get<PlaygroundExecutions>(
        `/config/accounts/${accountDomain}/stores/${storeName}/playground/executions-count`
    )
}
