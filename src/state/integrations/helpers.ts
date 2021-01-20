import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'

import {INTEGRATION_TYPE_DESCRIPTIONS} from '../../config'

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
