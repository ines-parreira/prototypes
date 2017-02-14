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

            if (!item.get('deactivated_datetime')) {
                if (item.get('type') in accumulator) {
                    newAccumulator[item.get('type')] += 1
                } else {
                    newAccumulator[item.get('type')] = 1
                }
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
    return fromJS(INTEGRATION_TYPE_DESCRIPTIONS.map((typeDescription) => {
        let count = 0

        if (typeDescription.subTypes) {
            // make sum of all count of sub types
            typeDescription.subTypes.forEach(type => {
                if (counts[type]) {
                    count += counts[type]
                }
            })
        } else {
            count += counts[typeDescription.type]
        }

        return {
            ...typeDescription,
            count
        }
    }))
}

export const getIntegrationsByTypes = (integrations = [], types = []) => (
    integrations.filter(inte => types.includes(inte.get('type', '')))
)

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

