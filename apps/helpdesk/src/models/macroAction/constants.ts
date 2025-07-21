import { MacroActionName } from './types'

export const TYPE_TO_IMAGE_PATH: Record<string, string> = {
    http: 'integrations/http.png',
    shopify: 'integrations/shopify.png',
    recharge: 'integrations/recharge.svg',
    [MacroActionName.AddInternalNote]: 'icons/gorgias-icon-logo-black.png',
}
