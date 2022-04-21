import {getIconFromUrl} from '../../utils'
import {TYPE_TO_IMAGE_PATH} from './constants'

export const getIconFromActionType = (type: string): string => {
    const url = TYPE_TO_IMAGE_PATH[type] || ''
    return getIconFromUrl(url)
}
