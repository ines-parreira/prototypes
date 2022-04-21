import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'

import {IntegrationConfig, INTEGRATION_TYPE_CONFIG} from 'config'
import {IntegrationType} from 'models/integration/constants'
import {getIconFromUrl} from '../../utils'

export const getIntegrationsByTypes = (
    integrations: List<any> = fromJS([]),
    types: Array<string> = []
): List<any> =>
    integrations.filter((inte: Map<any, any>) =>
        types.includes(inte.get('type', ''))
    ) as List<any>

export const getIntegrationConfig = (
    type: IntegrationType
): IntegrationConfig | undefined => {
    return _find(INTEGRATION_TYPE_CONFIG, {type})
}

export const getIconUrl = (type: IntegrationType): string => {
    const config = getIntegrationConfig(type)
    return config && typeof config === 'object' && config.image
        ? config.image
        : ''
}

export const getIconFromType = (type: IntegrationType): string => {
    return getIconFromUrl(`integrations/${getIconUrl(type)}`)
}
