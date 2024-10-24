// g/integrations/zendesk/schemas.py
import {ImportStatus} from 'pages/settings/importData/zendesk/types'

import {IntegrationType} from '../constants'
import type {Integration} from './'
import type {IntegrationBase} from './base'

export type ZendeskIntegration = IntegrationBase & {
    type: IntegrationType.Zendesk
    meta: ZendeskIntegrationMeta
}

export type ZendeskIntegrationMeta = {
    sync_tickets: {
        start_time?: number
        count?: number
    }
    sync_macros: {
        is_synced?: boolean
        count?: number
    }
    sync_users: {
        customers_count?: number
        users_count?: number
    }
    account_stats: {
        tickets_count?: number
    }
    status?: ImportStatus
    error?: string
    display_import_stats?: boolean
    continuous_import_enabled?: boolean
}

export const isZendeskIntegration = (
    integration: Maybe<Integration>
): integration is ZendeskIntegration =>
    integration?.type === IntegrationType.Zendesk
