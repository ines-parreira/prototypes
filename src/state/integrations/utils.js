import {fromJS} from 'immutable'
import {INTEGRATION_TYPE_DESCRIPTIONS} from '../../config'

/**
 * Compute the number of active integrations for each type
 */
function getIntegrationsCountPerType(integrations) {
    return integrations
        .reduce((accumulator, item) => {
            const newAccumulator = accumulator
            if (item.get('type') in accumulator) {
                newAccumulator[item.get('type')] += 1
            } else {
                newAccumulator[item.get('type')] = 1
            }
            return newAccumulator
        }, {})
}

/**
 * We take a global variable with a list of types and their descriptions as objects and we add the number of
 * integrations for each type to these objects.
 * @param integrations
 * @returns {*}
 */
export function getIntegrationsList(integrations) {
    const counts = getIntegrationsCountPerType(integrations)
    return fromJS(INTEGRATION_TYPE_DESCRIPTIONS.map((typeDescription) => (
        {
            ...typeDescription,
            count: counts[typeDescription.type] || 0
        })
    ))
}
