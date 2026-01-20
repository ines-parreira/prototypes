import type { MetafieldType } from '@gorgias/helpdesk-types'

import { SUPPORTED_METAFIELD_TYPES } from '../constants'

export const isSupportedMetafieldType = (type?: MetafieldType): boolean => {
    return !!(type && SUPPORTED_METAFIELD_TYPES.includes(type))
}
