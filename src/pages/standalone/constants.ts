import intercomSchema from 'pages/standalone/assets/httpSchemas/ticket-intercom.json'
import zendeskSchema from 'pages/standalone/assets/httpSchemas/ticket-zendesk.json'

import { HelpdeskIntegration } from './types'

export const TICKET_HANDOVER_TRIGGER = 'ticket-handed-over'
export const HANDOVER_DEFAULT_METHOD = 'POST'
export const HANDOVER_DEFAULT_CONTENT_TYPE = 'application/json'
export const HANDOVER_INTEGRATION_NAME_PREFIX = 'AIAgentHandoverWebhook::'
export const INTEGRATIONS_MAPPING: HelpdeskIntegration = {
    zendesk: {
        schema: JSON.stringify(zendeskSchema),
        requiredFields: {
            subdomain: {
                label: 'Subdomain',
                slug: 'subdomain',
                secret: false,
            },
            basicToken: {
                label: 'Basic Auth Token',
                slug: 'basicToken',
                secret: true,
            },
        },
        label: 'Zendesk',
    },
    intercom: {
        schema: JSON.stringify(intercomSchema),
        requiredFields: {
            accessToken: {
                label: 'Auth Bearer Token',
                slug: 'accessToken',
                secret: true,
            },
        },
        label: 'Intercom',
    },
}
