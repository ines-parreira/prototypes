import intercomSchema from 'pages/standalone/assets/httpSchemas/ticket-intercom.json'
import zendeskSchema from 'pages/standalone/assets/httpSchemas/ticket-zendesk.json'

import type { HelpdeskIntegration } from './types'

export const TICKET_HANDOVER_TRIGGER = 'ticket-handed-over'
export const HANDOVER_DEFAULT_METHOD = 'POST'
export const HANDOVER_DEFAULT_CONTENT_TYPE = 'application/json'
export const HANDOVER_INTEGRATION_NAME_PREFIX = 'AIAgentHandoverWebhook::'
export const EMAIL_INTEGRATION_PATH = '/app/settings/channels/email/new'

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
        active: true,
    },
    intercom: {
        schema: JSON.stringify(intercomSchema),
        requiredFields: {
            accessToken: {
                label: 'Auth Bearer Token',
                slug: 'accessToken',
                secret: true,
            },
            leadId: {
                label: 'Lead User ID',
                slug: 'leadId',
                secret: false,
            },
        },
        label: 'Intercom',
        active: false,
    },
}

export enum HandoverMethods {
    EMAIL = 'email',
    GORGIAS = 'gorgias',
    WEBHOOK = 'webhook',
}
