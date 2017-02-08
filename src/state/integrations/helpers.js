import {fromJS} from 'immutable'
import {INTEGRATION_TYPE_DESCRIPTIONS} from '../../config'
import _find from 'lodash/find'

/**
 * Compute the number of active integrations for each type
 */
const getIntegrationsCountPerType = (integrations = []) => {
    return integrations
        .reduce((accumulator, item) => {
            const newAccumulator = accumulator
            if (item.get('type') in accumulator && !item.get('deactivated_datetime')) {
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
export const getIntegrationsList = (integrations = []) => {
    const counts = getIntegrationsCountPerType(integrations)
    return fromJS(INTEGRATION_TYPE_DESCRIPTIONS.map((typeDescription) => (
        {
            ...typeDescription,
            count: counts[typeDescription.type] || 0
        })
    ))
}

export const getIconUrl = (type) => {
    const config = _find(INTEGRATION_TYPE_DESCRIPTIONS, {type})
    return config && config.image ? config.image : ''
}

export const getIconFromUrl = (url) => {
    return url ? require(`../../../img/${url}`) : ''
}

export const getIconFromType = (type) => {
    return getIconFromUrl(getIconUrl(type))
}

