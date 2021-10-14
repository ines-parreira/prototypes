// g/integrations/klaviyo/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type KlaviyoIntegration = IntegrationBase & {
    type: IntegrationType.Klaviyo
    meta: KlaviyoIntegrationMeta
}

export type KlaviyoIntegrationMeta = {
    api: {
        public_key: string
    }
    event_sync: {
        ticket_created: boolean
        ticket_closed: boolean
        csat_sent: boolean
        csat_responded: boolean
    }
    customer_sync: {
        enable_customer_sync: boolean
        lists?: KlaviyoList
    }
    sync_status?: Maybe<KlaviyoSyncStatus>
    initial_sync?: SyncState
}

enum KlaviyoSyncStatus {
    Syncing = 'syncing',
    Synced = 'synced',
}

type KlaviyoList = {
    data?: KlaviyoListItem[]
    default?: Maybe<string>
}

type KlaviyoListItem = {
    list_id: string
    list_name: string
}

type KlaviyoSyncStateItem = {
    is_over?: boolean
    oldest_synced_at?: string
}

type SyncState = {
    ticket_created: KlaviyoSyncStateItem
    ticket_closed: KlaviyoSyncStateItem
    csat_sent: KlaviyoSyncStateItem
    csat_responded: KlaviyoSyncStateItem
    customer: KlaviyoSyncStateItem
}

export const isKlaviyoIntegration = createTypeGuard<
    Maybe<Integration>,
    KlaviyoIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Klaviyo ? input : undefined
)
