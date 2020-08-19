import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'

import {INTEGRATION_TYPE_DESCRIPTIONS} from '../../config.js'
import {IntegrationType} from '../../models/integration/types'

type IntegrationsCountMap = {
    [key in typeof IntegrationType[keyof typeof IntegrationType]]?: number
}
/**
 * Compute the number of active integrations for each type
 */
const getIntegrationsCountPerType = (
    integrations: List<any> = fromJS([])
): IntegrationsCountMap => {
    return integrations.reduce(
        (accumulator: IntegrationsCountMap = {}, item: Map<any, any>) => {
            const newAccumulator = accumulator

            if (!item.get('deactivated_datetime')) {
                if (item.get('type') in accumulator) {
                    ;(newAccumulator[
                        item.get('type') as keyof IntegrationsCountMap
                    ] as number) += 1
                } else {
                    newAccumulator[
                        item.get('type') as keyof IntegrationsCountMap
                    ] = 1
                }
            }

            return newAccumulator
        },
        {}
    )
}

/**
 * We take a global variable with a list of types and their descriptions as objects and we add the number of
 * integrations for each type to these objects.
 */
export const getIntegrationsList = (
    integrations: List<any> = fromJS([])
): List<any> => {
    const counts = getIntegrationsCountPerType(integrations)
    return fromJS(
        INTEGRATION_TYPE_DESCRIPTIONS.map(
            (
                typeDescription: typeof INTEGRATION_TYPE_DESCRIPTIONS[keyof typeof INTEGRATION_TYPE_DESCRIPTIONS]
            ) => {
                let count = 0

                if (
                    //$TsFixMe remove the typeof condition when config is migrated
                    typeof typeDescription === 'object' &&
                    typeDescription.subTypes
                ) {
                    // make sum of all count of sub types
                    ;(typeDescription.subTypes as (keyof IntegrationsCountMap)[]).forEach(
                        (type) => {
                            if (counts[type]) {
                                count += counts[type] || 0
                            }
                        }
                    )
                } else {
                    count +=
                        //$TsFixMe remove the condition when config is migrated
                        typeof typeDescription === 'object' &&
                        typeDescription.type
                            ? counts[
                                  typeDescription.type as keyof IntegrationsCountMap
                              ] || 0
                            : 0
                }

                return {
                    //$TsFixMe remove the typeof condition when config is migrated
                    ...(typeof typeDescription === 'object'
                        ? typeDescription
                        : {}),
                    count,
                }
            }
        )
    ) as List<any>
}

export const getIntegrationsByTypes = (
    integrations: List<any> = fromJS([]),
    types: Array<string> = []
): List<any> =>
    integrations.filter((inte: Map<any, any>) =>
        types.includes(inte.get('type', ''))
    ) as List<any>

export const getIntegrationConfig = (
    type: string
): Maybe<
    typeof INTEGRATION_TYPE_DESCRIPTIONS[keyof typeof INTEGRATION_TYPE_DESCRIPTIONS]
> => {
    return _find(INTEGRATION_TYPE_DESCRIPTIONS, {type})
}

export const getIconUrl = (type: string): string => {
    const config = getIntegrationConfig(type)
    return config && typeof config === 'object' && config.image
        ? config.image
        : ''
}

export const getIconFromUrl = (url: string): string => {
    //eslint-disable-next-line  @typescript-eslint/no-var-requires
    return url ? (require(`../../../img/${url}`) as string) : ''
}

export const getIconFromType = (type: string): string => {
    return getIconFromUrl(getIconUrl(type))
}
