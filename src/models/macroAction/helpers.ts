import _find from 'lodash/find'
import {getIconFromUrl} from '../../utils'
import {ACTION_TYPE_DESCRIPTIONS} from './constants'

export const getActionIconUrl = (type: string): string => {
    const config = _find(ACTION_TYPE_DESCRIPTIONS, {type})
    return config && typeof config === 'object' && config.image
        ? config.image
        : ''
}

export const getIconFromActionType = (type: string): string => {
    return getIconFromUrl(getActionIconUrl(type))
}
