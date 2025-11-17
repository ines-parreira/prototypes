import { INTEGRATIONS_MAPPING } from 'pages/standalone/constants'
import type { HelpdeskIntegrationOptions } from 'pages/standalone/types'

export const getWebhookRequiredFields = (
    integration: HelpdeskIntegrationOptions,
): Record<string, string> => {
    return Object.keys(INTEGRATIONS_MAPPING[integration].requiredFields).reduce(
        (acc, key) => ({
            ...acc,
            [key]: '',
        }),
        {},
    )
}
