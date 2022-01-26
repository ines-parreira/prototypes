import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'

import {INTEGRATION_TYPE_DESCRIPTIONS} from '../../config'
import {getIconFromUrl} from '../../utils'

export const getIntegrationsByTypes = (
    integrations: List<any> = fromJS([]),
    types: Array<string> = []
): List<any> =>
    integrations.filter((inte: Map<any, any>) =>
        types.includes(inte.get('type', ''))
    ) as List<any>

export const getIntegrationConfig = (type: string) => {
    return _find(INTEGRATION_TYPE_DESCRIPTIONS, {type})
}

export const getIconUrl = (type: string): string => {
    const config = getIntegrationConfig(type)
    return config && typeof config === 'object' && config.image
        ? config.image
        : ''
}

export const getIconFromType = (type: string): string => {
    return getIconFromUrl(getIconUrl(type))
}
