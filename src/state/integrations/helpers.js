// @flow
import {fromJS, type List, type Map} from 'immutable'
import _find from 'lodash/find'

import {INTEGRATION_TYPE_DESCRIPTIONS} from '../../config'

type integrationsType = List<Map<*, *>>

/**
 * Compute the number of active integrations for each type
 */
const getIntegrationsCountPerType = (
    integrations: integrationsType = fromJS([])
): Object => {
    return integrations.reduce((accumulator, item) => {
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
export const getIntegrationsList = (
    integrations: integrationsType = fromJS([])
): Map<*, *> => {
    const counts = getIntegrationsCountPerType(integrations)
    return fromJS(
        INTEGRATION_TYPE_DESCRIPTIONS.map((typeDescription: Object) => {
            let count = 0

            if (typeDescription.subTypes) {
                // make sum of all count of sub types
                typeDescription.subTypes.forEach((type) => {
                    if (counts[type]) {
                        count += counts[type]
                    }
                })
            } else {
                count += counts[typeDescription.type]
            }

            return {
                ...typeDescription,
                count,
            }
        })
    )
}

export const getIntegrationsByTypes = (
    integrations: integrationsType = fromJS([]),
    types: Array<string> = []
): integrationsType =>
    integrations.filter((inte) => types.includes(inte.get('type', '')))

export const getIntegrationConfig = (type: string): {image?: string} => {
    //$FlowFixMe
    return _find(INTEGRATION_TYPE_DESCRIPTIONS, {type})
}

export const getIconUrl = (type: string): string => {
    const config = getIntegrationConfig(type)
    return config && config.image ? config.image : ''
}

export const getIconFromUrl = (url: string): string => {
    return url ? require(`../../../img/${url}`) : ''
}

export const getIconFromType = (type: string): string => {
    return getIconFromUrl(getIconUrl(type))
}
