// g/integrations/zendesk/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

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
    status?: string
    error?: string
    display_import_stats?: string
    continuous_import_enabled?: boolean
}

export const isZendeskIntegration = createTypeGuard<
    Maybe<Integration>,
    ZendeskIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Zendesk ? input : undefined
)
