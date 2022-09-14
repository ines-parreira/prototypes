import {IntegrationType, ZendeskIntegration} from 'models/integration/types'
import {ImportStatus} from '../types'

export const successImport = {
    id: 1,
    name: 'gorgias-au',
    created_datetime: '2020-11-26T18:19:41',
    updated_datetime: '2020-11-27T18:19:41',
    meta: {
        status: ImportStatus.Success,
        sync_tickets: {
            count: 100,
        },
        account_stats: {
            tickets_count: 100,
        },
        display_import_stats: true,
    },
    type: IntegrationType.Zendesk,
} as unknown as ZendeskIntegration

export const pendingImport = {
    id: 2,
    name: 'gorgias-us',
    created_datetime: '2020-09-26T18:19:41',
    updated_datetime: '2020-10-27T18:19:41',
    meta: {
        status: ImportStatus.Pending,
        sync_tickets: {
            count: 100,
        },
        account_stats: {
            tickets_count: 1000,
        },
        display_import_stats: true,
    },
    type: IntegrationType.Zendesk,
} as unknown as ZendeskIntegration

export const failedImport = {
    id: 3,
    name: 'gorgias-eu',
    created_datetime: '2020-09-26T18:19:41',
    updated_datetime: '2020-10-27T18:19:41',
    meta: {
        status: ImportStatus.Failure,
        sync_tickets: {
            count: 100,
        },
        account_stats: {
            tickets_count: 0,
        },
        error: 'Import failed because of permissions issues.',
        display_import_stats: true,
    },
    type: IntegrationType.Zendesk,
} as unknown as ZendeskIntegration

export const timezoneUtc = 'UTC'
export const timezoneParis = 'Europe/Paris'
